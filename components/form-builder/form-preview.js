"use client"

import { useForm } from "@tanstack/react-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Send } from "lucide-react"
import { FieldRenderer } from "./field-renderer"

export function FormPreview({ fields }) {
  const form = useForm({
    defaultValues: fields.reduce((acc, field) => {
      const isMultiSelect = field.type === "select" && field.validation?.multiple
      if (field.type === "location") {
        acc[field.id] = { country: "", state: "", city: "" }
      } else {
        acc[field.id] = field.type === "checkbox" || isMultiSelect ? [] : field.type === "file" ? null : ""
      }
      return acc
    }, {}),
    onSubmit: async ({ value }) => {
      // Simulate form submission
      console.log("Form submitted:", value)
      alert("Form submitted successfully! Check the console for values.")
    },
  })

  const validateField = (field, value) => {
    const errors = []

    // Required validation
    if (field.required) {
      const isMultiSelect = field.type === "select" && field.validation?.multiple
      if (field.type === "location") {
        const loc = value || {}
        if (!loc.country || !loc.state || !loc.city) {
          errors.push("Please select country, state and city")
        }
      } else if (field.type === "checkbox" || isMultiSelect) {
        if (!Array.isArray(value) || value.length === 0) {
          errors.push("This field is required")
        }
      } else if (field.type === "file") {
        if (!value) {
          errors.push("Please select a file")
        }
      } else if (!value || (typeof value === "string" && value.trim() === "")) {
        errors.push("This field is required")
      }
    }

    // File type validation
    if (field.type === "file" && value && field.validation?.accept) {
      const acceptedTypes = field.validation.accept.split(",").map((type) => type.trim())
      const fileName = value.name || ""
      const fileType = value.type || ""

      const isAccepted = acceptedTypes.some((acceptType) => {
        if (acceptType.startsWith(".")) {
          // File extension check
          return fileName.toLowerCase().endsWith(acceptType.toLowerCase())
        } else if (acceptType.includes("*")) {
          // MIME type wildcard check (e.g., image/*)
          const baseType = acceptType.split("/")[0]
          return fileType.startsWith(baseType + "/")
        } else {
          // Exact MIME type check
          return fileType === acceptType
        }
      })

      if (!isAccepted) {
        errors.push(`File type not allowed. Accepted types: ${field.validation.accept}`)
      }
    }

    // Type-specific validation
    if (value && typeof value === "string" && value.trim() !== "") {
      switch (field.type) {
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            errors.push("Please enter a valid email address")
          }
          break

        case "number":
          const numValue = Number(value)
          if (isNaN(numValue)) {
            errors.push("Please enter a valid number")
          } else {
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              errors.push(`Value must be at least ${field.validation.min}`)
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              errors.push(`Value must be at most ${field.validation.max}`)
            }
          }
          break

        case "text":
        case "textarea":
          if (field.validation?.pattern && field.validation.pattern.trim() !== "") {
            try {
              const pattern = field.validation.pattern.trim()
              if (pattern) {
                const regex = new RegExp(pattern)
                if (!regex.test(value)) {
                  errors.push("Value does not match the required pattern")
                }
              }
            } catch (e) {
              console.warn("Invalid regex pattern:", field.validation.pattern, e.message)
              // Don't add validation error for invalid regex, just warn
            }
          }
          break
      }
    }

    return errors
  }

  if (fields.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Fields to Preview</h3>
          <p className="text-muted-foreground mb-4">
            Switch back to builder mode and add some fields to see the form preview.
          </p>
          <Badge variant="outline" className="text-xs">
            Add fields from the palette to get started
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-visible p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Form Preview</h2>
          <p className="text-muted-foreground">
            This is how your form will appear to users. All validation rules are active.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Generated Form
            </CardTitle>
            <p className="text-sm text-muted-foreground">Fill out the form below to test validation and submission.</p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              {fields.map((field) => (
                <form.Field
                  key={field.id}
                  name={field.id}
                  validators={{
                    onChange: ({ value }) => {
                      const errors = validateField(field, value)
                      return errors.length > 0 ? errors[0] : undefined
                    },
                  }}
                >
                  {(fieldApi) => {
                    const isMultiSelect = field.type === "select" && field.validation?.multiple
                    const normalizedValue = isMultiSelect
                      ? Array.isArray(fieldApi.state.value)
                        ? fieldApi.state.value
                        : []
                      : typeof fieldApi.state.value === "string" || fieldApi.state.value == null
                        ? fieldApi.state.value || ""
                        : ""

                    const handleNormalizedChange = (nextValue) => {
                      if (isMultiSelect) {
                        const arrayValue = Array.isArray(nextValue) ? nextValue : [nextValue].filter(Boolean)
                        fieldApi.handleChange(arrayValue)
                      } else {
                        const stringValue = Array.isArray(nextValue) ? (nextValue[0] || "") : (nextValue ?? "")
                        fieldApi.handleChange(stringValue)
                      }
                    }

                    return (
                      <div className="space-y-2">
                        <FieldRenderer field={field} value={normalizedValue} onChange={handleNormalizedChange} />
                        {fieldApi.state.meta.errors.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            {fieldApi.state.meta.errors[0]}
                          </div>
                        )}
                      </div>
                    )
                  }}
                </form.Field>
              ))}

              <Separator />

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  {fields.length} {fields.length === 1 ? "field" : "fields"} • {fields.filter((f) => f.required).length}{" "}
                  required
                </div>

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit} className="gap-2">
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Submitting..." : "Submit Form"}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Form Data Debug Panel */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Form State (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <form.Subscribe>
              {(state) => (
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                  {JSON.stringify(
                    {
                      values: state.values,
                      errors: state.errors,
                      canSubmit: state.canSubmit,
                      isSubmitting: state.isSubmitting,
                    },
                    null,
                    2,
                  )}
                </pre>
              )}
            </form.Subscribe>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
