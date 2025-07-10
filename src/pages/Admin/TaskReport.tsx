"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"
import {
  Users,
  Target,
  Award,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
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
  name?: string | null
  roll_no?: string
  student_id?: string
  department?: string
  year?: string
  email?: string | null
  [key: string]: string | null | undefined
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
  roll_no: string | null
  student_name: string | null
  student_email: string
  points: number
  status: string
  subtask_id: string
  subtask_name: string
  time: string | null
  updated_time: string | null
}

const TaskReport: React.FC = () => {
  const { event_id, task_id } = useParams<{ event_id: string; task_id: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [subtaskStudentPoints, setSubtaskStudentPoints] = useState<{
    [subtaskId: string]: { [studentEmail: string]: string }
  }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ [subtaskId: string]: boolean }>({})
  const [adminData, setAdminData] = useState<{ admin_id: string; admin_name: string } | null>(null)
  const [activeSubtaskId, setActiveSubtaskId] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Debug useEffect to monitor subtaskStudentPoints changes
  useEffect(() => {
    console.log("subtaskStudentPoints state changed:", subtaskStudentPoints)
  }, [subtaskStudentPoints])

  // Helper function to check if student has valid data
  const isValidStudent = (student: Student): boolean => {
    return !!(student && student.name && student.name.trim() !== '')
  }

  // Helper function to get consistent student email for mapping
  const getStudentEmail = (student: Student): string => {
    return student.email || `${student.roll_no || student.student_id || "unknown"}@example.com`
  }

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

        // Set first subtask as active by default, or handle no subtasks case
        if (foundTask.subtasks && foundTask.subtasks.length > 0) {
          setActiveSubtaskId(foundTask.subtasks[0].subtask_id)
        } else {
          // If no subtasks, set task_id as the active ID for consistent handling
          setActiveSubtaskId(foundTask.task_id)
        }

        // Fetch points data which contains student information
        const pointsRes = await axios.get<{ points: StudentPoint[] }>(
          `https://leaderboard-backend-4uxl.onrender.com/api/admin/manage_task_points/${event_id}/${task_id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        )
        console.log("Points response:", pointsRes.data)
        
        // Extract unique students from points data and create student objects
        const studentMap = new Map<string, Student>()
        const pointsMap: { [subtaskId: string]: { [studentEmail: string]: string } } = {}
        
        // If no points data exists, try to fetch students from alternative endpoint
        if (!pointsRes.data.points || pointsRes.data.points.length === 0) {
          console.log("No points data found, attempting to fetch students from alternative endpoint...")
          try {
            const studentsRes = await axios.get<{ students: Student[] }>(
              `https://leaderboard-backend-4uxl.onrender.com/api/admin/getstudent_task_report/${event_id}/${admin_id}/`,
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              },
            )
            console.log("Alternative students response:", studentsRes.data)
            setStudents(studentsRes.data.students || [])
          } catch (altErr) {
            console.warn("Alternative student fetch failed:", altErr)
            setStudents([])
          }
        } else {
          // Process points data to extract students and status mapping
          pointsRes.data.points.forEach((point) => {
            console.log("Processing point:", point)
            
            // Add student to map if not already present
            if (!studentMap.has(point.student_email)) {
              studentMap.set(point.student_email, {
                email: point.student_email,
                name: point.student_name,
                roll_no: point.roll_no || undefined,
                student_id: point.roll_no || point.student_email.split("@")[0],
                department: undefined,
                year: undefined,
              })
            }
            
            // Process points mapping - handle both subtask and task level
            // Use subtask_id if it exists, otherwise use task_id for direct task management
            const mappingKey = point.subtask_id || foundTask.task_id
            if (!pointsMap[mappingKey]) {
              pointsMap[mappingKey] = {}
            }
            pointsMap[mappingKey][point.student_email] = point.status
            console.log(`Setting status for ${point.subtask_id ? 'subtask' : 'task'} ${mappingKey}, student ${point.student_email}: ${point.status}`)
          })
          
          // Convert student map to array and set students
          const studentsArray = Array.from(studentMap.values())
          console.log("Extracted students from points data:", studentsArray)
          setStudents(studentsArray)
        }
        
        console.log("Final pointsMap:", pointsMap)
        setSubtaskStudentPoints(pointsMap)
        
        // Debug: Check what's in the state after setting it
        console.log("State will be set to:", pointsMap)
      } catch (err: unknown) {
        console.error("Error fetching data:", err)
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { error?: string } }; message?: string }
          setError(axiosError.response?.data?.error || axiosError.message || "Failed to fetch data.")
        } else {
          setError((err as Error).message || "Failed to fetch data.")
        }
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

  const handleStatusChange = (subtaskId: string, studentEmail: string, status: string) => {
    setSubtaskStudentPoints((prev) => ({
      ...prev,
      [subtaskId]: {
        ...prev[subtaskId],
        [studentEmail]: status,
      },
    }))
  }

  const getPointsForStatus = (status: string, subtaskPoints: number) => {
    switch (status) {
      case "completely_finished":
        return subtaskPoints
      case "partially_finished":
        return Math.floor(subtaskPoints / 2)
      case "incomplete":
      default:
        return 0
    }
  }

  const handleSubmitPoints = async (contextId: string) => {
    try {
      setError(null)
      const token = Cookies.get("admin_token")
      if (!token || !adminData || !task) {
        throw new Error("Missing required data. Please refresh the page.")
      }

      const context = getCurrentContext()
      if (!context) {
        throw new Error("No valid context found.")
      }

      // For subtasks, find the specific subtask. For tasks, use task data directly
      let subtask = null
      let contextPoints = 0
      let contextName = ""
      let actualSubtaskId = null

      if (context.type === 'subtask') {
        subtask = task.subtasks.find((st) => st.subtask_id === contextId)
        if (!subtask) {
          throw new Error("Subtask not found.")
        }
        contextPoints = subtask.points
        contextName = subtask.name
        actualSubtaskId = subtask.subtask_id
      } else {
        // For direct task management, don't set subtask_id (let backend handle it)
        contextPoints = task.total_points || 0
        contextName = task.task_name
        actualSubtaskId = null  // This signals to backend it's direct task management
      }

      const studentEntries = students.filter(isValidStudent).map((student) => {
        const studentEmail = getStudentEmail(student)
        const status = subtaskStudentPoints[contextId]?.[studentEmail] || "incomplete"
        const points = getPointsForStatus(status, contextPoints)
        return {
          student_email: studentEmail,
          student_name: student.name!,
          points,
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
        subtask_id: actualSubtaskId,
        subtask_name: contextName,
        students: studentEntries,
      }

      console.log("Submitting payload for context:", payload)
      const submitResponse = await axios.post(
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

      console.log("Submit response:", submitResponse.data)

      // Refresh the points data after successful submission
      const pointsRes = await axios.get<{ points: StudentPoint[] }>(
        `https://leaderboard-backend-4uxl.onrender.com/api/admin/manage_task_points/${task.event_id}/${task.task_id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      )
      
      console.log("Refreshed points data:", pointsRes.data)
      
      // Update both students and points mapping from the refreshed data
      const studentMap = new Map<string, Student>()
      const pointsMap: { [subtaskId: string]: { [studentEmail: string]: string } } = {}
      
      pointsRes.data.points.forEach((point) => {
        // Update student data
        if (!studentMap.has(point.student_email)) {
          studentMap.set(point.student_email, {
            email: point.student_email,
            name: point.student_name,
            roll_no: point.roll_no || undefined,
            student_id: point.roll_no || point.student_email.split("@")[0],
            department: undefined,
            year: undefined,
          })
        }
        
        // Update points mapping - use contextId for consistency
        const mappingKey = point.subtask_id || contextId
        if (!pointsMap[mappingKey]) {
          pointsMap[mappingKey] = {}
        }
        pointsMap[mappingKey][point.student_email] = point.status
      })
      
      // Update state with refreshed data
      setStudents(Array.from(studentMap.values()))
      setSubtaskStudentPoints(pointsMap)

      setSuccess((prev) => ({ ...prev, [contextId]: true }))
      setTimeout(() => {
        setSuccess((prev) => ({ ...prev, [contextId]: false }))
      }, 3000)
    } catch (err: unknown) {
      console.error("Error submitting points:", err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } }; message?: string }
        setError(axiosError.response?.data?.error || axiosError.message || "Failed to assign points.")
      } else {
        setError((err as Error).message || "Failed to assign points.")
      }
    }
  }

  const getSubtaskProgress = (subtaskId: string) => {
    const validStudents = students.filter(isValidStudent)
    if (!validStudents.length) return 0
    
    let totalProgress = 0
    validStudents.forEach((student) => {
      const studentEmail = getStudentEmail(student)
      const status = subtaskStudentPoints[subtaskId]?.[studentEmail] || "incomplete"
      
      if (status === "completely_finished") {
        totalProgress += 1 // 100% complete
      } else if (status === "partially_finished") {
        totalProgress += 0.5 // 50% complete
      }
      // incomplete adds 0
    })
    
    return Math.round((totalProgress / validStudents.length) * 100)
  }

  // Helper function to get current working context (subtask or main task)
  const getCurrentContext = () => {
    if (!task) return null
    
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        type: 'subtask',
        current: task.subtasks.find((st) => st.subtask_id === activeSubtaskId),
        points: task.subtasks.find((st) => st.subtask_id === activeSubtaskId)?.points || 0
      }
    } else {
      return {
        type: 'task',
        current: task,
        points: task.total_points || 0
      }
    }
  }

  // Filter subtasks based on search term
  const filteredSubtasks =
    task?.subtasks.filter(
      (subtask) =>
        subtask.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subtask.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const activeSubtask = task?.subtasks.find((st) => st.subtask_id === activeSubtaskId)
  const hasSubtasks = task?.subtasks && task.subtasks.length > 0
  
  // Get the current working ID and context for point management
  const getWorkingId = () => {
    if (hasSubtasks && activeSubtask) {
      return activeSubtask.subtask_id
    } else if (!hasSubtasks && task) {
      return task.task_id // Use task_id when no subtasks for consistency
    }
    return ""
  }

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
      {/* Header */}
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
        {/* Updated Sidebar with Search and Scroll */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:relative z-30 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out h-full flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-black">
                  {hasSubtasks ? "Subtasks" : "Task Management"}
                </h2>
                <p className="text-sm text-black/80">
                  {hasSubtasks 
                    ? (searchTerm
                        ? `${filteredSubtasks.length} of ${task?.subtasks.length || 0}`
                        : `${task?.subtasks.length || 0} Total`)
                    : "Direct Point Assignment"
                  }
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

          {/* Search Bar - Only show for subtasks */}
          {hasSubtasks && (
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
          )}

          {/* Task Overview */}
          {task && (
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="grid grid-cols-2 gap-3 mb-3">
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
                  <p className="text-lg font-bold text-gray-900">{students.filter(isValidStudent).length}</p>
                </div>
              </div>

              
            </div>
          )}

          {/* Scrollable Subtasks List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {hasSubtasks ? (
                filteredSubtasks.length > 0 ? (
                  filteredSubtasks.map((subtask) => {
                    const progress = getSubtaskProgress(subtask.subtask_id)
                    const isActive = activeSubtaskId === subtask.subtask_id
                    const originalIndex = task?.subtasks.findIndex((st) => st.subtask_id === subtask.subtask_id) || 0

                    return (
                      <div
                        key={subtask.subtask_id}
                        onClick={() => {
                          setActiveSubtaskId(subtask.subtask_id)
                          setSidebarOpen(false)
                        }}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                                }`}
                            >
                              {originalIndex + 1}
                            </div>
                            <span className={`font-semibold text-sm ${isActive ? "text-white" : "text-gray-900"}`}>
                              {subtask.name}
                            </span>
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
                              className={`h-full rounded-full transition-all duration-300 ${isActive ? "bg-white" : "bg-gradient-to-r from-green-400 to-green-600"
                                }`}
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
                  })
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {searchTerm ? `No subtasks found for "${searchTerm}"` : "No subtasks available"}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )
              ) : (
                /* No Subtasks - Direct Task Management */
                <div className="text-center py-8">
                  {/* Task Progress Card */}
                  <div className="p-4 rounded-xl cursor-pointer transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white text-sm font-medium">
                        {task?.task_name}
                      </p>
                      <span className="text-blue-600 text-xs font-semibold bg-blue-100 px-2 py-1 rounded-full">
                        {task?.total_points || 0} pts
                      </span>
                    </div>
                    
                    {/* Progress Stats */}
                    {(() => {
                      const validStudents = students.filter(isValidStudent)
                      const taskProgress = validStudents.length > 0 ? (() => {
                        let totalProgress = 0
                        validStudents.forEach((student) => {
                          const studentEmail = getStudentEmail(student)
                          const status = subtaskStudentPoints[task?.task_id || ""]?.[studentEmail] || "incomplete"
                          
                          if (status === "completely_finished") {
                            totalProgress += 1 // 100% complete
                          } else if (status === "partially_finished") {
                            totalProgress += 0.5 // 50% complete
                          }
                          // incomplete adds 0
                        })
                        return Math.round((totalProgress / validStudents.length) * 100)
                      })() : 0

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-white font-semibold">
                              {validStudents.length} students total
                            </span>
                            <span className="text-white font-semibold">
                              {taskProgress}% complete
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-gray-300/50 rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full bg-gradient-to-r from-white- to-white rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${taskProgress}%` }}
                            ></div>
                          </div>

                          

                          {/* Success Message */}
                          {success[task?.task_id || ""] && (
                            <div className="mt-3 flex items-center justify-center gap-1 text-green-600 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Points Updated!</span>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          {filteredSubtasks.length > 5 && (
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-center flex-shrink-0">
              <p className="text-xs text-gray-500">Scroll to see more subtasks</p>
            </div>
          )}
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Error Messages */}
            {error && (
              <div className="mb-6 bg-red-100 border border-red-200 text-red-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 mr-3" />
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            {/* Active Content - Subtask or Task */}
            {(activeSubtask || (!hasSubtasks && task)) ? (
              <div className="space-y-6">
                {/* Header - Subtask or Task */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {hasSubtasks ? activeSubtask?.name : task?.task_name}
                      </h2>
                      <p className="text-gray-600">
                        {hasSubtasks ? activeSubtask?.description : task?.description}
                      </p>
                      {!hasSubtasks && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          Task Management
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">
                        {hasSubtasks ? activeSubtask?.points : task?.total_points} points
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {hasSubtasks ? activeSubtask?.deadline : task?.deadline}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{students.filter(isValidStudent).length}</div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {
                          students.filter((student) => {
                            if (!isValidStudent(student)) return false
                            const studentEmail = getStudentEmail(student)
                            const contextId = getWorkingId()
                            const status = subtaskStudentPoints[contextId]?.[studentEmail] || "incomplete"
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
                            if (!isValidStudent(student)) return false
                            const studentEmail = getStudentEmail(student)
                            const contextId = getWorkingId()
                            const status = subtaskStudentPoints[contextId]?.[studentEmail] || "incomplete"
                            return status === "partially_finished"
                          }).length
                        }
                      </div>
                      <div className="text-sm text-amber-600">Partial</div>
                    </div>
                  </div>

                  
                </div>

                {/* Students Management */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                    {!hasSubtasks && (
                      <span className="text-sm text-gray-500">
                        (Direct Task Points)
                      </span>
                    )}
                  </div>

                  {students.filter(isValidStudent).length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {students.filter(isValidStudent).map((student) => {
                          // Use student email as the consistent key to match the points data
                          const studentEmail = getStudentEmail(student)
                          const contextId = getWorkingId()
                          const currentStatus = subtaskStudentPoints[contextId]?.[studentEmail] || "incomplete"
                          const maxPoints = hasSubtasks ? (activeSubtask?.points || 0) : (task?.total_points || 0)
                          const currentPoints = getPointsForStatus(currentStatus, maxPoints)

                          console.log(`Student ${student.name} (${studentEmail}):`)
                          console.log(`  - contextId: ${contextId}`)
                          console.log(`  - hasSubtasks: ${hasSubtasks}`)
                          console.log(`  - currentStatus: ${currentStatus}`)
                          console.log(`  - maxPoints: ${maxPoints}`)

                          return (
                            <div
                              key={studentEmail}
                              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {student.name!.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        
                                        
                                        {student.email && (
                                          <>
                                            
                                            <span className="text-blue-600">{student.email}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                  <select
                                    value={currentStatus}
                                    onChange={(e) =>
                                      handleStatusChange(contextId, studentEmail, e.target.value)
                                    }
                                    className="border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                                  >
                                    <option value="completely_finished">✅ Completely Finished</option>
                                    <option value="partially_finished">⚠️ Partially Finished</option>
                                    <option value="incomplete">❌ Incomplete</option>
                                  </select>

                                  <div
                                    className={`px-4 py-2 rounded-lg font-bold text-center min-w-[80px] ${currentPoints === maxPoints
                                      ? "bg-emerald-100 text-emerald-700"
                                      : currentPoints === Math.floor(maxPoints / 2)
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

                      {/* Submit Button */}
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => {
                            const contextId = getWorkingId()
                            handleSubmitPoints(contextId)
                          }}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Save className="w-5 h-5" />
                          Submit Points
                        </button>

                        {(() => {
                          const contextId = getWorkingId()
                          return success[contextId] && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold">
                              <CheckCircle2 className="w-5 h-5" />
                              Points assigned successfully!
                            </div>
                          )
                        })()}
                      </div>
                    </>
                  ) : (
                    /* No Valid Students Message */
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserX className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Valid Students Available</h3>
                      <p className="text-gray-500 mb-4">
                        {students.length > 0 
                          ? "All students in this task have invalid or missing names."
                          : `No students are enrolled for this ${hasSubtasks ? 'subtask' : 'task'}. Students will appear here once they have task activity.`
                        }
                      </p>
                      {students.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                          <p className="text-yellow-600 text-sm">
                            Found {students.length} student records, but {students.filter(s => !s?.name || s.name.trim() === '').length} have null or empty names.
                          </p>
                        </div>
                      )}
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Students are automatically loaded from the points API:</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                          /api/admin/manage_task_points/{task ? `${task.event_id}/${task.task_id}` : ''}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {hasSubtasks ? "Select a Subtask" : "Loading Task..."}
                </h3>
                <p className="text-gray-500">
                  {hasSubtasks 
                    ? "Choose a subtask from the sidebar to manage student points"
                    : "Please wait while we load the task details"
                  }
                </p>
              </div>
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
        
        /* Custom scrollbar for sidebar */
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