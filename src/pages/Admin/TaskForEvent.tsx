
import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Users,
  Trophy,
  CalendarDays,
  ClipboardList,
  ArrowLeftFromLine,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  Award,
  Loader2,
} from "lucide-react"
import axios from "axios"
import Cookies from "js-cookie"

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
}

interface Level {
  level_id: string
  level_name: string
}

const TaskForEvent: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = Cookies.get("admin_token")
        if (!token) {
          setError("Authentication token missing. Please log in.")
          setLoading(false)
          return
        }
        const response = await axios.post<{ tasks: Task[] }>(
          `https://leaderboard-backend-4uxl.onrender.com/api/admin/get_tasks/${event_id}/`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        )
        const fetchedTasks = response.data.tasks || []
        setTasks(fetchedTasks)

        // Extract unique levels from tasks
        const uniqueLevels = Array.from(
          new Map(
            fetchedTasks.map((task) => [
              task.level_id,
              { level_id: task.level_id, level_name: task.level_name },
            ])
          ).values()
        )
        setLevels(uniqueLevels)
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch tasks.")
      } finally {
        setLoading(false)
      }
    }

    if (event_id) {
      fetchTasks()
    }
  }, [event_id])

  const handleViewReport = (task_id: string) => {
    if (event_id) {
      navigate(`/admin/report/task/${event_id}/${task_id}`)
      console.log(`View report for task: ${task_id} in event: ${event_id}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fully_completed":
        return <CheckCircle2 className="w-4 h-4" />
      case "partially_completed":
        return <AlertCircle className="w-4 h-4" />
      case "incomplete":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fully_completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "partially_completed":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "incomplete":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // Filter tasks based on selected level
  const filteredTasks =
    selectedLevel === "all"
      ? tasks
      : tasks.filter((task) => task.level_id === selectedLevel)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-yellow-200 rounded-full animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin text-yellow-600 absolute top-4 left-4" />
          </div>
          <p className="text-gray-700 font-semibold mt-6 text-lg">Loading Tasks...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Tasks</h3>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced Navbar */}
      <nav className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-2xl sticky top-0 z-50">
        <div className="absolute inset-0 bg-black/5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-black/20 to-black/30 rounded-2xl flex items-center justify-center shadow-lg">
                <CalendarDays className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">Event Dashboard</h2>
                <p className="text-white/80 text-sm lg:text-base font-medium">Task Management & Progress Tracking</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap gap-3 lg:gap-4">
              <Link
                to={`/tasks/students/${event_id}`}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <Users className="w-5 h-5" />
                <span>Users</span>
              </Link>
     
              <Link
                to={`/tasks/leaderboard/${event_id}/`}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <Trophy className="w-5 h-5" />
                <span>Leaderboard</span>
              </Link>
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <ArrowLeftFromLine className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Events</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-6 shadow-2xl">
            <Target className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            Event Tasks
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Manage and track all tasks for this event with detailed progress monitoring
          </p>
        </div>

        {/* Level Switcher */}
        <div className="mb-8 flex flex-wrap gap-3 px-130">
          <button
            onClick={() => setSelectedLevel("all")}
            className={`px-10 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              selectedLevel === "all"
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
          >
            All Levels
          </button>
          {levels.map((level) => (
            <button
              key={level.level_id}
              onClick={() => setSelectedLevel(level.level_id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                selectedLevel === level.level_id
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                  : "bg-white/90 text-gray-700 hover:bg-white"
              }`}
            >
              {level.level_name}
            </button>
          ))}
        </div>

        {/* Tasks Content */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-8 shadow-lg">
              <ClipboardList className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Tasks Found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              No tasks have been created for this {selectedLevel === "all" ? "event" : "level"} yet. Check back later or contact the administrator.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {levels
              .filter((level) => selectedLevel === "all" || level.level_id === selectedLevel)
              .map((level) => (
                <div key={level.level_id}>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                    {level.level_name}
                  </h2>
                  <div className="space-y-8">
                    {filteredTasks
                      .filter((task) => task.level_id === level.level_id)
                      .map((task, index) => (
                        <div
                          key={task.task_id}
                          className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 hover:border-yellow-300/50 transition-all duration-500 overflow-hidden transform hover:-translate-y-1"
                          style={{
                            animationDelay: `${index * 200}ms`,
                            animation: "fadeInUp 0.6s ease-out forwards",
                          }}
                        >
                          {/* Task Header */}
                          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6 text-black" />
                                  </div>
                                  <div>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-black">{task.task_name}</h2>
                                    <p className="text-black/80 font-medium">Level: {task.level_name}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-black">
                                  <div className="bg-black/10 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Star className="w-4 h-4" />
                                      <span className="text-sm font-medium">Total Points</span>
                                    </div>
                                    <p className="text-xl font-bold">{task.total_points}</p>
                                  </div>
                                  <div className="bg-black/10 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Clock className="w-4 h-4" />
                                      <span className="text-sm font-medium">Deadline</span>
                                    </div>
                                    <p className="text-sm font-semibold">{task.deadline}</p>
                                  </div>
                                  <div className="bg-black/10 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Target className="w-4 h-4" />
                                      <span className="text-sm font-medium">Subtasks</span>
                                    </div>
                                    <p className="text-xl font-bold">{task.subtasks.length}</p>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleViewReport(task.task_id)}
                                className="bg-black/20 hover:bg-black/30 text-black font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-black/20"
                              >
                                View Report
                              </button>
                            </div>

                            {task.description && (
                              <div className="mt-6 bg-black/10 rounded-xl p-4">
                                <p className="text-black font-medium">{task.description}</p>
                              </div>
                            )}
                          </div>

                          {/* Subtasks Section */}
                          {task.subtasks.length > 0 && (
                            <div className="p-6 lg:p-8">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                                  <ClipboardList className="w-4 h-4 text-black" />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Subtasks</h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {task.subtasks.map((subtask, subtaskIndex) => (
                                  <div
                                    key={subtask.subtask_id}
                                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                      animationDelay: `${index * 200 + subtaskIndex * 100}ms`,
                                      animation: "fadeInUp 0.6s ease-out forwards",
                                    }}
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{subtask.name}</h4>
                                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                        <Star className="w-4 h-4 text-yellow-600" />
                                      </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{subtask.description}</p>

                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                          Points
                                        </span>
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-sm font-bold">
                                          {subtask.points}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                          Deadline
                                        </span>
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                                          {subtask.deadline}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                          Status
                                        </span>
                                        <span
                                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                                            subtask.status,
                                          )}`}
                                        >
                                          {getStatusIcon(subtask.status)}
                                          {subtask.status.replace("_", " ")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
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

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default TaskForEvent