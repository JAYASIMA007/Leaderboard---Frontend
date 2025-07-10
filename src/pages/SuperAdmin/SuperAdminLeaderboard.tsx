"use client"

import type React from "react"
import {
    Trophy,
    ArrowLeft,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import LeaderBoardView from "./LeaderBoardView"


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