
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  ArrowLeft,
  Layers,
  Target,
  CheckSquare,
  Award,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  UserPlus,
  CheckCircle,
  Trash,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react"

interface Subtask {
  subtask_id: string
  name: string
  points: number
  deadline: string
  status: string
}

interface Task {
  task_id: string
  task_name: string
  description: string
  subtasks: Subtask[]
  marking_criteria: {
    fully_completed: number
    partially_completed: number
    incomplete: number
  }
  deadline: string
}

interface Level {
  level_id: string
  level_name: string
  tasks: Task[]
}

interface TaskDocument {
  _id: string
  event_name: string
  assigned_to: { name: string; admin_id: string }[]
  levels: Level[]
  created_at: string
  updated_at: string
  has_recurring_tasks: boolean
}

const ViewTasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskDocument[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskDocument[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedLevels, setExpandedLevels] = useState<{ [key: string]: boolean }>({})
  const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await axios.get("https://leaderboard-backend-4uxl.onrender.com/api/superadmin/fetch_all_tasks/")
        setTasks(response.data.tasks)
        setFilteredTasks(response.data.tasks)
      } catch (err: any) {
        console.error("Error fetching tasks:", err)
        setError(err.response?.data?.error || "Failed to fetch tasks")
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        (task.event_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.assigned_to || []).some((admin) => admin.name.toLowerCase().includes(searchQuery.toLowerCase()))

      if (filterStatus === "all") return matchesSearch
      return (
        matchesSearch &&
        task.levels?.some((level) =>
          level.tasks?.some((task) => task.subtasks?.some((subtask) => subtask.status === filterStatus)),
        )
      )
    })
    setFilteredTasks(filtered)
  }, [searchQuery, filterStatus, tasks])

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => ({ ...prev, [levelId]: !prev[levelId] }))
  }

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleAssignUsers = (eventId: string) => {
    navigate(`/superadmin/assign-users/${eventId}`)
  }

  const handleEditEvent = (eventId: string) => {
    navigate(`/superadmin/edit-event/${eventId}`)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        setLoading(true)
        await axios.delete(`https://leaderboard-backend-4uxl.onrender.com/api/superadmin/delete_task/${eventId}/`)
        setTasks(tasks.filter((task) => task._id !== eventId))
        setFilteredTasks(filteredTasks.filter((task) => task._id !== eventId))
        alert("Event deleted successfully")
      } catch (err: any) {
        console.error("Error deleting event:", err)
        setError(err.response?.data?.error || "Failed to delete event")
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4">
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 text-center max-w-sm sm:max-w-md w-full">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4">
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 text-center max-w-sm sm:max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Error</h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate("/superadmin/dashboard")}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100/80 via-indigo-100/80 to-blue-100/80 backdrop-blur-sm border-b border-white/20 shadow-md sticky top-0 z-10">
        <div className="max-w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Title Section - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0 min-w-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-30 animate-pulse"></div>
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white relative z-10" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight truncate">
                  View All Tasks
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:block">
                  Browse all task documents
                </p>
              </div>
            </div>

            {/* Back Button - Responsive */}
            <button
              onClick={() => navigate("/superadmin/dashboard")}
              className="flex items-center text-slate-600 hover:text-slate-900 bg-white/90 hover:bg-white rounded-xl px-2 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105 transform border border-white/20 whitespace-nowrap flex-shrink-0"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Task Documents</h2>
            <p className="text-blue-100 text-sm sm:text-base">Explore all tasks organized by levels</p>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <input
              type="text"
              placeholder="Search by event name or admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="incomplete">Incomplete</option>
              <option value="partially_completed">Partially Completed</option>
              <option value="fully_completed">Fully Completed</option>
            </select>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {tasks.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-base sm:text-lg font-medium mb-2">No tasks found.</p>
                <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                  Create a new task document to get started.
                </p>
                <button
                  onClick={() => navigate("/superadmin/create-task")}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {tasks.map((taskDocument) => (
                  <div
                    key={taskDocument._id}
                    className="bg-gradient-to-r from-gray-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Event Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">
                          Event: {taskDocument.event_name}
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Created:{" "}
                            {new Date(taskDocument.created_at).toLocaleDateString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              year: "2-digit",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {taskDocument.assigned_to && taskDocument.assigned_to.length > 0 && (
                            <span className="flex items-center">
                              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {taskDocument.assigned_to.length} Admin{taskDocument.assigned_to.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleEditEvent(taskDocument._id)}
                          className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium"
                        >
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(taskDocument._id)}
                          className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium"
                        >
                          <Trash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Delete
                        </button>
                        <button
                          onClick={() => handleAssignUsers(taskDocument._id)}
                          className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium"
                        >
                          <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Allocate Assignee</span>
                          <span className="sm:hidden">Assign</span>
                        </button>
                      </div>
                    </div>

                    {/* Levels */}
                    <div className="space-y-3 sm:space-y-4">
                      {taskDocument.levels.map((level) => (
                        <div key={level.level_id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Level Header */}
                          <div
                            className="flex items-center justify-between p-3 sm:p-4 bg-indigo-100 cursor-pointer hover:bg-indigo-200 transition-all duration-200"
                            onClick={() => toggleLevel(level.level_id)}
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mr-2 sm:mr-3 flex-shrink-0" />
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                {level.level_name}
                              </h4>
                              <span className="ml-2 px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs font-medium">
                                {level.tasks.length} task{level.tasks.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 ml-2">
                              <span className="hidden sm:inline text-sm mr-2">
                                {expandedLevels[level.level_id] ? "Collapse" : "Expand"}
                              </span>
                              {expandedLevels[level.level_id] ? (
                                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </div>
                          </div>

                          {/* Level Content */}
                          {expandedLevels[level.level_id] && (
                            <div className="p-3 sm:p-4 bg-white space-y-3 sm:space-y-4">
                              {level.tasks.map((task) => (
                                <div key={task.task_id} className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Task Header */}
                                  <div
                                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                                    onClick={() => toggleTask(task.task_id)}
                                  >
                                    <div className="flex items-center min-w-0 flex-1">
                                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                                      <h5 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {task.task_name}
                                      </h5>
                                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-gray-600 ml-2">
                                      <span className="hidden sm:inline text-sm mr-2">
                                        {expandedTasks[task.task_id] ? "Collapse" : "Expand"}
                                      </span>
                                      {expandedTasks[task.task_id] ? (
                                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Task Content */}
                                  {expandedTasks[task.task_id] && (
                                    <div className="p-3 sm:p-4 bg-white space-y-4 sm:space-y-6">
                                      {/* Task Description */}
                                      <div>
                                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                          {task.description}
                                        </p>
                                        <div className="flex items-center mt-2 text-xs sm:text-sm text-gray-600">
                                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                          Deadline:{" "}
                                          {new Date(task.deadline).toLocaleDateString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })}
                                        </div>
                                      </div>

                                      {/* Subtasks */}
                                      <div>
                                        <div className="flex items-center mb-3 sm:mb-4">
                                          <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2" />
                                          <h6 className="text-sm sm:text-base font-semibold text-gray-900">Subtasks</h6>
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                          {task.subtasks.map((subtask, index) => (
                                            <div
                                              key={subtask.subtask_id}
                                              className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-gray-200"
                                            >
                                              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                                {/* Subtask Header */}
                                                <div className="flex items-start sm:items-center gap-3">
                                                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                                                    {index + 1}
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                                                      {subtask.name}
                                                    </p>
                                                  </div>
                                                  <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${subtask.status === "incomplete"
                                                      ? "bg-red-100 text-red-600"
                                                      : "bg-green-100 text-green-600"
                                                      }`}
                                                  >
                                                    {subtask.status}
                                                  </span>
                                                </div>

                                                {/* Subtask Details */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 ml-9 sm:ml-10 text-xs sm:text-sm text-gray-600">
                                                  <div className="flex items-center">
                                                    <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                    <span className="font-medium">{subtask.points} points</span>
                                                  </div>
                                                  <div className="flex items-center">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                    <span>
                                                      Due:{" "}
                                                      {new Date(subtask.deadline).toLocaleDateString("en-IN", {
                                                        timeZone: "Asia/Kolkata",
                                                        month: "short",
                                                        day: "numeric",
                                                      })}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Marking Criteria */}
                                      <div>
                                        <div className="flex items-center mb-3 sm:mb-4">
                                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2" />
                                          <h6 className="text-sm sm:text-base font-semibold text-gray-900">
                                            Marking Criteria
                                          </h6>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                                            <div className="flex items-center mb-2">
                                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                              </div>
                                              <span className="text-xs sm:text-sm font-semibold text-emerald-800">
                                                Fully Completed
                                              </span>
                                            </div>
                                            <p className="text-gray-700 font-bold text-lg sm:text-xl">
                                              {task.marking_criteria.fully_completed}%
                                            </p>
                                          </div>
                                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-3 sm:p-4 rounded-lg border border-amber-200">
                                            <div className="flex items-center mb-2">
                                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center mr-2">
                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                              </div>
                                              <span className="text-xs sm:text-sm font-semibold text-amber-800">
                                                Partially Completed
                                              </span>
                                            </div>
                                            <p className="text-gray-700 font-bold text-lg sm:text-xl">
                                              {task.marking_criteria.partially_completed}%
                                            </p>
                                          </div>
                                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 sm:p-4 rounded-lg border border-red-200">
                                            <div className="flex items-center mb-2">
                                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                              </div>
                                              <span className="text-xs sm:text-sm font-semibold text-red-800">
                                                Incomplete
                                              </span>
                                            </div>
                                            <p className="text-gray-700 font-bold text-lg sm:text-xl">
                                              {task.marking_criteria.incomplete}%
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewTasks