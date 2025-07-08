"use client"
import type React from "react"
import { useEffect, useState, Component } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"
import {
  Users,
  Target,
  Award,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Hash,
  Save,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  Search,
  UserX,
} from "lucide-react"

interface Student {
  _id?: string
  name?: string
  roll_no?: string
  student_id?: string
  department?: string
  year?: string
  email?: string
  [key: string]: any
}

interface Subtask {
  subtask_id: string
  name: string
  description: string
  points: number
  deadline: string
  status: string
  marking_criteria: {
    fully_completed: number
    partially_completed: number
    incomplete: number
  }
}

interface Task {
  task_id: string
  task_name: string
  description: string
  total_points: number
  deadline: string
  level_id: string
  level_name: string
  event_id: string
  event_name: string
  subtasks: Subtask[]
  marking_criteria?: {
    fully_completed: number
    partially_completed: number
    incomplete: number
  }
}

interface StudentPoint {
  roll_no: string
  student_name: string
  points: number
  status: string
  subtask_id: string | null
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Something went wrong</h3>
          <p className="text-gray-500">Please refresh the page or contact support.</p>
        </div>
      )
    }
    return this.props.children
  }
}

const TaskReport: React.FC = () => {
  const { event_id, task_id } = useParams<{ event_id: string; task_id: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [subtaskStudentPoints, setSubtaskStudentPoints] = useState<{
    [key: string]: { [studentId: string]: string }
  }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ [key: string]: boolean }>({})
  const [adminData, setAdminData] = useState<{ admin_id: string; admin_name: string } | null>(null)
  const [activeSubtaskId, setActiveSubtaskId] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = Cookies.get("admin_token")
        if (!token) {
          throw new Error("Authentication token missing. Please log in.")
        }

        let admin_id: string
        let admin_name = ""
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]))
          admin_id = decoded.admin_id
          admin_name = decoded.admin_name || decoded.name || ""
          if (!admin_id) {
            throw new Error("Admin ID missing in token payload.")
          }
          setAdminData({ admin_id, admin_name })
          console.log("Decoded admin_id:", admin_id)
        } catch (e) {
          throw new Error("Failed to decode token: " + (e as Error).message)
        }

        // Fetch task details
        const taskRes = await axios.post<{ tasks: Task[] }>(
          `https://leaderboard-backend-4uxl.onrender.com/api/admin/get_tasks/${event_id}/`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        )
        console.log("Task response:", taskRes.data)
        const foundTask = taskRes.data.tasks.find((task) => task.task_id === task_id)
        if (!foundTask) {
          throw new Error("Task not found in the response.")
        }
        setTask(foundTask)

        const studentsRes = await axios.get<{ students: Student[] }>(
          `https://leaderboard-backend-4uxl.onrender.com/api/admin/getstudent_task_report/${event_id}/${admin_id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        )
        console.log("Students response:", studentsRes.data)
        const validStudents = studentsRes.data.students.filter(
          (student) => student.roll_no || student.student_id
        )
        setStudents(validStudents)

        const pointsRes = await axios.get<{ points: StudentPoint[] }>(
          `https://leaderboard-backend-4uxl.onrender.com/api/admin/manage_task_points/${event_id}/${task_id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        )
        console.log("Points response:", pointsRes.data)
        const pointsMap: { [key: string]: { [studentId: string]: string } } = {}
        pointsRes.data.points.forEach((point) => {
          const key = point.subtask_id || foundTask.task_id
          if (!pointsMap[key]) {
            pointsMap[key] = {}
          }
          pointsMap[key][point.roll_no] = point.status
        })
        setSubtaskStudentPoints(pointsMap)

        // Set activeSubtaskId to task_id if any points are task-level
        const hasTaskLevelPoints = pointsRes.data.points.some((point) => point.subtask_id === null)
        if (hasTaskLevelPoints) {
          setActiveSubtaskId(foundTask.task_id)
        } else if (foundTask.subtasks && foundTask.subtasks.length > 0) {
          setActiveSubtaskId(foundTask.subtasks[0].subtask_id)
        } else {
          setActiveSubtaskId(foundTask.task_id)
        }

        console.log("subtaskStudentPoints:", pointsMap)
        console.log("activeSubtaskId:", hasTaskLevelPoints ? foundTask.task_id : (foundTask.subtasks && foundTask.subtasks.length > 0 ? foundTask.subtasks[0].subtask_id : foundTask.task_id))
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.response?.data?.error || err.message || "Failed to fetch data.")
      } finally {
        setLoading(false)
      }
    }

    if (task_id && event_id) {
      fetchData()
    } else {
      setError("Missing required URL parameters (event_id or task_id).")
      setLoading(false)
    }
  }, [task_id, event_id])

  // Debug useEffect to log state changes
  useEffect(() => {
    console.log("Current subtaskStudentPoints:", subtaskStudentPoints)
    console.log("Current activeSubtaskId:", activeSubtaskId)
    students.forEach((student) => {
      const studentId = student.roll_no || student.student_id || "unknown"
      console.log(`Student ${studentId} status for activeSubtaskId ${activeSubtaskId}:`, subtaskStudentPoints[activeSubtaskId]?.[studentId] || "incomplete")
    })
  }, [subtaskStudentPoints, activeSubtaskId, students])

  const handleStatusChange = (key: string, studentId: string, status: string) => {
    setSubtaskStudentPoints((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [studentId]: status,
      },
    }))
  }

  const getPointsForStatus = (status: string, points: number) => {
    switch (status) {
      case "completely_finished":
        return points
      case "partially_finished":
        return Math.floor(points / 2)
      case "incomplete":
      default:
        return 0
    }
  }

  const handleSubmitPoints = async (key: string) => {
    try {
      setError(null)
      const token = Cookies.get("admin_token")
      if (!token || !adminData || !task) {
        throw new Error("Missing required data. Please refresh the page.")
      }

      const isTaskLevel = key === task.task_id
      const subtask = isTaskLevel ? null : task.subtasks.find((st) => st.subtask_id === key)
      const points = isTaskLevel ? task.total_points : subtask?.points || 0
      const name = isTaskLevel ? task.task_name : subtask?.name || ""
      const id = isTaskLevel ? task.task_id : subtask?.subtask_id || ""

      const studentEntries = students.map((student) => {
        const studentId = student.roll_no || student.student_id || "unknown"
        const status = subtaskStudentPoints[key]?.[studentId] || "incomplete"
        const studentPoints = getPointsForStatus(status, points)
        return {
          student_email: student.email || `${studentId}@example.com`,
          student_name: student.name || "Unknown",
          points: studentPoints,
          status,
        }
      })

      const payload = {
        event_id: task.event_id,
        event_name: task.event_name,
        admin_id: adminData.admin_id,
        admin_name: adminData.admin_name,
        level_id: task.level_id,
        level_name: task.level_name,
        task_id: task.task_id,
        task_name: task.task_name,
        subtask_id: isTaskLevel ? null : id,
        subtask_name: isTaskLevel ? null : name,
        students: studentEntries,
      }

      console.log("Submitting payload:", payload)
      await axios.post(
        `https://leaderboard-backend-4uxl.onrender.com/api/admin/manage_task_points/${task.event_id}/${task.task_id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      setSuccess((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setSuccess((prev) => ({ ...prev, [key]: false }))
      }, 3000)
    } catch (err: any) {
      console.error("Error submitting points:", err)
      setError(err.response?.data?.error || err.message || "Failed to assign points.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completely_finished":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "partially_finished":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "incomplete":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completely_finished":
        return <CheckCircle2 className="w-4 h-4" />
      case "partially_finished":
        return <AlertCircle className="w-4 h-4" />
      case "incomplete":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getProgress = (key: string) => {
    if (!students.length) return 0
    const completedCount = students.filter((student) => {
      const studentId = student.roll_no || student.student_id || "unknown"
      const status = subtaskStudentPoints[key]?.[studentId] || "incomplete"
      return status === "completely_finished"
    }).length
    return Math.round((completedCount / students.length) * 100)
  }

  const filteredSubtasks =
    task?.subtasks.filter(
      (subtask) =>
        subtask.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subtask.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const activeSubtask = task && activeSubtaskId === task.task_id ? null : task?.subtasks.find((st) => st.subtask_id === activeSubtaskId)
  const isTaskLevel = task && activeSubtaskId === task.task_id

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-yellow-200 rounded-full animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin text-yellow-600 absolute top-4 left-4" />
          </div>
          <p className="text-gray-700 font-semibold mt-6 text-lg">Loading Task Report...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Report</h3>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    {task?.event_name || "Loading..."}
                  </h1>
                  <p className="text-gray-300 text-sm">{task?.task_name}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-30 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out h-full flex flex-col`}
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-black">Subtasks</h2>
                <p className="text-sm text-black/80">
                  {searchTerm
                    ? `${filteredSubtasks.length} of ${task?.subtasks.length || 0}`
                    : `${task?.subtasks.length || 0} Total`}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-black/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subtasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {task && (
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-semibold text-gray-600">Points</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{task.total_points}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-600">Students</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {task && (
                <div
                  key={task.task_id}
                  onClick={() => {
                    setActiveSubtaskId(task.task_id)
                    setSidebarOpen(false)
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeSubtaskId === task.task_id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          activeSubtaskId === task.task_id ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        T
                      </div>
                      <span className={`font-semibold text-sm ${activeSubtaskId === task.task_id ? "text-white" : "text-gray-900"}`}>
                        {task.task_name}
                      </span>
                    </div>
                    {activeSubtaskId !== task.task_id && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={activeSubtaskId === task.task_id ? "text-white/80" : "text-gray-600"}>{task.total_points} points</span>
                      <span className={activeSubtaskId === task.task_id ? "text-white/80" : "text-gray-600"}>{getProgress(task.task_id)}% complete</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${activeSubtaskId === task.task_id ? "bg-white/20" : "bg-gray-200"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          activeSubtaskId === task.task_id ? "bg-white" : "bg-gradient-to-r from-green-400 to-green-600"
                        }`}
                        style={{ width: `${getProgress(task.task_id)}%` }}
                      ></div>
                    </div>
                  </div>
                  {success[task.task_id] && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Saved!</span>
                    </div>
                  )}
                </div>
              )}
              {filteredSubtasks.map((subtask, index) => {
                const progress = getProgress(subtask.subtask_id)
                const isActive = activeSubtaskId === subtask.subtask_id
                const originalIndex = task?.subtasks.findIndex((st) => st.subtask_id === subtask.subtask_id) || 0

                return (
                  <div
                    key={subtask.subtask_id}
                    onClick={() => {
                      setActiveSubtaskId(subtask.subtask_id)
                      setSidebarOpen(false)
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      isActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {originalIndex + 1}
                        </div>
                        <span className={`font-semibold text-sm ${isActive ? "text-white" : "text-gray-900"}`}>{subtask.name}</span>
                      </div>
                      {!isActive && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isActive ? "text-white/80" : "text-gray-600"}>{subtask.points} points</span>
                        <span className={isActive ? "text-white/80" : "text-gray-600"}>{progress}% complete</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${isActive ? "bg-white/20" : "bg-gray-200"}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isActive ? "bg-white" : "bg-gradient-to-r from-green-400 to-green-600"}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    {success[subtask.subtask_id] && (
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Saved!</span>
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredSubtasks.length === 0 && task?.subtasks.length !== 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No subtasks found for "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
          {filteredSubtasks.length > 5 && (
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-center flex-shrink-0">
              <p className="text-xs text-gray-500">Scroll to see more subtasks</p>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-200 text-red-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 mr-3" />
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            {task && (
              <ErrorBoundary>
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {isTaskLevel ? task.task_name : activeSubtask?.name}
                        </h2>
                        <p className="text-gray-600">{isTaskLevel ? task.description : activeSubtask?.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">
                          {isTaskLevel ? task.total_points : activeSubtask?.points} points
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {isTaskLevel ? task.deadline : activeSubtask?.deadline}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                        <div className="text-sm text-gray-600">Total Students</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {
                            students.filter((student) => {
                              const studentId = student.roll_no || student.student_id || "unknown"
                              const status = subtaskStudentPoints[activeSubtaskId]?.[studentId] || "incomplete"
                              return status === "completely_finished"
                            }).length
                          }
                        </div>
                        <div className="text-sm text-green-600">Completed</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {
                            students.filter((student) => {
                              const studentId = student.roll_no || student.student_id || "unknown"
                              const status = subtaskStudentPoints[activeSubtaskId]?.[studentId] || "incomplete"
                              return status === "partially_finished"
                            }).length
                          }
                        </div>
                        <div className="text-sm text-amber-600">Partial</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">Student Management</h3>
                    </div>

                    {students.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          {students.map((student) => {
                            const studentId = student.roll_no || student.student_id || "unknown"
                            const studentName = student.name || "Unknown"
                            const avatarChar = studentName.charAt(0).toUpperCase() || studentId.charAt(0).toUpperCase() || "?"
                            const currentStatus = subtaskStudentPoints[activeSubtaskId]?.[studentId] || "incomplete"
                            const currentPoints = getPointsForStatus(
                              currentStatus,
                              isTaskLevel ? task.total_points : activeSubtask?.points || 0
                            )

                            return (
                              <div
                                key={studentId}
                                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {avatarChar}
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-gray-900">{studentName}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <Hash className="w-3 h-3" />
                                          <span>{studentId}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <select
                                      value={currentStatus}
                                      onChange={(e) => handleStatusChange(activeSubtaskId, studentId, e.target.value)}
                                      className="border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                                      aria-label={`Status for ${studentName}`}
                                    >
                                      <option value="completely_finished">✅ Completely Finished</option>
                                      <option value="partially_finished">⚠️ Partially Finished</option>
                                      <option value="incomplete">❌ Incomplete</option>
                                    </select>

                                    <div
                                      className={`px-4 py-2 rounded-lg font-bold text-center min-w-[80px] ${
                                        currentPoints === (isTaskLevel ? task.total_points : activeSubtask?.points)
                                          ? "bg-emerald-100 text-emerald-700"
                                          : currentPoints === Math.floor((isTaskLevel ? task.total_points : activeSubtask?.points || 0) / 2)
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {currentPoints} pts
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-8 text-center">
                          <button
                            onClick={() => handleSubmitPoints(activeSubtaskId)}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Save className="w-5 h-5" />
                            Submit
                          </button>

                          {success[activeSubtaskId] && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold">
                              <CheckCircle2 className="w-5 h-5" />
                              Points assigned successfully!
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UserX className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Users Available</h3>
                        <p className="text-gray-500">No users are there for this {isTaskLevel ? "task" : "subtask"}.</p>
                      </div>
                    )}
                  </div>
                </div>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default TaskReport