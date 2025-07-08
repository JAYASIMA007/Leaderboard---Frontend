
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  CheckSquare,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash,
  Clock,
  Target,
  Award,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Trophy,
  Star,
  Crown,
  Users,
  BarChart3,
  Flame,
  Loader2,
} from "lucide-react"
import Select from "react-select"

interface Subtask {
  name: string
  description: string
  points: number
  deadline: string
}

interface Task {
  task_name: string
  description: string
  points: number
  subtasks: Subtask[]
  start_date: string
  end_date: string
  task_type: string
  deadline_time: string
  marking_criteria: {
    fully_completed: number
    partially_completed: number
    incomplete: number
  }
}

interface Level {
  level_name: string
  tasks: Task[]
}

interface FormData {
  event_name: string
  levels: Level[]
  assigned_to: string[]
}

interface Admin {
  name: string
  email: string
  Admin_ID: string
}

interface AssignedAdmin {
  admin_id: string
  students: { name: string; roll_no: string }[]
}

interface ResponseData {
  object_id: string
  event_id: string
  message: string
  event_name: string
  assigned_to: string[]
  assigned_admins: AssignedAdmin[]
}

const CreateTaskPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    event_name: "",
    levels: [
      {
        level_name: "",
        tasks: [
          {
            task_name: "",
            description: "",
            points: 0,
            subtasks: [],
            start_date: "",
            end_date: "",
            task_type: "",
            deadline_time: "",
            marking_criteria: { fully_completed: 0, partially_completed: 0, incomplete: 0 },
          },
        ],
      },
    ],
    assigned_to: [],
  })

  const [admins, setAdmins] = useState<Admin[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [responseData, setResponseData] = useState<ResponseData | null>(null)
  const [showStudents, setShowStudents] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState<"overview" | "level" | "task">("overview")
  const [selectedLevel, setSelectedLevel] = useState<number>(0)
  const [selectedTask, setSelectedTask] = useState<number>(0)
  const navigate = useNavigate()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  const taskTypeOptions = [
    { value: "Daily", label: "Daily", icon: "🔄" },
    { value: "Weekly", label: "Weekly", icon: "📅" },
    { value: "Monthly", label: "Monthly", icon: "🗓️" },
  ]

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("https://leaderboard-backend-4uxl.onrender.com/api/superadmin/get_admins/")
        setAdmins(response.data)
      } catch (err) {
        console.error("Fetch admins error:", err)
        setError("Failed to fetch admin details")
      }
    }
    fetchAdmins()
  }, [])

  // Calculate available task types based on date range
  const getAvailableTaskTypes = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const availableTypes = []

    // Always available
    availableTypes.push({ value: "", label: "One-time Task", icon: "⚡" })

    // Daily: minimum 2 days
    if (diffDays >= 2) {
      availableTypes.push(taskTypeOptions[0])
    }

    // Weekly: minimum 7 days
    if (diffDays >= 7) {
      availableTypes.push(taskTypeOptions[1])
    }

    // Monthly: minimum 28 days
    if (diffDays >= 28) {
      availableTypes.push(taskTypeOptions[2])
    }

    return availableTypes
  }

  const addLevel = () => {
    setFormData({
      ...formData,
      levels: [
        ...formData.levels,
        {
          level_name: "",
          tasks: [
            {
              task_name: "",
              description: "",
              points: 0,
              subtasks: [],
              start_date: "",
              end_date: "",
              task_type: "",
              deadline_time: "",
              marking_criteria: { fully_completed: 0, partially_completed: 0, incomplete: 0 },
            },
          ],
        },
      ],
    })
  }

  const removeLevel = (levelIndex: number) => {
    if (formData.levels.length > 1) {
      setFormData({
        ...formData,
        levels: formData.levels.filter((_, i) => i !== levelIndex),
      })
      if (selectedLevel >= levelIndex && selectedLevel > 0) {
        setSelectedLevel(selectedLevel - 1)
      }
      if (currentView === "level" && selectedLevel === levelIndex) {
        setCurrentView("overview")
      }
    }
  }

  const addTask = (levelIndex: number) => {
    const newLevels = [...formData.levels]
    newLevels[levelIndex].tasks.push({
      task_name: "",
      description: "",
      points: 0,
      subtasks: [],
      start_date: "",
      end_date: "",
      task_type: "",
      deadline_time: "",
      marking_criteria: { fully_completed: 0, partially_completed: 0, incomplete: 0 },
    })
    setFormData({ ...formData, levels: newLevels })
  }

  const removeTask = (levelIndex: number, taskIndex: number) => {
    const newLevels = [...formData.levels]
    if (newLevels[levelIndex].tasks.length > 1) {
      newLevels[levelIndex].tasks = newLevels[levelIndex].tasks.filter((_, i) => i !== taskIndex)
      setFormData({ ...formData, levels: newLevels })
      setExpandedTasks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(`${levelIndex}-${taskIndex}`)
        return newSet
      })
      if (selectedTask >= taskIndex && selectedTask > 0) {
        setSelectedTask(selectedTask - 1)
      }
      if (currentView === "task" && selectedTask === taskIndex) {
        setCurrentView("level")
      }
    }
  }

  const addSubtask = (levelIndex: number, taskIndex: number) => {
    const newLevels = [...formData.levels]
    newLevels[levelIndex].tasks[taskIndex].subtasks.push({
      name: "",
      description: "",
      points: 0,
      deadline: "",
    })
    setFormData({ ...formData, levels: newLevels })
  }

  const removeSubtask = (levelIndex: number, taskIndex: number, subtaskIndex: number) => {
    const newLevels = [...formData.levels]
    newLevels[levelIndex].tasks[taskIndex].subtasks = newLevels[levelIndex].tasks[taskIndex].subtasks.filter(
      (_, i) => i !== subtaskIndex,
    )
    setFormData({ ...formData, levels: newLevels })
  }

  const updateLevel = (levelIndex: number, field: keyof Level, value: string) => {
    const newLevels = [...formData.levels]
    newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value }
    setFormData({ ...formData, levels: newLevels })
  }

  const updateTask = (levelIndex: number, taskIndex: number, field: keyof Task, value: string | number | object) => {
    const newLevels = [...formData.levels]
    if (field === "marking_criteria") {
      const markingCriteria = value as Task["marking_criteria"]
      newLevels[levelIndex].tasks[taskIndex] = {
        ...newLevels[levelIndex].tasks[taskIndex],
        marking_criteria: {
          ...markingCriteria,
          incomplete: 0, // Always keep incomplete at 0
        },
      }
      // Update task points based on fully_completed value (with limit)
      newLevels[levelIndex].tasks[taskIndex].points = Math.min(markingCriteria.fully_completed, 100000)
    } else {
      const processedValue = field === "points" ? Math.min(Math.max(Number(value) || 0, 0), 100000) : value
      newLevels[levelIndex].tasks[taskIndex] = {
        ...newLevels[levelIndex].tasks[taskIndex],
        [field]: processedValue,
      }
      if (field === "points") {
        const points = processedValue as number
        newLevels[levelIndex].tasks[taskIndex].marking_criteria = {
          fully_completed: points,
          partially_completed: Math.min(Math.floor(points / 2), 50000),
          incomplete: 0,
        }
      }
    }
    setFormData({ ...formData, levels: newLevels })
  }

  const updateMarkingCriteria = (
    levelIndex: number,
    taskIndex: number,
    field: keyof Task["marking_criteria"],
    value: number
  ) => {
    const newLevels = [...formData.levels]
    const currentTask = newLevels[levelIndex].tasks[taskIndex]

    // Apply maximum limits
    let limitedValue = value
    if (field === "fully_completed") {
      limitedValue = Math.min(Math.max(value, 0), 100000)
    } else if (field === "partially_completed") {
      limitedValue = Math.min(Math.max(value, 0), 50000)
    }

    // Update the specific field first
    newLevels[levelIndex].tasks[taskIndex].marking_criteria = {
      ...currentTask.marking_criteria,
      [field]: limitedValue,
      incomplete: 0, // Always keep incomplete at 0
    }

    // Intelligent bidirectional sync logic
    if (field === "fully_completed") {
      // When Fully Completed is updated:
      // 1. Update task points to match fully completed
      newLevels[levelIndex].tasks[taskIndex].points = limitedValue
      // 2. Update partially completed to half of fully completed (but respect max limit)
      newLevels[levelIndex].tasks[taskIndex].marking_criteria.partially_completed = Math.min(Math.floor(limitedValue / 2), 50000)
      // 3. Always keep incomplete at 0
      newLevels[levelIndex].tasks[taskIndex].marking_criteria.incomplete = 0
    }
    else if (field === "partially_completed") {
      // When Partially Completed is updated:
      // 1. Update task points to double the partially completed (but respect max limit)
      const newTaskPoints = Math.min(limitedValue * 2, 100000)
      newLevels[levelIndex].tasks[taskIndex].points = newTaskPoints
      // 2. Update fully completed to double the partially completed (but respect max limit)
      newLevels[levelIndex].tasks[taskIndex].marking_criteria.fully_completed = newTaskPoints
      // 3. Always keep incomplete at 0
      newLevels[levelIndex].tasks[taskIndex].marking_criteria.incomplete = 0
    }
    // Remove the incomplete handling since it's always 0 now

    setFormData({ ...formData, levels: newLevels })
  }

  const updateSubtask = (
    levelIndex: number,
    taskIndex: number,
    subtaskIndex: number,
    field: keyof Subtask,
    value: string | number,
  ) => {
    const newLevels = [...formData.levels]
    newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex] = {
      ...newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex],
      [field]: field === "points" ? Number(value) || 0 : value,
    }
    setFormData({ ...formData, levels: newLevels })
  }

  const calculateTaskPoints = (task: Task) => {
    return task.subtasks.reduce((sum, subtask) => sum + subtask.points, 0)
  }

  const calculateLevelPoints = (level: Level) => {
    return level.tasks.reduce((sum, task) => sum + task.points, 0)
  }

  const calculateTotalPoints = () => {
    return formData.levels.reduce((sum, level) => sum + calculateLevelPoints(level), 0)
  }

  const getTotalTasks = () => {
    return formData.levels.reduce((sum, level) => sum + level.tasks.length, 0)
  }

  const validateMarkingCriteria = (criteria: Task["marking_criteria"], taskPoints: number) => {
    return (
      criteria.fully_completed >= 0 &&
      criteria.partially_completed >= 0 &&
      criteria.incomplete >= 0 &&
      criteria.fully_completed <= taskPoints &&
      criteria.fully_completed > criteria.partially_completed &&
      criteria.partially_completed > criteria.incomplete
    )
  }

  const toggleSubtasks = (levelIndex: number, taskIndex: number) => {
    const taskKey = `${levelIndex}-${taskIndex}`
    setExpandedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskKey)) {
        newSet.delete(taskKey)
      } else {
        newSet.add(taskKey)
      }
      return newSet
    })
  }

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case "Daily":
        return "🔄"
      case "Weekly":
        return "📅"
      case "Monthly":
        return "🗓️"
      default:
        return "⚡"
    }
  }

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case "Daily":
        return "from-emerald-500 to-green-500"
      case "Weekly":
        return "from-blue-500 to-indigo-500"
      case "Monthly":
        return "from-purple-500 to-indigo-500"
      default:
        return "from-amber-500 to-orange-500"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation logic (same as before but with enhanced error messages)
    if (!formData.event_name.trim()) {
      setError("Event name is required")
      return
    }
    if (!/^[a-zA-Z0-9\s\-.,!&()]+$/.test(formData.event_name)) {
      setError("Event name contains invalid characters")
      return
    }
    if (formData.assigned_to.length === 0) {
      setError("Please select at least one admin to assign the event")
      return
    }
    if (formData.levels.length === 0) {
      setError("At least one level is required")
      return
    }

    for (const [levelIndex, level] of formData.levels.entries()) {
      if (!level.level_name.trim()) {
        setError(`Level ${levelIndex + 1} name is required`)
        return
      }
      if (!/^[a-zA-Z0-9\s\-.,!&()]+$/.test(level.level_name)) {
        setError(`Level ${levelIndex + 1} name contains invalid characters`)
        return
      }
      if (level.tasks.length === 0) {
        setError(`Level ${levelIndex + 1} must have at least one task`)
        return
      }

      for (const [taskIndex, task] of level.tasks.entries()) {
        if (
          !task.task_name.trim() ||
          !task.description.trim() ||
          !task.start_date ||
          !task.end_date ||
          task.points < 0
        ) {
          setError(`Task ${taskIndex + 1} in Level ${levelIndex + 1} is missing required fields or has invalid points`)
          return
        }

        const taskStartDate = new Date(task.start_date)
        const taskEndDate = new Date(task.end_date)
        const todayDate = new Date(today)

        if (taskStartDate < todayDate) {
          setError(`Task ${taskIndex + 1} start date in Level ${levelIndex + 1} cannot be in the past`)
          return
        }
        if (taskEndDate <= taskStartDate) {
          setError(`Task ${taskIndex + 1} end date in Level ${levelIndex + 1} must be after start date`)
          return
        }
        if (!validateMarkingCriteria(task.marking_criteria, task.points)) {
          setError(
            `Task ${taskIndex + 1} in Level ${levelIndex + 1} marking criteria must follow: Fully Completed ≤ Task Points, Fully Completed > Partially Completed > Incomplete, and be non-negative`,
          )
          return
        }
      }
    }

    try {
      setLoading(true)
      const payload = {
        event_name: formData.event_name.trim(),
        assigned_to: formData.assigned_to,
        levels: formData.levels.map((level) => ({
          level_name: level.level_name.trim(),
          tasks: level.tasks.map((task) => ({
            task_name: task.task_name.trim(),
            description: task.description.trim(),
            points: task.points,
            start_date: task.start_date,
            end_date: task.end_date,
            task_type: task.task_type || null,
            deadline_time: task.deadline_time || null,
            marking_criteria: task.marking_criteria,
            subtasks: task.subtasks
              .filter((s) => s.name.trim() && s.description.trim() && s.points >= 0 && s.deadline)
              .map((s) => ({
                name: s.name.trim(),
                description: s.description.trim(),
                points: s.points,
                deadline: s.deadline,
              })),
          })),
        })),
      }

      const response = await axios.post("https://leaderboard-backend-4uxl.onrender.com/api/superadmin/create_task/", payload)
      setResponseData(response.data)
      setSuccess(true)
      navigate("/superadmin/dashboard");
    } catch (err: any) {
      console.error("Submit error:", err)
      setError(err.response?.data?.error || "Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  const adminOptions = admins.map((admin) => ({
    value: admin.Admin_ID,
    label: `${admin.name} (${admin.Admin_ID})`,
  }))

  // Success screen with updated theme
  if (success && responseData) {
    const totalStudents = responseData.assigned_admins.reduce((sum, admin) => sum + admin.students.length, 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Event Created Successfully!
          </h2>
          <p className="text-gray-600 mb-2">Event Name: {responseData.event_name}</p>
          <p className="text-gray-600 mb-2">Event ID: {responseData.event_id}</p>
          <p className="text-gray-600 mb-2">Assigned to: {responseData.assigned_to.join(", ")}</p>
          <p className="text-gray-600 mb-4">Total Students Assigned: {totalStudents}</p>

          <button
            type="button"
            onClick={() => setShowStudents(!showStudents)}
            className="flex items-center justify-center mx-auto mb-4 text-gray-700 hover:text-gray-900 font-medium"
          >
            {showStudents ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Student Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Student Details
              </>
            )}
          </button>

          {showStudents && (
            <div className="text-left max-h-48 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {responseData.assigned_admins.map((admin, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">Admin: {admin.admin_id}</h3>
                  <ul className="list-disc pl-5 text-gray-600 text-sm">
                    {admin.students.length > 0 ? (
                      admin.students.map((student, sIndex) => (
                        <li key={sIndex}>
                          {student.name} ({student.roll_no})
                        </li>
                      ))
                    ) : (
                      <li>No students assigned</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full animate-pulse w-full"></div>
          </div>
          <p className="text-sm text-gray-500 mt-3 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // Main interface with updated theme
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100/80 via-indigo-100/80 to-blue-100/80 backdrop-blur-sm border-b border-white/20 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <div className="absolute inset-0 rounded-xl bg-blue-600 opacity-30 animate-pulse"></div>
                <Trophy className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                  {formData.event_name || "Create Leadership Event"}
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  {formData.levels.length} Levels • {getTotalTasks()} Tasks • {calculateTotalPoints()} Points
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Points</p>
                <p className="text-2xl font-bold text-blue-600">{calculateTotalPoints()}</p>
              </div>
              <button
                onClick={() => navigate("/superadmin/dashboard")}
                className="flex items-center text-slate-600 hover:text-slate-900 mr-6 px-3 py-2 rounded-lg hover:bg-white/80 transition-all duration-200 bg-white/60 shadow-sm ml-10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium">Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-80"} bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl transition-all duration-300 flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Navigation</span>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {sidebarCollapsed ? (
                  <Menu className="w-4 h-4 text-gray-600" />
                ) : (
                  <X className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!sidebarCollapsed && (
              <>
                {/* Overview */}
                <button
                  onClick={() => setCurrentView("overview")}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${currentView === "overview"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Event Overview</div>
                      <div className="text-xs opacity-75">Configuration & Summary</div>
                    </div>
                  </div>
                </button>

                {/* Levels */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Levels ({formData.levels.length})</span>
                    <button onClick={addLevel} className="p-1 hover:bg-gray-100 rounded transition-all duration-200">
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {formData.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="space-y-2">
                      <button
                        onClick={() => {
                          setCurrentView("level")
                          setSelectedLevel(levelIndex)
                        }}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${currentView === "level" && selectedLevel === levelIndex
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                          : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {levelIndex + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{level.level_name || `Level ${levelIndex + 1}`}</div>
                              <div className="text-xs opacity-75">
                                {level.tasks.length} Tasks • {calculateLevelPoints(level)} Points
                              </div>
                            </div>
                          </div>
                          {formData.levels.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeLevel(levelIndex)
                              }}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </button>

                      {/* Tasks under this level */}
                      {currentView === "level" && selectedLevel === levelIndex && (
                        <div className="ml-4 space-y-1">
                          {level.tasks.map((task, taskIndex) => (
                            <button
                              key={taskIndex}
                              onClick={() => {
                                setCurrentView("task")
                                setSelectedTask(taskIndex)
                              }}
                              className={`w-full p-2 rounded-lg text-left transition-all duration-200 ${(currentView === "level" && selectedTask === taskIndex)
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                                  <div>
                                    <div className="font-medium text-xs">
                                      {task.task_name || `Task ${taskIndex + 1}`}
                                    </div>
                                    <div className="text-xs opacity-75">{task.points} Points</div>
                                  </div>
                                </div>
                                {level.tasks.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeTask(levelIndex, taskIndex)
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                                  >
                                    <Trash className="w-2 h-2" />
                                  </button>
                                )}
                              </div>
                            </button>
                          ))}
                          <button
                            onClick={() => addTask(levelIndex)}
                            className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-all duration-200 text-xs"
                          >
                            <Plus className="w-3 h-3 inline mr-1" />
                            Add Task
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Overview Content */}
              {currentView === "overview" && (
                <div className="space-y-8">
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                    <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Crown className="w-6 h-6 mr-3 text-blue-600" />
                      Event Configuration
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                          <Flame className="w-4 h-4 mr-1" />
                          Event Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter event name (e.g., Leadership Challenge 2025)"
                          value={formData.event_name}
                          onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500"
                          required
                        />
                      </div>
                      <div className="relative space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Assign To Admins *
                        </label>
                        <Select
                          isMulti
                          options={adminOptions}
                          value={adminOptions.filter((option) => formData.assigned_to.includes(option.value))}
                          onChange={(selectedOptions) => {
                            const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : []
                            setFormData({ ...formData, assigned_to: selectedValues })
                          }}
                          placeholder="Search and select admins..."
                          className="text-sm"
                          classNamePrefix="select"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: "white",
                              border: "1px solid rgb(209, 213, 219)",
                              borderRadius: "0.5rem",
                              padding: "0.25rem",
                              boxShadow: "none",
                              color: "rgb(17, 24, 39)",
                              "&:hover": {
                                borderColor: "rgb(59, 130, 246)",
                              },
                              "&:focus-within": {
                                borderColor: "rgb(59, 130, 246)",
                                boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2)",
                              },
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: "white",
                              border: "1px solid rgb(209, 213, 219)",
                              borderRadius: "0.5rem",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                              zIndex: 9999,
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                            option: (base, { isFocused, isSelected }) => ({
                              ...base,
                              backgroundColor: isSelected
                                ? "rgb(59, 130, 246)"
                                : isFocused
                                  ? "rgb(243, 244, 246)"
                                  : "transparent",
                              color: isSelected ? "white" : "rgb(17, 24, 39)",
                              "&:active": {
                                backgroundColor: "rgb(59, 130, 246)",
                              },
                            }),
                            multiValue: (base) => ({
                              ...base,
                              backgroundColor: "rgb(219, 234, 254)",
                              border: "1px solid rgb(147, 197, 253)",
                            }),
                            multiValueLabel: (base) => ({
                              ...base,
                              color: "rgb(30, 64, 175)",
                            }),
                            multiValueRemove: (base) => ({
                              ...base,
                              color: "rgb(30, 64, 175)",
                              "&:hover": {
                                backgroundColor: "rgb(239, 68, 68)",
                                color: "white",
                              },
                            }),
                            placeholder: (base) => ({
                              ...base,
                              color: "rgb(107, 114, 128)",
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: "rgb(17, 24, 39)",
                            }),
                            input: (base) => ({
                              ...base,
                              color: "rgb(17, 24, 39)",
                            }),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Summary */}
                  <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                    <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                      Event Summary
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Layers className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{formData.levels.length}</p>
                        <p className="text-sm text-gray-600">Levels</p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Target className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-emerald-600">{getTotalTasks()}</p>
                        <p className="text-sm text-gray-600">Tasks</p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-amber-600">{calculateTotalPoints()}</p>
                        <p className="text-sm text-gray-600">Total Points</p>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{formData.assigned_to.length}</p>
                        <p className="text-sm text-gray-600">Admins</p>
                      </div>
                    </div>
                  </div>

                  {/* Levels Overview */}
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold flex items-center text-gray-900">
                        <Layers className="w-6 h-6 mr-3 text-blue-600" />
                        Levels Overview
                      </h3>
                      <button
                        type="button"
                        onClick={addLevel}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Level
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.levels.map((level, levelIndex) => (
                        <div
                          key={levelIndex}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setCurrentView("level")
                            setSelectedLevel(levelIndex)
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {levelIndex + 1}
                            </div>
                            {formData.levels.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeLevel(levelIndex)
                                }}
                                className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {level.level_name || `Level ${levelIndex + 1}`}
                          </h4>
                          <div className="text-sm text-gray-600">
                            <p>{level.tasks.length} Tasks</p>
                            <p>{calculateLevelPoints(level)} Points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Level Content */}
              {currentView === "level" && formData.levels[selectedLevel] && (
                <div className="space-y-8">
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold flex items-center text-gray-900">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          {selectedLevel + 1}
                        </div>
                        Level Configuration
                      </h3>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Level Points</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {calculateLevelPoints(formData.levels[selectedLevel])}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Level Name *</label>
                        <input
                          type="text"
                          placeholder="Enter level name (e.g., Foundation Phase)"
                          value={formData.levels[selectedLevel].level_name}
                          onChange={(e) => updateLevel(selectedLevel, "level_name", e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tasks Grid */}
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center text-gray-900">
                        <Target className="w-5 h-5 mr-2 text-emerald-600" />
                        Tasks ({formData.levels[selectedLevel].tasks.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => addTask(selectedLevel)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.levels[selectedLevel].tasks.map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setCurrentView("task")
                            setSelectedTask(taskIndex)
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-8 h-8 bg-gradient-to-r ${getTaskTypeColor(task.task_type)} rounded-full flex items-center justify-center text-white text-lg`}
                            >
                              {getTaskTypeIcon(task.task_type)}
                            </div>
                            {formData.levels[selectedLevel].tasks.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeTask(selectedLevel, taskIndex)
                                }}
                                className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {task.task_name || `Task ${taskIndex + 1}`}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {task.points} Points
                            </p>
                            {task.task_type && (
                              <p className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.task_type}
                              </p>
                            )}
                            {task.start_date && task.end_date && (
                              <p className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.start_date).toLocaleDateString()} -{" "}
                                {new Date(task.end_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Task Content */}
              {currentView === "task" &&
                formData.levels[selectedLevel] &&
                formData.levels[selectedLevel].tasks[selectedTask] && (
                  <div className="space-y-8">
                    {(() => {
                      const task = formData.levels[selectedLevel].tasks[selectedTask]
                      const availableTaskTypes = getAvailableTaskTypes(task.start_date, task.end_date)

                      return (
                        <>
                          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-2xl font-bold flex items-center text-gray-900">
                                <div
                                  className={`w-8 h-8 bg-gradient-to-r ${getTaskTypeColor(task.task_type)} rounded-full flex items-center justify-center text-white text-lg mr-3`}
                                >
                                  {getTaskTypeIcon(task.task_type)}
                                </div>
                                Task Configuration
                              </h3>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Task Points</p>
                                <p className="text-2xl font-bold text-emerald-600">{task.points}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Task Name *</label>
                                  <input
                                    type="text"
                                    placeholder="Enter task name"
                                    value={task.task_name}
                                    onChange={(e) =>
                                      updateTask(selectedLevel, selectedTask, "task_name", e.target.value)
                                    }
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Task Points *</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      placeholder="Points"
                                      value={task.points}
                                      onChange={(e) =>
                                        updateTask(selectedLevel, selectedTask, "points", e.target.value)
                                      }
                                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 placeholder-gray-500 pr-12"
                                      min="0"
                                      max="100000"
                                      required
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                      pts
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Task Description *
                                  </label>
                                  <textarea
                                    value={task.description}
                                    onChange={(e) =>
                                      updateTask(selectedLevel, selectedTask, "description", e.target.value)
                                    }
                                    rows={4}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                                    placeholder="Describe the task..."
                                    required
                                  />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Start Date *
                                    </label>
                                    <input
                                      type="date"
                                      value={task.start_date}
                                      min={today}
                                      onChange={(e) => {
                                        updateTask(selectedLevel, selectedTask, "start_date", e.target.value)
                                        // Reset task type if date range changes
                                        const newAvailableTypes = getAvailableTaskTypes(e.target.value, task.end_date)
                                        if (!newAvailableTypes.some((type) => type.value === task.task_type)) {
                                          updateTask(selectedLevel, selectedTask, "task_type", "")
                                        }
                                      }}
                                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      End Date *
                                    </label>
                                    <input
                                      type="date"
                                      value={task.end_date}
                                      min={task.start_date || today}
                                      onChange={(e) => {
                                        updateTask(selectedLevel, selectedTask, "end_date", e.target.value)
                                        // Reset task type if date range changes
                                        const newAvailableTypes = getAvailableTaskTypes(task.start_date, e.target.value)
                                        if (!newAvailableTypes.some((type) => type.value === task.task_type)) {
                                          updateTask(selectedLevel, selectedTask, "task_type", "")
                                        }
                                      }}
                                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Task Type
                                  </label>
                                  <Select
                                    options={availableTaskTypes}
                                    value={availableTaskTypes.find((option) => option.value === task.task_type) || null}
                                    onChange={(selectedOption) =>
                                      updateTask(
                                        selectedLevel,
                                        selectedTask,
                                        "task_type",
                                        selectedOption ? selectedOption.value : "",
                                      )
                                    }
                                    placeholder={
                                      availableTaskTypes.length > 1 ? "Select task type" : "Set dates to unlock types"
                                    }
                                    isClearable
                                    isDisabled={availableTaskTypes.length <= 1}
                                    className="text-sm"
                                    classNamePrefix="select"
                                    formatOptionLabel={(option: any) => (
                                      <div className="flex items-center">
                                        <span className="mr-2">{option.icon}</span>
                                        {option.label}
                                      </div>
                                    )}
                                    styles={{
                                      control: (base, state) => ({
                                        ...base,
                                        backgroundColor: "white",
                                        border: "1px solid rgb(209, 213, 219)",
                                        borderRadius: "0.5rem",
                                        padding: "0.25rem",
                                        boxShadow: "none",
                                        color: "rgb(17, 24, 39)",
                                        opacity: state.isDisabled ? 0.5 : 1,
                                        "&:hover": {
                                          borderColor: "rgb(16, 185, 129)",
                                        },
                                        "&:focus-within": {
                                          borderColor: "rgb(16, 185, 129)",
                                          boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.2)",
                                        },
                                      }),
                                      menu: (base) => ({
                                        ...base,
                                        backgroundColor: "white",
                                        border: "1px solid rgb(209, 213, 219)",
                                        borderRadius: "0.5rem",
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                        zIndex: 9999,
                                      }),
                                      option: (base, { isFocused, isSelected }) => ({
                                        ...base,
                                        backgroundColor: isSelected
                                          ? "rgb(16, 185, 129)"
                                          : isFocused
                                            ? "rgb(243, 244, 246)"
                                            : "transparent",
                                        color: isSelected ? "white" : "rgb(17, 24, 39)",
                                        "&:active": {
                                          backgroundColor: "rgb(16, 185, 129)",
                                        },
                                      }),
                                      placeholder: (base) => ({
                                        ...base,
                                        color: "rgb(107, 114, 128)",
                                      }),
                                      singleValue: (base) => ({
                                        ...base,
                                        color: "rgb(17, 24, 39)",
                                      }),
                                      input: (base) => ({
                                        ...base,
                                        color: "rgb(17, 24, 39)",
                                      }),
                                    }}
                                  />
                                  {availableTaskTypes.length <= 1 && (
                                    <p className="text-xs text-gray-500">
                                      💡 Set a longer date range to unlock Daily (2+ days), Weekly (7+ days), or Monthly
                                      (28+ days) options
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Deadline Time
                                  </label>
                                  <input
                                    type="time"
                                    value={task.deadline_time}
                                    onChange={(e) =>
                                      updateTask(selectedLevel, selectedTask, "deadline_time", e.target.value)
                                    }
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Marking Criteria */}
                          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                              <Award className="w-5 h-5 mr-2 text-amber-600" />
                              Marking Criteria
                            </h3>



                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                                <div className="flex items-center mb-3">
                                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                  <label className="text-sm font-semibold text-emerald-800">Fully Completed</label>
                                </div>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={task.marking_criteria.fully_completed}
                                    onChange={(e) =>
                                      updateMarkingCriteria(
                                        selectedLevel,
                                        selectedTask,
                                        "fully_completed",
                                        Number(e.target.value) || 0
                                      )
                                    }
                                    className="w-full p-3 bg-white border border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 pr-12"
                                    min="0"
                                    max="100000"
                                    required
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-700 font-medium">
                                    pts
                                  </span>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                                <div className="flex items-center mb-3">
                                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mr-2">
                                    <Clock className="w-4 h-4 text-white" />
                                  </div>
                                  <label className="text-sm font-semibold text-amber-800">Partially Completed</label>
                                </div>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={task.marking_criteria.partially_completed}
                                    onChange={(e) =>
                                      updateMarkingCriteria(
                                        selectedLevel,
                                        selectedTask,
                                        "partially_completed",
                                        Number(e.target.value) || 0
                                      )
                                    }
                                    className="w-full p-3 bg-white border border-amber-200 rounded-lg focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-200 text-gray-900 pr-12"
                                    min="0"
                                    max="50000"
                                    required
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-700 font-medium">
                                    pts
                                  </span>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-center mb-3">
                                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                  </div>
                                  <label className="text-sm font-semibold text-red-800">Incomplete</label>
                                </div>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={0}
                                    readOnly
                                    className="w-full p-3 bg-gray-100 border border-red-200 rounded-lg text-gray-500 pr-12 cursor-not-allowed"
                                    min="0"
                                    max="0"
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-700 font-medium">
                                    pts
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Subtasks */}
                          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold flex items-center text-gray-900">
                                <CheckSquare className="w-5 h-5 mr-2 text-purple-600" />
                                Subtasks (Optional)
                              </h3>
                              <button
                                type="button"
                                onClick={() => addSubtask(selectedLevel, selectedTask)}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subtask
                              </button>
                            </div>

                            {task.subtasks.length > 0 ? (
                              <div className="space-y-4">
                                {task.subtasks.map((subtask, subtaskIndex) => (
                                  <div key={subtaskIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                      <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                          Subtask Name
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Subtask name"
                                          value={subtask.name}
                                          onChange={(e) =>
                                            updateSubtask(
                                              selectedLevel,
                                              selectedTask,
                                              subtaskIndex,
                                              "name",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Points</label>
                                        <input
                                          type="number"
                                          placeholder="Points"
                                          value={subtask.points}
                                          onChange={(e) =>
                                            updateSubtask(
                                              selectedLevel,
                                              selectedTask,
                                              subtaskIndex,
                                              "points",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                          min="0"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Deadline</label>
                                        <input
                                          type="date"
                                          value={subtask.deadline}
                                          min={task.start_date}
                                          max={task.end_date}
                                          onChange={(e) =>
                                            updateSubtask(
                                              selectedLevel,
                                              selectedTask,
                                              subtaskIndex,
                                              "deadline",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900"
                                        />
                                      </div>

                                      <div className="flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => removeSubtask(selectedLevel, selectedTask, subtaskIndex)}
                                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                      <label className="block text-sm font-semibold text-gray-700">
                                        Subtask Description
                                      </label>
                                      <textarea
                                        value={subtask.description}
                                        onChange={(e) =>
                                          updateSubtask(
                                            selectedLevel,
                                            selectedTask,
                                            subtaskIndex,
                                            "description",
                                            e.target.value,
                                          )
                                        }
                                        rows={2}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                                        placeholder="Describe the subtask..."
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                                <p className="text-gray-600">No subtasks added yet</p>
                                <p className="text-sm text-gray-500">
                                  Break down complex tasks into smaller, manageable pieces
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/superadmin/dashboard")}
                  className="flex-1 py-4 px-6 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200"
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
                      <Loader2 className="animate-spin h-5 w-5 mr-3" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-3" />
                      Create Leadership Event
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

export default CreateTaskPage
