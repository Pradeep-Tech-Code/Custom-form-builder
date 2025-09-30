"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Type,
  Mail,
  Hash,
  ChevronDown,
  CheckSquare,
  AlignLeft,
  Circle,
  Upload,
  Calendar,
  PanelLeft,
  Lock,
  Unlock,
  MapPin,
} from "lucide-react"

const fieldTypes = [
  { type: "text", label: "Text Input", icon: Type, description: "Single line text" },
  { type: "email", label: "Email", icon: Mail, description: "Email validation" },
  { type: "number", label: "Number", icon: Hash, description: "Numeric input" },
  { type: "textarea", label: "Textarea", icon: AlignLeft, description: "Multi-line text" },
  { type: "select", label: "Select", icon: ChevronDown, description: "Dropdown options" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Multiple choice" },
  { type: "radio", label: "Radio", icon: Circle, description: "Single choice" },
  { type: "file", label: "File Upload", icon: Upload, description: "File attachment" },
  { type: "datetime", label: "Date Time", icon: Calendar, description: "Date and time picker" },
  { type: "location", label: "Location", icon: MapPin, description: "Country → State → City" }, // new type
]

export function FieldPalette({ onAddField, collapsed = false, locked = false, onToggleCollapse, onToggleLock }) {
  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "field", fieldType }))
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div className={`h-full ${collapsed ? "py-4 px-2" : ""}`}>
      <Card className={`m-4 border-0 shadow-none bg-transparent ${collapsed ? "m-2" : ""}`}>
        <CardHeader className={`pb-3 ${collapsed ? "px-0 pb-2" : ""}`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
            {!collapsed && (
              <CardTitle className="text-sm font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full shadow-sm"></div>
                Field Types
              </CardTitle>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${collapsed ? "hover:bg-slate-100" : "hover:bg-slate-100"}`}
                onClick={onToggleCollapse}
                disabled={locked}
                aria-label={locked ? "Sidebar locked" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={locked ? "Sidebar is locked" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <PanelLeft className="h-4 w-4 text-slate-600" />
              </Button>
              {typeof onToggleLock === "function" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-slate-100"
                  onClick={onToggleLock}
                  aria-pressed={locked}
                  aria-label={locked ? "Unlock sidebar" : "Lock sidebar"}
                  title={locked ? "Unlock sidebar" : "Lock sidebar"}
                >
                  {locked ? <Lock className="h-4 w-4 text-slate-700" /> : <Unlock className="h-4 w-4 text-slate-700" />}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={`${collapsed ? "space-y-1 p-0" : "space-y-2 p-4 pt-0"}`}>
          {fieldTypes.map((field) => {
            const Icon = field.icon
            return (
              <Button
                key={field.type}
                variant="ghost"
                className={`w-full ${collapsed ? "justify-center p-2 h-10" : "justify-start h-auto p-3"} field-type-button cursor-grab active:cursor-grabbing rounded-lg`}
                onClick={() => onAddField(field.type)}
                draggable
                onDragStart={(e) => handleDragStart(e, field.type)}
                title={collapsed ? `${field.label} — ${field.description}` : undefined}
              >
                {collapsed ? (
                  <Icon className="h-5 w-5 text-slate-600" />
                ) : (
                  <div className="flex items-start gap-3 w-full">
                    <Icon className="h-4 w-4 mt-0.5 field-icon text-slate-600 transition-colors duration-200" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm text-slate-800">{field.label}</div>
                      <div className="text-xs text-slate-500">{field.description}</div>
                    </div>
                  </div>
                )}
              </Button>
            )
          })}
        </CardContent>
      </Card>

      {/* <Card className={`m-4 border-0 shadow-none bg-transparent ${collapsed ? "m-2" : ""}`}>
        {!collapsed && (
          <>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-orange-800 uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full shadow-sm"></div>
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 border border-transparent rounded-lg"
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-slate-800">Contact Form</div>
                  <div className="text-xs text-slate-500">Name, email, message</div>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 border border-transparent rounded-lg"
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-slate-800">Survey Form</div>
                  <div className="text-xs text-slate-500">Rating, feedback, options</div>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 border border-transparent rounded-lg"
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-slate-800">Registration</div>
                  <div className="text-xs text-slate-500">User signup fields</div>
                </div>
              </Button>
            </CardContent>
          </>
        )}
      </Card> */}
    </div>
  )
}
