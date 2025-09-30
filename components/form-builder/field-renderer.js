"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

export function FieldRenderer({ field, value, onChange, disabled = false }) {
  const renderField = () => {
    switch (field.type) {
      case "location": {
        const current = value || { country: "", state: "", city: "" }
        // Simple sample data; in real-world, fetch dynamically
        const countries = field.locations?.countries || ["India", "USA"]
        const statesByCountry = field.locations?.statesByCountry || {
          India: ["Gujarat", "Maharashtra", "Rajasthan"],
          USA: ["California", "Texas", "New York"],
        }
        const citiesByState = field.locations?.citiesByState || {
          Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
          Maharashtra: ["Mumbai", "Pune", "Nagpur"],
          Rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
          California: ["Los Angeles", "San Francisco", "San Diego"],
          Texas: ["Austin", "Houston", "Dallas"],
          "New York": ["New York City", "Buffalo", "Rochester"],
        }

        const selectedCountry = current.country || ""
        const availableStates = selectedCountry ? statesByCountry[selectedCountry] || [] : []
        const selectedState = current.state || ""
        const availableCities = selectedState ? citiesByState[selectedState] || [] : []

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select
              value={selectedCountry}
              onValueChange={(v) => onChange?.({ country: v, state: "", city: "" })}
              disabled={disabled}
            >
              <SelectTrigger className="bg-input">
                <SelectValue placeholder={field.placeholder || "Country"} />
              </SelectTrigger>
              <SelectContent className="bg-white text-foreground dark:bg-slate-800 dark:text-foreground border border-border shadow-md z-[100]">
                {countries.map((c) => (
                  <SelectItem key={c} value={c} className="cursor-pointer">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedState}
              onValueChange={(v) => onChange?.({ ...current, state: v, city: "" })}
              disabled={disabled || !selectedCountry}
            >
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="bg-white text-foreground dark:bg-slate-800 dark:text-foreground border border-border shadow-md z-[100]">
                {availableStates.map((s) => (
                  <SelectItem key={s} value={s} className="cursor-pointer">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={current.city || ""}
              onValueChange={(v) => onChange?.({ ...current, city: v })}
              disabled={disabled || !selectedState}
            >
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="bg-white text-foreground dark:bg-slate-800 dark:text-foreground border border-border shadow-md z-[100]">
                {availableCities.map((ci) => (
                  <SelectItem key={ci} value={ci} className="cursor-pointer">
                    {ci}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }
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
          // Multi-select with Popover + Command
          const selectedValues = Array.isArray(value) ? value : []
          const displayLabel = selectedValues.length
            ? `${selectedValues.length} selected`
            : field.placeholder || "Select options"

          return (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {displayLabel}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-56 bg-white text-foreground dark:bg-slate-800 dark:text-foreground" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {field.options
                        ?.filter((option) => option && option.trim() !== "")
                        .map((option, index) => {
                          const checked = selectedValues.includes(option)
                          return (
                            <CommandItem
                              key={`${field.id}-${index}-${option}`}
                              value={option}
                              onSelect={() => {
                                if (!onChange) return
                                const current = Array.isArray(value) ? value : []
                                if (current.includes(option)) {
                                  onChange(current.filter((v) => v !== option))
                                } else {
                                  onChange([...current, option])
                                }
                              }}
                            >
                              <span className="mr-2 flex h-4 w-4 items-center justify-center">
                                <Check className={`h-4 w-4 ${checked ? "opacity-100" : "opacity-0"}`} />
                              </span>
                              <span className="truncate">{option}</span>
                            </CommandItem>
                          )
                        })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )
        } else {
          // Single select with Radix Select
          return (
            <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent className="bg-white text-foreground dark:bg-slate-800 dark:text-foreground border border-border shadow-md z-[100]">
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
