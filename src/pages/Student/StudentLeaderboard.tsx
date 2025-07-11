import React, { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { jwtDecode } from "jwt-decode"
import Navbar from "../../components/Student/Navbar"
import Loader from "../../components/Loader"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Trophy, Rocket, Shield } from "lucide-react"

// Assets
import sampleProfile from "../../assets/sampleprofile.svg"
import type { JSX } from "react/jsx-runtime"

interface LeaderboardEntry {
  email: string
  _id: string
  name: string | null
  student_id: string
  total_score: number
  tests_taken: number
  average_score: number
  badge: string
  level: number
  status: string
  rank?: number
  timestamp?: string | null
}

interface LeaderboardData {
  overall: LeaderboardEntry[]
  levels: { [key: string]: LeaderboardEntry[] }
  total_students: number
  current_student: {
    rank: number
    points: number
    student_id?: string
    timestamp?: string | null
  }
}

interface JwtPayload {
  name?: string
  email?: string
  [key: string]: any
}

interface StudentLeaderboardProps {
  onEventSelect?: (eventId: string) => void
}

const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({ onEventSelect }) => {
  const navigate = useNavigate()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [numberOfLevels, setNumberOfLevels] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [activeTab, setActiveTab] = useState<string>('overall')
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null)
  const tooltipRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com"

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openTooltipId &&
        !Array.from(tooltipRefs.current.values()).some((ref) => ref.contains(event.target as Node))
      ) {
        setOpenTooltipId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openTooltipId])

  // Decode JWT token to get user name and email
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token)
        setCurrentUserName(decoded.name || decoded.email || null)
      } catch (error) {
        console.error("Error decoding JWT token:", error)
        setCurrentUserName(null)
      }
    }
  }, [])

  const handleEventSelect = useCallback((eventId: string) => {
    setSelectedEvent(eventId)
    setCurrentPage(1)
    setActiveTab('overall')
    if (onEventSelect) {
      onEventSelect(eventId)
    }
  }, [onEventSelect])

  const fetchEventDetails = useCallback(async () => {
    if (!selectedEvent) return

    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/task-details/?event_id=${selectedEvent}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]}`,
        },
      })

      if (response.data.success) {
        setNumberOfLevels(response.data.event.levels.length)
        setError("")
      } else {
        setNumberOfLevels(0)
        setError("Event not found.")
        toast.error("Event not found.")
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
      setError("Failed to fetch event details.")
      toast.error("Failed to fetch event details.")
    }
  }, [API_BASE_URL, selectedEvent])

  const fetchLeaderboardData = useCallback(async () => {
    if (!selectedEvent) {
      setLoading(false)
      setError("Please select an event from the navigation bar.")
      return
    }

    try {
      setLoading(true)
      const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
      if (!token) {
        navigate("/studentlogin")
        toast.error("Please log in to view the leaderboard")
        return
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/student/leaderboard-by-level/`,
        { event_id: selectedEvent },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        const filterValidEntries = (entries: LeaderboardEntry[]) =>
          entries.filter(entry => entry.name && entry.name.trim() !== "" && entry.status !== "Pending")

        const filteredData: LeaderboardData = {
          overall: filterValidEntries(response.data.overall),
          levels: Object.keys(response.data.levels).reduce((acc, key) => ({
            ...acc,
            [key]: filterValidEntries(response.data.levels[key])
          }), {}),
          total_students: response.data.total_students,
          current_student: response.data.current_student,
        }

        setLeaderboardData(filteredData)
        setError("")
      } else {
        const errorMessage = response.data.error === "No points data found for this event"
          ? "No students' points are allocated for this event."
          : response.data.error || "Failed to load leaderboard data"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error: unknown) {
      console.error("Error fetching leaderboard data:", error)
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error === "No points data found for this event"
          ? "No students' points are allocated for this event."
          : error.response?.data?.error || "Failed to load leaderboard data"
        : "Failed to load leaderboard data"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL, navigate, selectedEvent])

  useEffect(() => {
    if (selectedEvent) {
      fetchEventDetails()
      fetchLeaderboardData()
    }
  }, [fetchEventDetails, fetchLeaderboardData, selectedEvent])

  const getStatusDisplay = (student: LeaderboardEntry, index: number, currentData: LeaderboardEntry[]) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index
    const actualRank = globalIndex + 1

    // Status display for the status column
    let pointsText = ""
    let pointsIcon: string | JSX.Element = ""
    let pointsColor = "text-emerald-400"

    // Tooltip remains unchanged
    let tooltipText = ""
    let tooltipIcon: JSX.Element = <Rocket size={16} />
    let tooltipColor = "text-green-400"

    // Check if the current student has zero points
    if (student.total_score === 0) {
      pointsText = "💤 Start Progressing"
      pointsIcon = ""
      pointsColor = "text-green-400"
      tooltipText = "Start completing tasks to climb the leaderboard!"
      tooltipIcon = <Rocket size={16} />
      tooltipColor = "text-green-400"
    } else if (globalIndex === 0 && currentData[0].total_score === student.total_score) {
      // Top rank (first place)
      pointsText = `🏆 #1 Rank`
      pointsIcon = ""
      pointsColor = "text-yellow-400"
      tooltipText = `${student.name} is a champion! Keep earning to stay on top.`
      tooltipIcon = <Trophy size={16} />
      tooltipColor = "text-yellow-400"
    } else if (currentData[0].total_score === student.total_score) {
      // Tied for top score but not first place
      pointsText = `⚡Beat the Clock! Next Time.`
      pointsIcon = ""
      pointsColor = "text-blue-400"
      tooltipText = `Tied for the top score! Complete tasks faster to claim #1 Rank next time.`
      tooltipIcon = <Shield size={16} />
      tooltipColor = "text-blue-400"
    } else {
      // Check if the current student's score matches the previous student's score
      let previousDifferentStudent: LeaderboardEntry | null = null
      let previousRank = actualRank
      if (globalIndex > 0 && currentData[globalIndex - 1].total_score === student.total_score) {
        // Tied with the previous student
        pointsText = `🛡️ Tied - Need +1`
        pointsIcon = ""
        pointsColor = "text-blue-400"
        const pointsToNext = 1
        tooltipText = `Break tie with ${pointsToNext}+ points to take rank ${actualRank - 1}.`
        tooltipIcon = <Shield size={16} />
        tooltipColor = "text-blue-400"
      } else {
        // Find the most recent previous student with a different score
        for (let i = globalIndex - 1; i >= 0; i--) {
          if (currentData[i].total_score !== student.total_score) {
            previousDifferentStudent = currentData[i]
            previousRank = i + 1
            break
          }
        }

        if (!previousDifferentStudent) {
          // No previous student with a different score (all above are tied)
          pointsText = `🛡️ Tied - Need +1`
          pointsIcon = ""
          pointsColor = "text-blue-400"
          const pointsToNext = 1
          tooltipText = `Break tie with ${pointsToNext}+ points to take rank ${actualRank - 1}.`
          tooltipIcon = <Shield size={16} />
          tooltipColor = "text-blue-400"
        } else {
          const nextHigherStudent = previousDifferentStudent
          const nextHigherRank = previousRank
          const pointsNeeded = nextHigherStudent.total_score - student.total_score + 1
          pointsText = `🚀 Earn +${pointsNeeded} Pts to Rank ${actualRank - 1} ↑`
          pointsIcon = ""
          pointsColor = "text-emerald-400"
          tooltipText = `Earn ${pointsNeeded} more points to overtake rank ${nextHigherRank}.`
          tooltipIcon = <Rocket size={16} />
          tooltipColor = "text-green-400"
        }
      }
    }

    return {
      points: {
        text: pointsText,
        icon: pointsIcon,
        color: pointsColor,
      },
      tooltip: {
        text: tooltipText,
        icon: tooltipIcon,
        color: tooltipColor,
      },
    }
  }

  const getPaginatedData = () => {
    if (!leaderboardData) return []
    let currentData: LeaderboardEntry[] = []

    if (activeTab.startsWith('level_')) {
      currentData = leaderboardData.levels[activeTab] || []
    } else {
      currentData = Array.isArray(leaderboardData.overall) ? leaderboardData.overall : []
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return currentData.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    if (!leaderboardData) return 0
    let currentData = leaderboardData[activeTab as keyof LeaderboardData] || leaderboardData.overall
    if (activeTab.startsWith('level_')) {
      currentData = leaderboardData.levels[activeTab] || []
    }
    if (Array.isArray(currentData)) {
      return Math.ceil(currentData.length / itemsPerPage)
    }
    return 0
  }

  const totalPages = getTotalPages()

  // Generate tabs based on number of levels
  const tabs = ['overall', ...Array.from({ length: numberOfLevels }, (_, i) => `level_${i + 1}`)]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Navbar onEventSelect={handleEventSelect} />
        <Loader message="Loading leaderboard..." />
      </div>
    )
  }

  if (error || !leaderboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Navbar onEventSelect={handleEventSelect} />
        <div className="flex items-center justify-center pt-20">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-purple-500/30 text-center border border-purple-500/20">
            <h2 className="text-3xl font-bold text-rose-500 mb-4">Error</h2>
            <p className="text-gray-300 mb-6">{error || "Failed to load leaderboard"}</p>
            <button
              onClick={() => {
                setError("")
                fetchLeaderboardData()
                fetchEventDetails()
              }}
              className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-lg shadow-amber-500/50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans" style={{
      background: `radial-gradient(ellipse 50% 100% at 0% 60%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
      backgroundColor: '#0C0025',
    }}>
      <Navbar onEventSelect={handleEventSelect} />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center my-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
            Leaderboard
          </h1>
          <p className="text-gray-300 text-sm mt-3 max-w-2xl mx-auto">
            Dominate the ranks in our gamified leaderboard! Track your progress and claim your spot at the top!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-800/50 rounded-xl p-2 border border-purple-500/30 shadow-lg shadow-purple-500/20 flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setCurrentPage(1)
                }}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab === 'overall' ? 'OVERALL' : `LEVEL ${tab.split('_')[1]}`}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-4 py-4 px-6">
            <div className="text-center font-semibold text-purple-400 text-md uppercase tracking-wider">RANK</div>
            <div className="text-center font-semibold text-purple-400 text-md uppercase tracking-wider">PLAYER</div>
            <div className="text-center font-semibold text-purple-400 text-md uppercase tracking-wider">POINTS</div>
            <div className="text-center font-semibold text-purple-400 text-md uppercase tracking-wider">STATUS</div>
          </div>

          {/* Data Rows */}
          <div className="space-y-3 pt-5">
            {leaderboardData && getPaginatedData().length === 0 ? (
              <div className="text-center py-8 text-gray-300 text-lg">
                No students have participated
              </div>
            ) : (
              getPaginatedData().map((student: LeaderboardEntry, index: number) => {
                const actualRank = (currentPage - 1) * itemsPerPage + index + 1
                const statusInfo = getStatusDisplay(student, index, getPaginatedData())
                const isCurrentUser = currentUserName && (student.name === currentUserName || student.email === currentUserName)

                return (
                  <div
                    key={student._id}
                    className={`grid grid-cols-4 gap-4 py-4 px-6 backdrop-blur-xl border rounded-3xl transition-all duration-300 hover:scale-[1.01] ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-600/20 border-yellow-500/50 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-purple-400/20 hover:shadow-2xl hover:shadow-purple-500/10'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      <span className={`text-xl font-bold ${isCurrentUser ? 'text-pink-300' : 'text-white'}`}>
                        {actualRank}
                      </span>
                    </div>

                    {/* Candidate Name */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={sampleProfile || "/placeholder.svg"}
                        alt="Profile"
                        className={`h-12 w-12 rounded-full border-2 ${
                          isCurrentUser ? 'border-pink-500/70' : 'border-purple-500/50'
                        }`}
                      />
                      <div>
                        <div className={`font-medium text-base flex items-center space-x-2 ${
                          isCurrentUser ? 'text-pink-300' : 'text-white'
                        }`}>
                          <span>{student.name}</span>
                          {isCurrentUser && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-0 rounded-full border border-yellow-500 animate-bounce">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{student.student_id}</div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-center">
                      <span className={`font-semibold text-lg ${
                        isCurrentUser ? 'text-pink-300' : 'text-amber-400'
                      }`}>
                        {student.total_score}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center">
                      <div
                        className="group relative flex items-center space-x-2 cursor-pointer"
                        onClick={() => setOpenTooltipId(openTooltipId === student._id ? null : student._id)}
                        ref={(el) => {
                          if (el) tooltipRefs.current.set(student._id, el)
                          else tooltipRefs.current.delete(student._id)
                        }}
                      >
                        <span className={`text-sm font-medium ${statusInfo.points.color}`}>
                          {statusInfo.points.text}
                        </span>
                        <span className={`text-sm ${statusInfo.points.color}`}>
                          {statusInfo.points.icon}
                        </span>
                        {openTooltipId === student._id && (
                          <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg flex items-center space-x-2">
                            <span className={statusInfo.tooltip.color}>{statusInfo.tooltip.icon}</span>
                            <span>{statusInfo.tooltip.text}</span>
                          </div>
                        )}
                        <div className="absolute hidden group-hover:block bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg items-center space-x-2">
                          <span className={statusInfo.tooltip.color}>{statusInfo.tooltip.icon}</span>
                          <span>{statusInfo.tooltip.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          <div
            className="grid grid-cols-4 gap-4 py-4 px-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl transition-all duration-300 mt-2 hover:bg-white/[0.04] hover:border-purple-400/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-[1.01]"
            style={{ maxWidth: '100%', width: '100%' }}
          >
            <div className="col-span-1 text-sm text-gray-300 font-medium flex items-center justify-center">
              {leaderboardData
                ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, getPaginatedData().length)} of ${getPaginatedData().length} players`
                : '0-0 of 0 players'}
            </div>
            <div className="col-span-2 flex items-center justify-center space-x-2">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full transition-all duration-300 border-2 border-purple-400/40 shadow-md
                  ${currentPage === 1
                    ? "text-gray-500 bg-gray-800/60 cursor-not-allowed border-none"
                    : "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:scale-110 hover:shadow-pink-400/40"}`}
                title="First Page"
              >
                <ChevronsLeft size={22} />
              </button>
              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full transition-all duration-300 border-2 border-purple-400/40 shadow-md
                  ${currentPage === 1
                    ? "text-gray-500 bg-gray-800/60 cursor-not-allowed border-none"
                    : "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:scale-110 hover:shadow-pink-400/40"}`}
                title="Previous Page"
              >
                <ChevronLeft size={22} />
              </button>
              {/* Page Numbers */}
              <div className="flex space-x-2">
                {totalPages > 0 &&
                  (() => {
                    const pages = []
                    const maxVisiblePages = 5
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1)
                    }
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-10 h-10 flex items-center justify-center text-base font-semibold rounded-full border-2 transition-all duration-300
                            ${currentPage === i
                              ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white border-pink-400 shadow-lg shadow-pink-400/40 scale-110"
                              : "bg-white/10 text-purple-200 border-purple-400/30 hover:bg-pink-400/30 hover:text-white hover:scale-105"}`}
                          style={{ backdropFilter: 'blur(4px)' }}
                        >
                          {i}
                        </button>
                      )
                    }
                    return pages
                  })()}
              </div>
              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full transition-all duration-300 border-2 border-purple-400/40 shadow-md
                  ${currentPage === totalPages
                    ? "text-gray-500 bg-gray-800/60 cursor-not-allowed border-none"
                    : "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:scale-110 hover:shadow-pink-400/40"}`}
                title="Next Page"
              >
                <ChevronRight size={22} />
              </button>
              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full transition-all duration-300 border-2 border-purple-400/40 shadow-md
                  ${currentPage === totalPages
                    ? "text-gray-500 bg-gray-800/60 cursor-not-allowed border-none"
                    : "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:scale-110 hover:shadow-pink-400/40"}`}
                title="Last Page"
              >
                <ChevronsRight size={22} />
              </button>
            </div>
            <div className="col-span-1 flex items-center justify-end space-x-3">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-gray-800/80 text-white border border-pink-400/40 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 shadow"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-pink-300 font-medium">Players per page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentLeaderboard