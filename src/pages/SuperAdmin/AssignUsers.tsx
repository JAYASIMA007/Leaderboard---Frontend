"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, Loader2, User, X } from "lucide-react"

interface Admin {
  name: string
  admin_id: string
  users: { email: string }[]
}

interface TaskDocument {
  _id: string;  // Changed from event_id to _id to match backend structure
  event_name: string;
  assigned_to: { name: string; admin_id: string }[];
}

const AssignUsers: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const [task, setTask] = useState<TaskDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState<{ [key: string]: string[] }>({})
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTaskAndAssignedUsers = async () => {
      try {
        setLoading(true)
        setError("")

        // Fetch task details
        const taskResponse = await axios.get(`http://13.54.119.187:8000/api/superadmin/fetch_all_tasks/`)
        console.log("Task response:", taskResponse.data)
        // Change this line to look for _id instead of event_id
        const taskData = taskResponse.data.tasks.find((t: any) => t._id === eventId)
        if (!taskData) {
          setError("Event not found in tasks")
          setLoading(false)
          return
        }
        setTask(taskData)

        // Initialize formData and inputValues
        const initialFormData: { [key: string]: string[] } = {}
        const initialInputValues: { [key: string]: string } = {}
        taskData.assigned_to.forEach((admin: { admin_id: string }) => {
          initialFormData[admin.admin_id] = []
          initialInputValues[admin.admin_id] = ""
        })

        // Fetch assigned users from Mapped_Events - keep using eventId as it's correct
        try {
          const mappedResponse = await axios.get(`http://13.54.119.187:8000/api/superadmin/fetch_mapped_events/${eventId}`)
          console.log("Mapped events response:", mappedResponse.data)
          const mappedData = mappedResponse.data
          if (mappedData && mappedData.assigned_admins) {
            mappedData.assigned_admins.forEach((admin: Admin) => {
              if (initialFormData[admin.admin_id]) {
                initialFormData[admin.admin_id] = admin.users.map((user) => user.email)
              }
            })
          }
        } catch (err: any) {
          console.warn("No mapped events found or error fetching mapped events:", err.response?.data || err.message)
          // Continue even if no mapped events are found
        }

        setFormData(initialFormData)
        setInputValues(initialInputValues)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.response?.data?.error || "Failed to fetch event or assigned users")
      } finally {
        setLoading(false)
      }
    }
    fetchTaskAndAssignedUsers()
  }, [eventId])

  


  const handleInputChange = (adminId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [adminId]: value }))
  }

  const handleKeyDown = (adminId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const email = inputValues[adminId]?.trim()
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (!formData[adminId]?.includes(email)) {
          setFormData((prev) => ({
            ...prev,
            [adminId]: [...(prev[adminId] || []), email],
          }))
          setInputValues((prev) => ({ ...prev, [adminId]: "" }))
          setError("") // Clear any previous errors
        } else {
          setError(`Email ${email} is already assigned to this admin`)
        }
      } else if (email) {
        setError(`Invalid email format: ${email}`)
      }
    }
  }

  const removeEmail = async (adminId: string, emailToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      [adminId]: prev[adminId].filter((email) => email !== emailToRemove),
    }))
    setError("")

    // Call the API to remove the email from the backend
    await removeEmailApi(adminId, emailToRemove)
  }

  const removeEmailApi = async (adminId: string, emailToRemove: string) => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const payload = {
        event_id: eventId,
        admin_id: adminId,
        email: emailToRemove,
      }

      const response = await axios.post("http://13.54.119.187:8000/api/superadmin/remove_user/", payload)
      setSuccess(response.data.message)
    } catch (err: any) {
      console.error("Error removing email:", err)
      setError(err.response?.data?.error || "Failed to remove email")
    } finally {
      setLoading(false)
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setSuccess("")

  // Prepare assignments
  const assignments: { admin_id: string; emails: string[] }[] = []
  for (const adminId in formData) {
    const emails = formData[adminId]
    if (emails.length > 0) {
      assignments.push({ admin_id: adminId, emails })
    }
  }

  if (assignments.length === 0) {
    setError("Please add at least one email to assign users")
    return
  }

  try {
    setLoading(true)
    const payload = {
      event_id: eventId, // This is already correct - using the URL param
      assignments,
    }
    console.log("Submitting payload:", payload)
    const response = await axios.post("http://13.54.119.187:8000/api/superadmin/assign_users/", payload)
    console.log("Assign users response:", response.data)
    setSuccess(response.data.message)
    setTimeout(() => navigate("/superadmin/EventListing"), 2000)
  } catch (err: any) {
    console.error("Error submitting assignments:", err)
    setError(err.response?.data?.error || "Failed to assign users")
  } finally {
    setLoading(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 text-center max-w-md w-full">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{error}</p>
          <button
            onClick={() => navigate("/superadmin/EventListing")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/superadmin/EventListing")}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-6 px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium">Back to Events</span>
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Assign Users for {task.event_name}
                  </h1>
                  <p className="text-sm text-gray-600">Enter student email IDs to assign them to admins (press Enter or comma to add)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center">
            <AlertCircle className="w-6 h-6 mr-3" />
            <p>{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center">
            <CheckCircle className="w-6 h-6 mr-3" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-semibold mb-2">User Assignment</h2>
            <p className="text-blue-100">Manage student email assignments for admins</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {task.assigned_to.map((admin) => (
                <div key={admin.admin_id} className="bg-gradient-to-r from-gray-50 to-indigo-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <User className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="text-md font-semibold text-gray-900">{admin.name} ({admin.admin_id})</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Student Emails</label>
                    
                    {/* Added Students Display Area */}
                    {formData[admin.admin_id]?.length > 0 && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-500 mb-2">
                          Added Students ({formData[admin.admin_id]?.length || 0})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData[admin.admin_id]?.map((email) => (
                            <div
                              key={email}
                              className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full"
                            >
                              {email}
                              <button
                                type="button"
                                onClick={() => removeEmail(admin.admin_id, email)}
                                className="ml-2 focus:outline-none"
                              >
                                <X className="w-4 h-4 text-indigo-600 hover:text-indigo-800" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Box */}
                    <div className="flex items-center p-3 border-2 border-gray-200 rounded-lg focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all duration-200">
                      <input
                        type="text"
                        placeholder="Enter student email and press Enter or comma"
                        value={inputValues[admin.admin_id] || ""}
                        onChange={(e) => handleInputChange(admin.admin_id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(admin.admin_id, e)}
                        className="flex-1 p-1 border-none focus:outline-none text-gray-700 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const email = inputValues[admin.admin_id]?.trim()
                          if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            if (!formData[admin.admin_id]?.includes(email)) {
                              setFormData((prev) => ({
                                ...prev,
                                [admin.admin_id]: [...(prev[admin.admin_id] || []), email],
                              }))
                              setInputValues((prev) => ({ ...prev, [admin.admin_id]: "" }))
                              setError("")
                            } else {
                              setError(`Email ${email} is already assigned to this admin`)
                            }
                          } else if (email) {
                            setError(`Invalid email format: ${email}`)
                          }
                        }}
                        className="ml-2 px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/superadmin/EventListing")}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold disabled:opacity-50 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Assigning Users...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-3" />
                      Assign Users
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignUsers