'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle2, Send, Edit, FileText, ArrowLeft } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { FieldRenderer } from '@/components/form-builder/field-renderer'
import { useToast } from '@/hooks/use-toast'

// Phone validation data (same as in form-preview)
const PHONE_COUNTRIES = {
  US: { dial: "+1", len: 10 },
  IN: { dial: "+91", len: 10 },
  GB: { dial: "+44", len: 10 },
  CA: { dial: "+1", len: 10 },
  AU: { dial: "+61", len: 9 },
}

function base64urlDecode(input) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4)
  return typeof window !== 'undefined' ? window.atob(b64) : ''
}

function safeDecodeToken(token) {
  try {
    const json = decodeURIComponent(base64urlDecode(token))
    const parsed = JSON.parse(json)
    return parsed
  } catch (e) {
    console.error('Invalid token', e)
    return null
  }
}

// Validation function (similar to form-preview)
const validateField = (field, value) => {
  const errors = []

  // Required validation
  if (field.required) {
    if (field.type === "checkbox" || (field.type === "select" && field.validation?.multiple)) {
      if (!Array.isArray(value) || value.length === 0) {
        errors.push("This field is required")
      }
    } else if (field.type === "file") {
      if (!value) {
        errors.push("Please select a file")
      }
    } else if (field.type === "location") {
      const v = value || {}
      if (!v.country) {
        errors.push("Please select a country")
      } else if (!v.state) {
        errors.push("Please select a state")
      } else if (!v.city) {
        errors.push("Please select a city")
      }
    } else if (field.type === "phone") {
      const v = value || {}
      if (!v.country) {
        errors.push("Please select a country code")
      } else if (!v.number || String(v.number).trim() === "") {
        errors.push("Please enter a phone number")
      }
    } else if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push("This field is required")
    }
  }

  // Add other validation rules as needed...
  return errors.length > 0 ? errors[0] : undefined
}

export default function PublicFormPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token || ''
  const { toast } = useToast()

  const [submissionState, setSubmissionState] = useState('editing') // 'editing', 'submitted', 'reviewing'
  const [submissionId, setSubmissionId] = useState(null)

  const payload = useMemo(() => safeDecodeToken(token), [token])
  const fields = Array.isArray(payload?.fields) ? payload.fields : []

  // Get existing submission if editing
  const existingSubmission = useMemo(() => {
    if (submissionState === 'reviewing' && submissionId) {
      const storeKey = `public-form:${token}:submissions`
      const submissions = JSON.parse(localStorage.getItem(storeKey) || '[]')
      return submissions.find(sub => sub.id === submissionId)
    }
    return null
  }, [submissionState, submissionId, token])

  const form = useForm({
    defaultValues: existingSubmission?.values || fields.reduce((acc, field) => {
      acc[field.id] =
        field.type === "checkbox" || (field.type === "select" && field.validation?.multiple)
          ? []
          : field.type === "file"
            ? null
            : field.type === "location"
              ? {}
              : field.type === "phone"
                ? {}
                : ""
      return acc
    }, {}),
    onSubmit: async ({ value }) => {
      try {
        const storeKey = `public-form:${token}:submissions`
        const submissions = JSON.parse(localStorage.getItem(storeKey) || '[]')
        
        const submissionData = {
          id: submissionId || `submission-${Date.now()}`,
          submittedAt: new Date().toISOString(),
          values: value,
          formTitle: payload?.title || "Untitled Form",
          lastEdited: new Date().toISOString()
        }

        if (submissionId) {
          // Update existing submission
          const index = submissions.findIndex(sub => sub.id === submissionId)
          if (index !== -1) {
            submissions[index] = { ...submissions[index], ...submissionData }
          }
        } else {
          // New submission
          submissions.push(submissionData)
        }

        localStorage.setItem(storeKey, JSON.stringify(submissions))
        
        setSubmissionId(submissionData.id)
        setSubmissionState('submitted')
        
        toast({ 
          title: submissionId ? 'Response Updated' : 'Response Submitted', 
          description: submissionId 
            ? 'Your response has been updated successfully.' 
            : 'Thanks! Your response has been recorded.',
          variant: 'default'
        })
      } catch (error) {
        toast({
          title: 'Submission failed',
          description: 'There was an error saving your response.',
          variant: 'destructive'
        })
      }
    },
  })

  const handleEditResponse = () => {
    setSubmissionState('reviewing')
  }

  const handleNewResponse = () => {
    setSubmissionState('editing')
    setSubmissionId(null)
    form.reset()
  }

  const handleBackToForm = () => {
    setSubmissionState('editing')
  }

  if (!payload || fields.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Invalid or expired form link</h3>
          <p className="text-muted-foreground mb-4">
            Please contact the form owner for a new link.
          </p>
          <Button onClick={() => router.push('/')}>
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  // Success Screen - After Submission
  if (submissionState === 'submitted') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-md w-full text-center">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Response Submitted!
              </h2>
              
              <p className="text-gray-600 mb-2">
                Thank you for your submission.
              </p>
              
              <p className="text-sm text-gray-500 mb-8">
                Your response has been recorded successfully.
              </p>

              <div className="space-y-3">
                <Button 
                  onClick={handleEditResponse}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit Response
                </Button>
                
                <Button 
                  onClick={handleNewResponse}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Submit Another Response
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => router.push('/')}
                  variant="ghost"
                  className="gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Review Screen - When editing existing submission
  if (submissionState === 'reviewing') {
    return (
      <div className="min-h-dvh overflow-y-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={handleBackToForm}
              variant="ghost"
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
            
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Edit className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Editing Your Response</h3>
                  <p className="text-blue-700 text-sm">
                    You are editing your previous submission from {new Date(existingSubmission?.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {payload.title || "Generated Form"} - Review Response
              </CardTitle>
              {payload.description && (
                <p className="text-sm text-muted-foreground">
                  {payload.description}
                </p>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize">{field.type} field</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <FieldRenderer 
                        field={field} 
                        value={form.getFieldValue(field.id)} 
                        onChange={(value) => form.setFieldValue(field.id, value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  {fields.length} {fields.length === 1 ? 'field' : 'fields'} • {' '}
                  {fields.filter(f => f.required).length} required
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleBackToForm}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  
                  <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                      <Button 
                        type="button"
                        onClick={() => form.handleSubmit()}
                        disabled={!canSubmit} 
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {isSubmitting ? 'Updating...' : 'Update Response'}
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Form - Editing State
  return (
    <div className="min-h-dvh overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">{payload.title || "Public Form"}</h1>
          <p className="text-muted-foreground">
            {payload.description || "Fill and submit this form. All fields with asterisk (*) are required."}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {payload.title || "Generated Form"}
            </CardTitle>
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
                    onChange: ({ value }) => validateField(field, value),
                    onSubmit: ({ value }) => validateField(field, value),
                  }}
                >
                  {(fieldApi) => (
                    <div className="space-y-2">
                      <FieldRenderer
                        field={field}
                        value={fieldApi.state.value}
                        onChange={fieldApi.handleChange}
                        invalid={fieldApi.state.meta.errors.length > 0}
                        error={fieldApi.state.meta.errors.length > 0 ? fieldApi.state.meta.errors[0] : undefined}
                      />
                    </div>
                  )}
                </form.Field>
              ))}

              <Separator />

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  {fields.length} {fields.length === 1 ? 'field' : 'fields'} • {' '}
                  {fields.filter(f => f.required).length} required
                </div>

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button 
                      type="submit" 
                      disabled={!canSubmit} 
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Submitting...' : 'Submit Form'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Form Submission History */}
        {(() => {
          const storeKey = `public-form:${token}:submissions`
          const submissions = JSON.parse(localStorage.getItem(storeKey) || '[]')
          
          if (submissions.length > 0) {
            return (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Your Previous Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions.slice(-3).reverse().map((submission, index) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">
                            Submission {submissions.length - index}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setSubmissionId(submission.id)
                            setSubmissionState('reviewing')
                            // Pre-fill form with existing data
                            Object.entries(submission.values).forEach(([key, value]) => {
                              form.setFieldValue(key, value)
                            })
                          }}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          }
          return null
        })()}
      </div>
    </div>
  )
}