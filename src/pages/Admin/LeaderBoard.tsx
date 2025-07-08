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
    Calendar,
    BookOpen,
    ArrowLeftFromLine,
    AlertCircle
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
    achievements: string[]
    totalProjects: number
    completionRate: number
    joinDate: string
    streak: number
    weeklyChange: number
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

// Student Profile Component
export const StudentProfile = ({ student }: { student: Student }) => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Student Profile
                            </h1>
                            <p className="text-gray-600">Detailed performance overview</p>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 hover:border-yellow-300/50 p-6 rounded-3xl mb-6 shadow-xl hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
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
                                    className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 h-3 rounded-full transition-all duration-300 shadow-lg"
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
                                            className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <IconComponent className="w-6 h-6 text-yellow-600" />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-4 rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-blue-500" />
                                <div>
                                    <div className="text-gray-900 text-2xl font-bold">{student.totalProjects}</div>
                                    <div className="text-gray-600 text-sm">Projects Completed</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-4 rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-green-500" />
                                <div>
                                    <div className="text-gray-900 text-2xl font-bold">{student.completionRate}%</div>
                                    <div className="text-gray-600 text-sm">Completion Rate</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-4 rounded-2xl shadow-xl">
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
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-4 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-gray-500" />
                            <span className="text-gray-600">Joined {student.joinDate}</span>
                        </div>
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
                    setLeaderboardData({
                        overall: leaderboardResponse.data.overall || [],
                        weekly: leaderboardResponse.data.weekly || [],
                        monthly: leaderboardResponse.data.monthly || [],
                    })
                } else {
                    setError("Failed to fetch leaderboard data")
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching leaderboard data")
            } finally {
                setLoading(false)
            }
        }
        if (event_id) {
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
        const apiList = leaderboardData[view as 'overall'] || []
        return apiList
            .map((student: any, idx: number) => ({
                id: student._id,
                rank: idx + 1,
                name: student.name || student.email || "Unknown",
                level: student.level || 1,
                points: student.total_score || 0,
                avatar: student.name ? student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : (student.email ? student.email[0].toUpperCase() : '?'),
                progress: 100,
                achievements: student.achievements || [],
                totalProjects: student.totalProjects || 0,
                completionRate: student.completionRate || 0,
                joinDate: student.joinDate || '',
                streak: student.streak || 0,
                weeklyChange: student.weeklyChange || 0,
            }))
    }

    const filteredStudents = getFilteredStudents()

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
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">Leaderboard</h2>
                                <p className="text-white/80 text-sm lg:text-base font-medium">
                                    {view === "weekly" ? "Top weekly performers" : view === "monthly" ? "Top monthly performers" : "Top performers overall"}
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

            <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-6 shadow-2xl">
                            <Trophy className="h-10 w-10 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl h-18 font-bold mb-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Users Rankings
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                            Track Users performance and achievements with real-time leaderboard updates
                        </p>
                    </div>

                    {/* Filter Tabs - Overall, Weekly, and Monthly */}
                    <div className="flex gap-2 py-1 mb-8 justify-center">
                        <Link to="/leaderboard/overall">
                            <button
                                className={`px-6 py-3 rounded-xl transition-all font-medium shadow-lg transform hover:scale-105 ${view === "overall" ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-black" : "bg-white/90 text-gray-700 hover:text-yellow-600 hover:bg-white backdrop-blur-sm"}`}
                            >
                                Overall
                            </button>
                        </Link>

                    </div>

                    {/* Student List */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full mb-8 shadow-lg">
                                <Trophy className="h-12 w-12 text-yellow-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Loading Leaderboard...</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">Please wait while we fetch the data</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mb-8 shadow-lg">
                                <AlertCircle className="h-12 w-12 text-red-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Leaderboard</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">{error}</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full mb-8 shadow-lg">
                                <Users className="h-12 w-12 text-yellow-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Users Found</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                No users with complete details are available for this leaderboard
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-6">
                            {filteredStudents.map((student: Student, index: number) => {
                                const statusInfo = getStatusDisplay(student, index, filteredStudents)
                                return (
                                    <div
                                        key={student.id}
                                        className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 transition-all duration-500"
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
                                                            {student.achievements.map((achievement, achievementIndex) => {
                                                                const IconComponent = achievementIcons[achievement as keyof typeof achievementIcons]
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
                            })}
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
export default function LeaderBoard() {
    const location = useLocation()
    const { view, studentId } = useParams()
    const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[] }>({ overall: [], weekly: [], monthly: [] })

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const jwtToken = document.cookie.split(';').find(c => c.trim().startsWith('jwt='))?.split('=')[1]
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leaderboard-backend-4uxl.onrender.com'
                const leaderboardResponse = await axios.post(
                    `${API_BASE_URL}/api/student/leaderboard/`,
                    {},
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                )
                if (leaderboardResponse.data.success) {
                    setLeaderboardData({
                        overall: leaderboardResponse.data.overall || [],
                        weekly: leaderboardResponse.data.weekly || [],
                        monthly: leaderboardResponse.data.monthly || [],
                    })
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard data:", err)
            }
        }
        fetchLeaderboard()
    }, [])

    // Check if we're on a student profile page
    if (location.pathname.startsWith("/student/") && studentId) {
        // Find student data from the leaderboard
        const student = leaderboardData?.overall?.find((s: any) => s._id === studentId);
        if (student) {
            const formattedStudent: Student = {
                id: student._id,
                rank: 0,
                name: student.name || student.email || "Unknown",
                level: student.level || 1,
                points: student.total_score || 0,
                avatar: student.name ? student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : (student.email ? student.email[0].toUpperCase() : '?'),
                progress: 100,
                achievements: student.achievements || [],
                totalProjects: student.totalProjects || 0,
                completionRate: student.completionRate || 0,
                joinDate: student.joinDate || '',
                streak: student.streak || 0,
                weeklyChange: student.weeklyChange || 0,
            };
            return <StudentProfile student={formattedStudent} />;
        }
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                    <h2 className="text-gray-900 text-2xl font-bold mb-4">Student Profile</h2>
                    <p className="text-gray-600 mb-4">Student ID: {studentId}</p>
                    <Link to="/leaderboard/overall">
                        <button className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black px-6 py-2 rounded-xl transition-colors shadow-lg font-semibold">
                            Back to Leaderboard
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    // Default to leaderboard view
    return <LeaderBoardView view={view || "overall"} />
}