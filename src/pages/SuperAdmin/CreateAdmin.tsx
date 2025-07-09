
"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { User, Mail, ArrowLeft, UserPlus, AlertCircle, CheckCircle, Send } from "lucide-react"

interface FormData {
  name: string
  emailId: string
}

interface FormErrors {
  name?: string
  emailId?: string
  general?: string
}

const CreateAdmin: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    emailId: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const navigate = useNavigate()

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    if (field === "name") {
      if (!value.trim()) {
        return "Name is required"
      } else if (value.trim().length < 2) {
        return "Name must be at least 2 characters"
      } else if (!/^[A-Za-z\s]+$/.test(value.trim())) {
        return "Name must contain only letters and spaces"
      }
    } else if (field === "emailId") {
      if (!value.trim()) {
        return "Email is required"
      } else if (/\s/.test(value)) {
        return "Email must not contain spaces"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address"
      }
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    // Validate both fields
    const nameError = validateField("name", formData.name)
    const emailError = validateField("emailId", formData.emailId)

    if (nameError) newErrors.name = nameError
    if (emailError) newErrors.emailId = emailError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Validate field immediately and update errors
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Send data to backend using axios
      const response = await axios.post(
        "http://13.54.119.187:8000/api/superadmin/create-admin/",
        {
          name: formData.name.trim(),
          email: formData.emailId.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        },
      )

      console.log("Email sent successfully:", response.data)
      setSuccess(true)

      // Reset form
      setFormData({
        name: "",
        emailId: "",
      })

      // Redirect after success
      setTimeout(() => {
        navigate("/superadmin/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Error sending email:", error)
      let errorMessage = "Failed to send email. Please try again."

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const serverMessage = error.response.data?.message || error.response.data?.error
          errorMessage = serverMessage || `Server error: ${error.response.status}`
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "Unable to connect to server. Please check your connection."
        } else {
          // Something else happened
          errorMessage = error.message || "An unexpected error occurred."
        }
      }

      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Email Sent Successfully!</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-4 px-2">
            Login credentials have been sent to <strong className="break-all">{formData.emailId}</strong>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border-b border-purple-200/50 shadow-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center w-full sm:w-auto">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 transform hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-30 animate-pulse"></div>
                <UserPlus className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Create New Admin Account
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">
                  Send login credentials to Admin email
                </p>
              </div>
            </div>
            <div className="flex items-center w-full sm:w-auto justify-end">
              <button
                onClick={() => navigate("/superadmin/dashboard")}
                className="flex items-center text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-lg px-3 py-2 text-xs sm:text-sm md:text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
                <span className="xs:hidden">Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-purple-100/50">
          {/* General Error Alert */}
          {errors.general && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start transition-all duration-200">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-xs sm:text-sm font-medium leading-relaxed">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Admin Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter admin full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${errors.name
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center animate-in fade-in duration-200">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="emailId" className="block text-sm font-medium text-slate-700 mb-2">
                Admin Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="emailId"
                  placeholder="admin@example.com"
                  value={formData.emailId}
                  onChange={(e) => handleInputChange("emailId", e.target.value)}
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${errors.emailId
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.emailId && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center animate-in fade-in duration-200">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {errors.emailId}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 hover:bg-blue-100/80 transition-all duration-200">
              <div className="flex items-start">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Email Notification</h4>
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                    Login credentials link will be sent to the admin's email address.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() => navigate("/superadmin/dashboard")}
                className="w-full sm:flex-1 bg-slate-200 text-slate-700 font-medium py-2.5 sm:py-3 px-4 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Sending Email...</span>
                    <span className="sm:hidden">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAdmin
