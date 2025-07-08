"use client"

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
  
    ArrowLeftFromLine
} from "lucide-react"
import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

interface Student {
    id: string
    rank: number
    name: string
    level: number
    points: number
    avatar: string
    progress: number
    weeklyChange: number
    achievements: string[]
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
            return "bg-gradient-to-r from-orange-600 to-red-600"
    }
}

const getAvatarColor = (rank: number) => {
    switch (rank) {
        case 1:
            return "bg-gradient-to-r from-blue-500 to-blue-600"
        case 2:
            return "bg-gradient-to-r from-amber-500 to-orange-500"
        case 3:
            return "bg-gradient-to-r from-blue-600 to-indigo-600"
        case 4:
            return "bg-gradient-to-r from-orange-500 to-red-500"
        case 5:
            return "bg-gradient-to-r from-blue-700 to-purple-700"
        default:
            return "bg-gradient-to-r from-orange-600 to-red-600"
    }
}



// Events Selection Component
const EventsSelection = () => {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true)
                const response = await axios.get("https://leaderboard-backend-4uxl.onrender.com/api/superadmin/fetch_all_tasks/")
                setTasks(response.data.tasks)
            } catch (err: any) {
                console.error("Error fetching tasks:", err)
                setError(err.response?.data?.error || "Failed to fetch tasks")
            } finally {
                setLoading(false)
            }
        }
        fetchTasks()
    }, [])

    const handleEventClick = (eventId: string) => {
        navigate(`/superadmin/leaderboard/${eventId}/overall`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                    <h2 className="text-gray-900 text-2xl font-bold mb-4">Loading Events...</h2>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                    <h2 className="text-gray-900 text-2xl font-bold mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black px-6 py-2 rounded-xl transition-colors shadow-lg font-semibold"
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
            <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-2xl">
                <div className="absolute inset-0 bg-black/5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                        }}
                    ></div>
                </div>
                <div className="relative container mx-auto px-4 sm:px-6 py-8">
                    {/* Back to Dashboard Button */}
                    <div className="flex justify-start mb-6">
                        <Link
                            to="/superadmin/dashboard"
                            className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </div>
                    
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-black/20 to-black/30 rounded-2xl mb-4 shadow-lg">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-sm mb-2">
                            Events Leaderboard
                        </h1>
                        <p className="text-white/80 text-lg md:text-xl font-medium">
                            Select an event to view its leaderboard
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task, index) => (
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
                                <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-6 text-black relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <Trophy className="w-8 h-8 text-black/80" />
                                            <span className="text-sm font-medium bg-black/10 px-3 py-1 rounded-full">
                                                {task.levels?.length || 0} Levels
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-black mb-1 group-hover:text-black/80 transition-colors">
                                            {task.event_name}
                                        </h3>
                                        <p className="text-black/70 text-sm">
                                            {task.assigned_to?.map((admin: any) => admin.name).join(', ') || 'No admins assigned'}
                                        </p>
                                    </div>
                                </div>

                                {/* Event Content */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {task.levels?.reduce((total: number, level: any) => 
                                                        total + (level.tasks?.length || 0), 0) || 0}
                                                </div>
                                                <div className="text-gray-600 text-sm">Total Tasks</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {task.levels?.reduce((total: number, level: any) => 
                                                        total + (level.total_points || 0), 0) || 0}
                                                </div>
                                                <div className="text-gray-600 text-sm">Total Points</div>
                                            </div>
                                        </div>

                                        {/* Levels Preview */}
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 mb-2">Levels:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {task.levels?.slice(0, 3).map((level: any) => (
                                                    <span 
                                                        key={level.level_id}
                                                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                                                    >
                                                        {level.level_name}
                                                    </span>
                                                ))}
                                                {task.levels?.length > 3 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                        +{task.levels.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="pt-2">
                                            <div className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 group-hover:from-yellow-500 group-hover:via-amber-500 group-hover:to-orange-500 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-300 text-center">
                                                View Leaderboard
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {tasks.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Trophy className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
                            <p className="text-gray-600">There are no events available at the moment.</p>
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
    const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[] }>({ overall: [], weekly: [], monthly: [] })
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true)
            setError(null)
            try {
                const jwtToken = document.cookie.split(';').find(c => c.trim().startsWith('jwt='))?.split('=')[1]
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leaderboard-backend-4uxl.onrender.com'
                const leaderboardResponse = await axios.post(
                    `${API_BASE_URL}/api/student/leaderboard/`,
                    { event_id },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                )
                if (leaderboardResponse.data.success) {
                    console.log('Leaderboard data received:', leaderboardResponse.data)
                    setLeaderboardData({
                        overall: leaderboardResponse.data.overall || [],
                        weekly: leaderboardResponse.data.weekly || [],
                        monthly: leaderboardResponse.data.monthly || [],
                    })
                } else {
                    console.error('Leaderboard API error:', leaderboardResponse.data)
                    setError("Failed to fetch leaderboard data")
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching leaderboard data")
            } finally {
                setLoading(false)
            }
        }
        if (event_id) {
            console.log('Fetching leaderboard for event ID:', event_id)
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
        const apiList = leaderboardData[view as 'overall' | 'weekly' | 'monthly'] || []
        const filteredList = apiList.filter((student: any) => 
            student.name !== null && 
            student.name !== '' && 
            student.student_id !== null && 
            student.student_id !== ''
        )
        
        return filteredList.map((student: any, index: number) => ({
            id: student._id,
            rank: index + 1,
            name: student.name || 'Unknown',
            level: student.level || 1,
            points: student.total_score || 0,
            avatar: student.name ? student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?',
            progress: 100,
            weeklyChange: student.weeklyChange || 0,
            achievements: student.achievements || [],
            totalProjects: student.totalProjects || 0,
            completionRate: student.completionRate || 0,
            joinDate: student.joinDate || '',
            streak: student.streak || 0,
        }))
    }

    const filteredStudents = getFilteredStudents()

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                    <h2 className="text-gray-900 text-2xl font-bold mb-4">Loading Leaderboard...</h2>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                    <h2 className="text-gray-900 text-2xl font-bold mb-4">Error Loading Leaderboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black px-6 py-2 rounded-xl transition-colors shadow-lg font-semibold"
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

            {/* Enhanced Navbar */}
            <nav className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-2xl sticky top-0 z-50">
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
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">Leaderboard</h2>
                                <p className="text-white/80 text-sm lg:text-base font-medium">
                                    {view === "weekly" ? "Top weekly performers" : "Top performers overall"}
                                </p>
                            </div>
                        </div>
                        {/* Student Count Badge */}
                        <div className="flex flex-row items-center space-x-4">
                            <div className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg backdrop-blur-sm">
                                <Users className="w-5 h-5" />
                                <span>{filteredStudents.length} Users</span>
                            </div>
                            <Link
                                to="/superadmin/dashboard"
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                            <Link
                                to="/superadmin/leaderboard"
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                            >
                                <ArrowLeftFromLine className="w-5 h-5" />
                                <span className="hidden sm:inline">Back to Events</span>
                                <span className="sm:hidden">Events</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-6 shadow-2xl">
                            <Trophy className="h-10 w-10 text-black" />
                        </div>
                        <h1 className="text-4xl h-22 md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Users Rankings
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                            Track Users performance and achievements with real-time leaderboard updates
                        </p>
                    </div>

                    {/* Filter Tabs - Only Overall and Weekly */}
                    <div className="flex gap-2 mb-8 justify-center">
                        <Link to={`/superadmin/leaderboard/${event_id}/overall`}>
                            <button
                                className={`px-6 py-3 rounded-xl transition-all font-medium shadow-lg transform hover:scale-105 ${view === "overall"
                                    ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-black"
                                    : "bg-white/90 text-gray-700 hover:text-yellow-600 hover:bg-white backdrop-blur-sm"
                                    }`}
                            >
                                Overall
                            </button>
                        </Link>

                    </div>

                    {/* Student List */}
                    <div className="space-y-4 mb-6">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const statusInfo = getStatusDisplay(student, index, filteredStudents)
                                return (
                                    <div
                                        key={student.id}
                                        className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 hover:border-yellow-300/50 transition-all duration-500 overflow-hidden transform hover:-translate-y-1"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animation: "fadeInUp 0.6s ease-out forwards",
                                        }}
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center gap-4">
                                                {/* Rank */}
                                                <div
                                                    className={`w-12 h-12 ${getRankColor(index + 1)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                                                >
                                                    #{index + 1}
                                                </div>

                                                {/* Avatar */}
                                                <div
                                                    className={`w-12 h-12 ${getAvatarColor(index + 1)} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
                                                >
                                                    {student.avatar}
                                                </div>

                                                {/* Student Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-gray-900 font-semibold text-lg transition-colors">
                                                                {student.name}
                                                            </h3>
                                                            <p className="text-gray-600 text-sm">Level {student.level}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {view === "weekly" ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className={`font-bold text-xl ${statusInfo.color}`}>
                                                                        {statusInfo.text}
                                                                    </span>
                                                                    <span className={`text-xl ${statusInfo.color}`}>
                                                                        {statusInfo.icon}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-gray-900 font-bold text-xl">{student.points.toLocaleString()}</div>
                                                                    <div className="text-gray-500 text-sm">Points</div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                        <div
                                                            className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 h-2 rounded-full transition-all duration-300 shadow-lg"
                                                            style={{ width: `${student.progress}%` }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {/* Achievement Icons */}
                                                        <div className="flex gap-2">
                                                            {student.achievements.map((achievement: string, achievementIndex: number) => {
                                                                const IconComponent: React.FC<{ className: string }> = achievementIcons[achievement as keyof typeof achievementIcons]
                                                                return (
                                                                    <div key={achievementIndex} className="w-6 h-6 text-yellow-600">
                                                                        <IconComponent className="w-full h-full" />
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>

                                                        {/* Secondary Info */}
                                                        <div className="flex items-center gap-1">
                                                            {view === "weekly" ? (
                                                                <div className="text-gray-500 text-sm">{student.points.toLocaleString()} pts total</div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <TrendingUp className={`w-4 h-4 ${statusInfo.color}`} />
                                                                    <span className={`text-sm font-medium ${statusInfo.color}`}>
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
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
                                <p className="text-gray-600">There are no students participating in this event yet.</p>
                            </div>
                        )}
                    </div>
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
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                    <h2 className="text-gray-900 text-2xl font-bold mb-4">Student Profile</h2>
                    <p className="text-gray-600 mb-4">Student profile feature is not implemented yet.</p>
                    <Link to="/superadmin/leaderboard">
                        <button className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black px-6 py-2 rounded-xl transition-colors shadow-lg font-semibold">
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