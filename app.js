import React from "react"
import ReactDOM from "react-dom"
import * as lucide from "lucide-react"

const FormBuilder = () => {
  const [fields, setFields] = React.useState([])
  const [selectedField, setSelectedField] = React.useState(null)

  const addField = (type) => {
    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: "",
      required: false,
      ...(["select", "checkbox", "radio"].includes(type) && {
        options: ["Option 1", "Option 2", "Option 3"],
      }),
    }
    setFields([...fields, newField])
    setSelectedField(newField)
  }

  const updateField = (id, updates) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
    if (selectedField?.id === id) {
      setSelectedField({ ...selectedField, ...updates })
    }
  }

  const deleteField = (id) => {
    setFields(fields.filter((field) => field.id !== id))
    if (selectedField?.id === id) {
      setSelectedField(null)
    }
  }

  const moveField = (fromIndex, toIndex) => {
    const newFields = [...fields]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    setFields(newFields)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Form Builder</h1>
            <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all">
              Save Form
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Form Builder Section */}
        <div className="flex flex-1">
          {/* Field Palette */}
          <FieldPalette onAddField={addField} />

          {/* Form Canvas */}
          <FormCanvas
            fields={fields}
            selectedField={selectedField}
            onSelectField={setSelectedField}
            onDeleteField={deleteField}
            onMoveField={moveField}
            onAddField={addField}
          />

          {/* Configuration Panel */}
          <FieldConfigPanel field={selectedField} onUpdateField={updateField} />
        </div>
      </div>

      {fields.length > 0 && (
        <div className="border-t border-border bg-muted/30">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <lucide.Eye className="h-5 w-5" />
              Form Preview
            </h2>
            <FormPreview fields={fields} />
          </div>
        </div>
      )}
    </div>
  )
}

const FieldPalette = ({ onAddField }) => {
  const fieldTypes = [
    { type: "text", label: "Text Input", icon: "Type" },
    { type: "email", label: "Email", icon: "Mail" },
    { type: "number", label: "Number", icon: "Hash" },
    { type: "textarea", label: "Textarea", icon: "AlignLeft" },
    { type: "select", label: "Select", icon: "ChevronDown" },
    { type: "checkbox", label: "Checkbox", icon: "Check" },
    { type: "radio", label: "Radio", icon: "Circle" },
  ]

  return (
    <div className="w-64 bg-card border-r border-border h-screen overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Form Fields</h3>
        <div className="space-y-2">
          {fieldTypes.map((field) => {
            const IconComponent = lucide[field.icon]
            return (
              <button
                key={field.type}
                onClick={() => onAddField(field.type)}
                className="w-full p-3 text-left bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground rounded-md transition-all flex items-center gap-3"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm">{field.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const FormCanvas = ({ fields, selectedField, onSelectField, onDeleteField, onMoveField, onAddField }) => {
  const [draggedIndex, setDraggedIndex] = React.useState(null)
  const [dragOverIndex, setDragOverIndex] = React.useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      onMoveField(draggedIndex, index)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="flex-1 bg-muted/30 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Form Builder</h2>

          {fields.length === 0 ? (
            <div className="text-center py-12">
              <lucide.Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No fields added yet</p>
              <p className="text-sm text-muted-foreground">
                Drag fields from the left panel to start building your form
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => onSelectField(field)}
                  className={`p-4 border rounded-md cursor-pointer transition-all field-item ${
                    selectedField?.id === field.id ? "selected" : "border-border hover:border-primary"
                  } ${dragOverIndex === index ? "drag-over" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <lucide.GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{field.label}</p>
                        <p className="text-sm text-muted-foreground capitalize">{field.type} field</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteField(field.id)
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <lucide.Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const FieldConfigPanel = ({ field, onUpdateField }) => {
  if (!field) {
    return (
      <div className="w-80 bg-card border-l border-border p-4">
        <div className="text-center py-12">
          <lucide.Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a field to configure</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (key, value) => {
    onUpdateField(field.id, { [key]: value })
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    onUpdateField(field.id, { options: newOptions })
  }

  const addOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    onUpdateField(field.id, { options: newOptions })
  }

  const removeOption = (index) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || []
    onUpdateField(field.id, { options: newOptions })
  }

  return (
    <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-foreground mb-4">Field Configuration</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => handleInputChange("label", e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => handleInputChange("placeholder", e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={field.required || false}
            onChange={(e) => handleInputChange("required", e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="required" className="text-sm text-foreground">
            Required field
          </label>
        </div>

        {["select", "checkbox", "radio"].includes(field.type) && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Options</label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <lucide.X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full px-3 py-2 border border-dashed border-border rounded-md text-muted-foreground hover:text-foreground hover:border-primary transition-all"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const FormPreview = ({ fields }) => {
  const [formData, setFormData] = React.useState({})
  const [errors, setErrors] = React.useState({})

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    fields.forEach((field) => {
      if (field.required && (!formData[field.id] || formData[field.id] === "")) {
        newErrors[field.id] = `${field.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      alert("Form submitted successfully!\n\n" + JSON.stringify(formData, null, 2))
    }
  }

  const renderField = (field) => {
    const hasError = errors[field.id]
    const baseClasses = `w-full px-3 py-2 border rounded-md transition-all focus:ring-2 focus:ring-primary ${
      hasError ? "border-red-500 bg-red-50" : "border-border bg-input"
    } text-foreground`

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseClasses}
            required={field.required}
          />
        )

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${baseClasses} min-h-[100px] resize-vertical`}
            required={field.required}
          />
        )

      case "select":
        return (
          <select
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseClasses}
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[field.id] || []
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option)
                    handleInputChange(field.id, newValues)
                  }}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="border-border"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            </div>
          ))}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all font-medium"
          >
            Submit Form
          </button>
        </form>
      </div>
    </div>
  )
}

ReactDOM.render(<FormBuilder />, document.getElementById("root"))
