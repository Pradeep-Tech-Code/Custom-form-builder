"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LOCATION_DATA = {
  USA: {
    California: ["Los Angeles", "San Francisco", "San Diego"],
    Texas: ["Houston", "Dallas", "Austin"],
    NewYork: ["New York City", "Buffalo", "Rochester"],
  },
  India: {
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru"],
    Delhi: ["New Delhi", "Dwarka", "Rohini"],
  },
  Canada: {
    Ontario: ["Toronto", "Ottawa", "Hamilton"],
    Quebec: ["Montreal", "Quebec City", "Laval"],
    BC: ["Vancouver", "Victoria", "Richmond"],
  },
}

export function FieldRenderer({ field, value, onChange, disabled = false }) {
  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="bg-input"
          />
        )

      case "email":
        return (
          <Input
            type="email"
            placeholder={field.placeholder || "Enter your email"}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="bg-input"
          />
        )

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            min={field.validation?.min}
            max={field.validation?.max}
            className="bg-input"
          />
        )

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || "Enter your message"}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="bg-input min-h-[100px]"
          />
        )

      case "select":
        if (field.validation?.multiple) {
          // Multiple select using checkboxes in a dropdown-like interface
          return (
            <div className="space-y-2">
              <div className="border border-input rounded-md bg-input p-2 min-h-[40px]">
                <div className="text-sm text-muted-foreground mb-2">
                  {Array.isArray(value) && value.length > 0
                    ? `${value.length} selected`
                    : field.placeholder || "Select options"}
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {field.options
                    ?.filter((option) => option && option.trim() !== "")
                    .map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${field.id}-${index}`}
                          checked={Array.isArray(value) ? value.includes(option) : false}
                          onChange={(e) => {
                            if (!onChange) return
                            const currentValue = Array.isArray(value) ? value : []
                            if (e.target.checked) {
                              onChange([...currentValue, option])
                            } else {
                              onChange(currentValue.filter((v) => v !== option))
                            }
                          }}
                          disabled={disabled}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`${field.id}-${index}`} className="text-sm cursor-pointer">
                          {option}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )
        } else {
          // Single select
          return (
            <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-md z-50">
                {field.options
                  ?.filter((option) => option && option.trim() !== "")
                  .map((option, index) => (
                    <SelectItem
                      key={index}
                      value={option || `option-${index}`}
                      className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )
        }

      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onCheckedChange={(checked) => {
                    if (!onChange) return
                    const currentValue = Array.isArray(value) ? value : []
                    if (checked) {
                      onChange([...currentValue, option])
                    } else {
                      onChange(currentValue.filter((v) => v !== option))
                    }
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "radio":
        return (
          <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => onChange?.(e.target.files?.[0] || null)}
            disabled={disabled}
            className="bg-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept={field.validation?.accept}
            multiple={field.validation?.multiple}
          />
        )

      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="bg-input"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case "location": {
        const current = value || {}
        const countries = Object.keys(LOCATION_DATA)
        const states = current.country ? Object.keys(LOCATION_DATA[current.country] || {}) : []
        const cities = current.country && current.state ? LOCATION_DATA[current.country]?.[current.state] || [] : []

        const handleCountry = (country) => {
          onChange?.({ country, state: undefined, city: undefined })
        }
        const handleState = (state) => {
          onChange?.({ country: current.country, state, city: undefined })
        }
        const handleCity = (city) => {
          onChange?.({ country: current.country, state: current.state, city })
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Country</Label>
              <Select value={current.country || ""} onValueChange={handleCountry} disabled={disabled}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {countries.map((c) => (
                    <SelectItem key={c} value={c} className="hover:bg-accent">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">State</Label>
              <Select value={current.state || ""} onValueChange={handleState} disabled={disabled || !current.country}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder={current.country ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {states.map((s) => (
                    <SelectItem key={s} value={s} className="hover:bg-accent">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">City</Label>
              <Select value={current.city || ""} onValueChange={handleCity} disabled={disabled || !current.state}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder={current.state ? "Select city" : "Select state first"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {cities.map((city) => (
                    <SelectItem key={city} value={city} className="hover:bg-accent">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      }

      default:
        return <div className="text-muted-foreground">Unknown field type</div>
    }
  }

  return (
    <div className="space-y-2 w-full">
      <Label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
      {field.validation?.pattern && (
        <p className="text-xs text-muted-foreground">Pattern: {field.validation.pattern}</p>
      )}
    </div>
  )
}
