"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FieldPalette } from "./form-builder/field-palette"
import { FormCanvas } from "./form-builder/form-canvas"
import { FormPreview } from "./form-builder/form-preview"
import { FieldConfigPanel } from "./form-builder/field-config-panel"
import { Eye, Settings, Palette } from "lucide-react"

export function FormBuilder() {
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [mode, setMode] = useState("builder")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarLocked, setSidebarLocked] = useState(false)
  const headerRef = useRef(null)
  const [headerH, setHeaderH] = useState(80)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const measure = () => {
      setHeaderH(el.offsetHeight || 80)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const addField = (type) => {
    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      validation: {},
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
    <div className="flex h-svh form-builder-main">
      {/* Header */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 form-builder-header backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-white/20 to-white/10 rounded-lg shadow-md backdrop-blur-sm">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white drop-shadow-sm">Form Builder</h1>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-white/20 text-white border-white/30 font-medium backdrop-blur-sm"
            >
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* ... existing mode buttons ... */}
            <Button
              variant={mode === "builder" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("builder")}
              className={`gap-2 transition-all duration-200 hover:scale-105 ${
                mode === "builder"
                  ? "bg-white/20 hover:bg-white/30 text-white shadow-md border-white/30 backdrop-blur-sm"
                  : "hover:bg-white/10 text-white hover:border-white/30 border-white/20 backdrop-blur-sm"
              }`}
            >
              <Settings className="h-4 w-4" />
              Builder
            </Button>
            <Button
              variant={mode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("preview")}
              className={`gap-2 transition-all duration-200 hover:scale-105 ${
                mode === "preview"
                  ? "bg-white/20 hover:bg-white/30 text-white shadow-md border-white/30 backdrop-blur-sm"
                  : "hover:bg-white/10 text-white hover:border-white/30 border-white/20 backdrop-blur-sm"
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: headerH }}>
        {mode === "builder" ? (
          <>
            {/* Field Palette */}
            <div
              className={`${
                sidebarCollapsed ? "w-12" : "w-64"
              } transition-[width] duration-200 border-r border-slate-200 bg-background/60 backdrop-blur-sm overflow-hidden`}
            >
              <div style={{ height: `calc(100svh - ${headerH}px)` }} className="overflow-y-auto">
                <FieldPalette
                  onAddField={addField}
                  collapsed={sidebarCollapsed}
                  locked={sidebarLocked}
                  onToggleCollapse={() => {
                    if (sidebarLocked) return
                    setSidebarCollapsed((v) => !v)
                  }}
                />
              </div>
            </div>

            {/* Form Canvas */}
            <div className="flex-1 form-canvas">
              <div style={{ height: `calc(100svh - ${headerH}px)` }} className="overflow-y-auto">
                <FormCanvas
                  fields={fields}
                  selectedField={selectedField}
                  onSelectField={setSelectedField}
                  onDeleteField={deleteField}
                  onMoveField={moveField}
                  onAddField={addField}
                />
              </div>
            </div>

            {/* Configuration Panel */}
            <div className="w-80 config-panel border-l border-slate-200 shadow-sm">
              <div style={{ height: `calc(100svh - ${headerH}px)` }} className="overflow-y-auto">
                <FieldConfigPanel field={selectedField} onUpdateField={updateField} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1">
            <div style={{ height: `calc(100svh - ${headerH}px)` }} className="overflow-y-auto">
              <FormPreview fields={fields} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
