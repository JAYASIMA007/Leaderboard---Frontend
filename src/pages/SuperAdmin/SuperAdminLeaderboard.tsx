"use client"

import type React from "react"

import {
    Trophy,
    Users,
    TrendingUp,
    Star,
    Flame,
    Award,
    Zap,
    Target,
    Crown,
    Shield,
    Gem,
    Sword,
    ArrowLeft,
    Calendar,
    BookOpen,
    ArrowLeftFromLine,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

type Achievement = keyof typeof achievementIcons;

interface Student {
    id: string
    rank: number
    name: string
    level: number
    points: number
    avatar: string
    progress: number
    weeklyChange: number
    achievements: Achievement[]
    totalProjects: number
    completionRate: number
    joinDate: string
    streak: number
}

const achievementIcons = {
    trophy: Trophy,
    star: Star,
    flame: Flame,
    award: Award,
    zap: Zap,
    target: Target,
    crown: Crown,
    shield: Shield,
    gem: Gem,
    sword: Sword,
}

const getRankColor = (rank: number) => {
    switch (rank) {
        case 1:
            return "bg-gradient-to-r from-yellow-400 to-yellow-500"
        case 2:
            return "bg-gradient-to-r from-gray-300 to-gray-400"
        case 3:
            return "bg-gradient-to-r from-orange-400 to-orange-500"
        case 4:
            return "bg-gradient-to-r from-amber-400 to-amber-500"
        case 5:
            return "bg-gradient-to-r from-yellow-600 to-orange-600"
        default:
            return "bg-gradient-to-r from-blue-400 to-blue-500"
    }
}

const getAvatarColor = (rank: number) => {
    switch (rank) {
        case 1:
            return "bg-gradient-to-r from-blue-500 to-blue-600"
        case 2:
            return "bg-gradient-to-r from-purple-500 to-purple-600"
        case 3:
            return "bg-gradient-to-r from-green-500 to-green-600"
        case 4:
            return "bg-gradient-to-r from-orange-500 to-orange-600"
        case 5:
            return "bg-gradient-to-r from-pink-500 to-pink-600"
        default:
            return "bg-gradient-to-r from-gray-500 to-gray-600"
    }
}

// Student Profile Component - Exported for potential future use
export const StudentProfile = ({ student }: { student: Student }) => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
                            <p className="text-gray-600">Detailed performance overview</p>
                        </div>
                    </div>
                    {/* Profile Card */}
                    <div className="bg-white border border-gray-200 hover:border-blue-300 p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                                {student.avatar}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h2>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span>Level {student.level}</span>
                                    <span>•</span>
                                    <span>Rank #{student.rank}</span>
                                    <span>•</span>
                                    <span>{student.points.toLocaleString()} points</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-green-600 text-lg font-semibold mb-1">
                                    {student.weeklyChange >= 0 ? "+" : ""}
                                    {student.weeklyChange} this week
                                </div>
                                <div className="text-gray-500 text-sm">Weekly Progress</div>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress to Next Level</span>
                                <span>{student.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${student.progress}%` }}
                                />
                            </div>
                        </div>
                        {/* Achievements */}
                        <div className="mb-6">
                            <h3 className="text-gray-900 font-semibold mb-3">Achievements</h3>
                            <div className="flex gap-3">
                                {student.achievements.map((achievement, index) => {
                                    const IconComponent = achievementIcons[achievement as keyof typeof achievementIcons]
                                    return (
                                        <div
                                            key={index}
                                            className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center shadow-sm"
                                        >
                                            <IconComponent className="w-6 h-6 text-blue-600" />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-blue-500" />
                                <div>
                                    <div className="text-gray-900 text-2xl font-bold">{student.totalProjects}</div>
                                    <div className="text-gray-600 text-sm">Projects Completed</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-green-500" />
                                <div>
                                    <div className="text-gray-900 text-2xl font-bold">{student.completionRate}%</div>
                                    <div className="text-gray-600 text-sm">Completion Rate</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <Flame className="w-8 h-8 text-orange-500" />
                                <div>
                                    <div className="text-gray-900 text-2xl font-bold">{student.streak}</div>
                                    <div className="text-gray-600 text-sm">Day Streak</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Additional Info */}
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-gray-500" />
                            <span className="text-gray-600">Joined {student.joinDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Events Selection Component
const EventsSelection = () => {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState<any[]>([])
    const [filteredTasks, setFilteredTasks] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [isMobile, setIsMobile] = useState(false)

    const ITEMS_PER_PAGE = 6

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

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

    // Filter tasks based on search query
    useEffect(() => {
        const filtered = tasks.filter((task) => {
            const eventName = task.event_name?.toLowerCase() || ""
            const adminNames = task.assigned_to?.map((admin: any) => admin.name?.toLowerCase()).join(" ") || ""
            const levelNames = task.levels?.map((level: any) => level.level_name?.toLowerCase()).join(" ") || ""

            const searchTerm = searchQuery.toLowerCase()

            return eventName.includes(searchTerm) || adminNames.includes(searchTerm) || levelNames.includes(searchTerm)
        })

        setFilteredTasks(filtered)
        setCurrentPage(1) // Reset to first page when search changes
    }, [searchQuery, tasks])

    const handleEventClick = (eventId: string) => {
        navigate(`/superadmin/leaderboard/${eventId}/overall`)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Pagination calculations
    const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentTasks = filteredTasks.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const generatePageNumbers = () => {
        const pages = []
        const maxVisiblePages = isMobile ? 3 : 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2)
            let startPage = Math.max(1, currentPage - halfVisible)
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1)
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }
        }

        return pages
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-6 sm:p-8 rounded-3xl text-center shadow-2xl max-w-sm sm:max-w-md w-full mx-4">
                    <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Loading Events...</h2>
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-yellow-600 mx-auto"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-6 sm:p-8 rounded-3xl text-center shadow-2xl max-w-sm sm:max-w-md w-full mx-4">
                    <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Error</h2>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black px-4 sm:px-6 py-2 rounded-xl transition-colors shadow-lg font-semibold text-sm sm:text-base"
                    >
                        Retry
                    </button>
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

            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border-b border-purple-200/50 shadow-md">
                <div className="absolute inset-0 bg-black/5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                        }}
                    ></div>
                </div>
                <div className="relative container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                    {/* Header Content */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        {/* Title Section */}
                        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 transform hover:scale-105 transition-transform duration-200 flex-shrink-0">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight drop-shadow-sm truncate">
                                    Events Leaderboard
                                </h1>
                                <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium truncate">
                                    Select an event to view its leaderboard
                                </p>
                            </div>
                        </div>
                        {/* Back Button */}
                        <Link
                            to="/superadmin/dashboard"
                            className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-sm sm:text-base self-end sm:self-auto"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline">Back to Dashboard</span>
                            <span className="xs:hidden">Back</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="relative container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Search Bar */}
                    <div className="mb-8 sm:mb-12">
                        <div className="max-w-md mx-auto">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-div-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search events, admins, or levels..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-2 border-white/30 rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400/60 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 text-base font-medium"
                                />
                                {/* Search highlight border */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-orange-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Search Results Info */}
                        {searchQuery && (
                            <div className="text-center mt-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-white/30">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <p className="text-gray-700 text-sm font-medium">
                                        {filteredTasks.length === 0
                                            ? `No events found for "${searchQuery}"`
                                            : `Found ${filteredTasks.length} event${filteredTasks.length !== 1 ? "s" : ""} for "${searchQuery}"`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        {currentTasks.map((task, index) => (
                            <div
                                key={task._id}
                                className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 hover:border-yellow-300/50 transition-all duration-500 overflow-hidden transform hover:-translate-y-2 cursor-pointer"
                                onClick={() => handleEventClick(task._id)}
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: "fadeInUp 0.6s ease-out forwards",
                                }}
                            >
                                {/* Event Header */}
                                <div className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-400 p-4 sm:p-6 text-black relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
                                    <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full -ml-6 sm:-ml-8 -mb-6 sm:-mb-8" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                                            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-black/80" />
                                            <span className="text-xs sm:text-sm font-medium bg-black/10 px-2 sm:px-3 py-1 rounded-full">
                                                {task.levels?.length || 0} Levels
                                            </span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-black mb-1 group-hover:text-black/80 transition-colors truncate">
                                            {task.event_name}
                                        </h3>
                                        <p className="text-black/70 text-xs sm:text-sm truncate">
                                            {task.assigned_to?.map((admin: any) => admin.name).join(", ") || "No admins assigned"}
                                        </p>
                                    </div>
                                </div>

                                {/* Event Content */}
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            <div className="text-center">
                                                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                                    {task.levels?.reduce((total: number, level: any) => total + (level.tasks?.length || 0), 0) ||
                                                        0}
                                                </div>
                                                <div className="text-gray-600 text-xs sm:text-sm">Total Tasks</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                                    {task.levels?.reduce((total: number, level: any) => total + (level.total_points || 0), 0) ||
                                                        0}
                                                </div>
                                                <div className="text-gray-600 text-xs sm:text-sm">Total Points</div>
                                            </div>
                                        </div>

                                        {/* Levels Preview */}
                                        <div>
                                            <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Levels:</div>
                                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                                {task.levels?.slice(0, isMobile ? 2 : 3).map((level: any) => (
                                                    <span
                                                        key={level.level_id}
                                                        className="px-2 sm:px-3 py-1 bg-blue-100 text-black-800 rounded-full text-xs font-medium truncate max-w-[120px]"
                                                    >
                                                        {level.level_name}
                                                    </span>
                                                ))}
                                                {task.levels?.length > (isMobile ? 2 : 3) && (
                                                    <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                        +{task.levels.length - (isMobile ? 2 : 3)} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="pt-2">
                                            <div className="w-full bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold py-2.5 sm:py-3 px-4 text-center text-sm sm:text-base">
                                                View Leaderboard
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                            {/* Page Info */}
                            <div className="text-sm text-gray-600 order-2 sm:order-1">
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} events
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 ${currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    {generatePageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${currentPage === page
                                                    ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-black shadow-lg"
                                                    : "bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 ${currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        }`}
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredTasks.length === 0 && !loading && (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-3 sm:mb-4">
                                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                {searchQuery ? "No Events Found" : "No Events Available"}
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                {searchQuery
                                    ? `No events match your search for "${searchQuery}". Try different keywords.`
                                    : "There are no events available at the moment."}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4 px-4 sm:px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl transition-colors shadow-lg font-semibold text-sm sm:text-base"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>
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
            `}</style>
        </div>
    )
}

// Main Leaderboard Component
const LeaderBoardView = ({ view }: { view: string }) => {
    const { event_id } = useParams<{ event_id: string }>()
    const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[] }>({
        overall: [],
        weekly: [],
        monthly: [],
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true)
            setError(null)
            try {
                const jwtToken = document.cookie
                    .split(";")
                    .find((c) => c.trim().startsWith("jwt="))
                    ?.split("=")[1]
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com"
                const leaderboardResponse = await axios.post(
                    `${API_BASE_URL}/api/student/leaderboard/`,
                    { event_id },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    },
                )
                if (leaderboardResponse.data.success) {
                    console.log("Leaderboard data received:", leaderboardResponse.data)
                    setLeaderboardData({
                        overall: leaderboardResponse.data.overall || [],
                        weekly: leaderboardResponse.data.weekly || [],
                        monthly: leaderboardResponse.data.monthly || [],
                    })
                } else {
                    console.error("Leaderboard API error:", leaderboardResponse.data)
                    setError("Failed to fetch leaderboard data")
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching leaderboard data")
            } finally {
                setLoading(false)
            }
        }

        if (event_id) {
            console.log("Fetching leaderboard for event ID:", event_id)
            fetchLeaderboard()
        } else {
            setError("No event ID found in URL.")
            setLoading(false)
        }
    }, [view, event_id])

    const getStatusDisplay = (student: Student, index: number, students: Student[]) => {
        if (index === 0) {
            if (students.length > 1) {
                const secondStudent = students[1]
                const difference = student.points - secondStudent.points
                return {
                    text: `${Math.abs(difference)} PTS`,
                    icon: "↑",
                    color: "text-green-600",
                }
            }
            return {
                text: `${student.points} PTS`,
                icon: "↑",
                color: "text-green-600",
            }
        }
        let previousDifferentStudent: Student | null = null
        for (let i = index - 1; i >= 0; i--) {
            if (students[i].points !== student.points) {
                previousDifferentStudent = students[i]
                break
            }
        }
        if (!previousDifferentStudent) {
            return {
                text: `0 PTS`,
                icon: "↑",
                color: "text-green-600",
            }
        }
        const difference = student.points - previousDifferentStudent.points
        if (difference > 0) {
            return {
                text: `${difference} PTS`,
                icon: "↑",
                color: "text-green-600",
            }
        } else {
            return {
                text: `${Math.abs(difference)} PTS`,
                icon: "↓",
                color: "text-red-600",
            }
        }
    }

    const getFilteredStudents = () => {
        const apiList = leaderboardData[view as "overall" | "weekly" | "monthly"] || []
        const filteredList = apiList.filter(
            (student: any) =>
                student.name !== null && student.name !== "" && student.student_id !== null && student.student_id !== "",
        )
        return filteredList.map((student: any, index: number) => ({
            id: student._id,
            rank: index + 1,
            name: student.name || "Unknown",
            level: student.level || 1,
            points: student.total_score || 0,
            avatar: student.name
                ? student.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : "?",
            progress: 100,
            weeklyChange: student.weeklyChange || 0,
            achievements: student.achievements || [],
            totalProjects: student.totalProjects || 0,
            completionRate: student.completionRate || 0,
            joinDate: student.joinDate || "",
            streak: student.streak || 0,
        }))
    }

    const filteredStudents = getFilteredStudents()

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl text-center shadow-lg max-w-sm sm:max-w-md w-full">
                    <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Loading Leaderboard...</h2>
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl text-center shadow-lg max-w-sm sm:max-w-md w-full">
                    <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Error Loading Leaderboard</h2>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors shadow-md font-semibold text-sm sm:text-base"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Enhanced Navbar */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                        {/* Logo Section */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Leaderboard</h2>
                                <p className="text-gray-600 text-xs sm:text-sm lg:text-base font-medium">
                                    {view === "weekly" ? "Top weekly performers" : "Top performers overall"}
                                </p>
                            </div>
                        </div>
                        {/* Navigation Buttons */}
                        <div className="flex flex-row items-center gap-2 sm:gap-3 lg:gap-4">
                            <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm border border-gray-200 text-xs sm:text-sm">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{filteredStudents.length} Users</span>
                            </div>
                            <Link
                                to="/superadmin/dashboard"
                                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-blue-600 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 text-xs sm:text-sm"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Back to Dashboard</span>
                            </Link>
                            <Link
                                to="/superadmin/leaderboard"
                                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-blue-600 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 text-xs sm:text-sm"
                            >
                                <ArrowLeftFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Back to Events</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-lg">
                            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 text-gray-900">
                            Users Rankings
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4">
                            Track Users performance and achievements with real-time leaderboard updates
                        </p>
                    </div>

                    {/* Filter Tabs - Only Overall and Weekly */}
                    <div className="flex gap-2 mb-6 sm:mb-8 justify-center">
                        <Link to={`/superadmin/leaderboard/${event_id}/overall`}>
                            <button
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all font-medium shadow-sm border text-sm sm:text-base ${view === "overall"
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                        : "bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-gray-200"
                                    }`}
                            >
                                Overall
                            </button>
                        </Link>
                    </div>

                    {/* Student List */}
                    <div className="space-y-3 sm:space-y-4 mb-6">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const statusInfo = getStatusDisplay(student, index, filteredStudents)
                                return (
                                    <div
                                        key={student.id}
                                        className="group bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                                    >
                                        <div className="p-4 sm:p-6">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                {/* Rank */}
                                                <div
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${getRankColor(index + 1)} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md flex-shrink-0`}
                                                >
                                                    #{index + 1}
                                                </div>
                                                {/* Avatar */}
                                                <div
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${getAvatarColor(index + 1)} rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 text-sm sm:text-base`}
                                                >
                                                    {student.avatar}
                                                </div>
                                                {/* Student Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                                        <div className="min-w-0">
                                                            <h3 className="text-gray-900 font-semibold text-base sm:text-lg transition-colors truncate">
                                                                {student.name}
                                                            </h3>
                                                            <p className="text-gray-600 text-xs sm:text-sm">Level {student.level}</p>
                                                        </div>
                                                        <div className="text-left sm:text-right flex-shrink-0">
                                                            {view === "weekly" ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className={`font-bold text-lg sm:text-xl ${statusInfo.color}`}>
                                                                        {statusInfo.text}
                                                                    </span>
                                                                    <span className={`text-lg sm:text-xl ${statusInfo.color}`}>{statusInfo.icon}</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-gray-900 font-bold text-lg sm:text-xl">
                                                                        {student.points.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-gray-500 text-xs sm:text-sm">Points</div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${student.progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        {/* Achievement Icons */}
                                                        <div className="flex gap-1 sm:gap-2">
                                                            {student.achievements.slice(0, isMobile ? 3 : 5).map((achievement: Achievement, achievementIndex: number) => {
                                                                const IconComponent = achievementIcons[achievement as keyof typeof achievementIcons]
                                                                return (
                                                                    <div key={achievementIndex} className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600">
                                                                        <IconComponent className="w-full h-full" />
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                        {/* Secondary Info */}
                                                        <div className="flex items-center gap-1">
                                                            {view === "weekly" ? (
                                                                <div className="text-gray-500 text-xs sm:text-sm">
                                                                    {student.points.toLocaleString()} pts total
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${statusInfo.color}`} />
                                                                    <span className={`text-xs sm:text-sm font-medium ${statusInfo.color}`}>
                                                                        {statusInfo.text} {statusInfo.icon}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-8 sm:py-12">
                                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-3 sm:mb-4">
                                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    There are no students participating in this event yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Main Component with Routing Logic
export default function SuperAdminLeaderBoard() {
    const location = useLocation()
    const { view, studentId, event_id } = useParams<{ view?: string; studentId?: string; event_id?: string }>()

    // Check if we're on a student profile page
    if (location.pathname.startsWith("/student/") && studentId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl text-center shadow-lg max-w-sm sm:max-w-md w-full">
                    <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Student Profile</h2>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                        Student profile feature is not implemented yet.
                    </p>
                    <Link to="/superadmin/leaderboard">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors shadow-md font-semibold text-sm sm:text-base">
                            Back to Events
                        </button>
                    </Link>
                </div>
            </div>
        )
    }
    // If no event_id is provided, show the events selection
    if (!event_id) {
        return <EventsSelection />
    }

    // Default to leaderboard view with event_id
    return <LeaderBoardView view={view || "overall"} />
}