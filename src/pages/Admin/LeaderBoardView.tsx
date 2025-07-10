import {
    Trophy,
    Users,
    Star,
    Flame,
    Award,
    Zap,
    Target,
    Crown,
    Shield,
    Gem,
    Sword,
    ArrowLeftFromLine,
    AlertCircle,
    Rocket,
} from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import type { JSX } from "react/jsx-runtime"

interface Student {
    id: string
    rank: number
    name: string
    level: number
    points: number
    total_possible_score: number
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

const getStatusDisplay = (student: Student, index: number, students: Student[]) => {
    const actualRank = index + 1
    let pointsText = ""
    let pointsIcon: string | JSX.Element = ""
    let pointsColor = "text-green-600"
    let tooltipText = ""
    let tooltipIcon: JSX.Element = <Rocket size={16} />
    let tooltipColor = "text-green-600"

    if (student.points === 0) {
        pointsText = "💤 Start Progressing"
        pointsIcon = ""
        pointsColor = "text-green-600"
        tooltipText = "Start completing tasks to climb the leaderboard!"
        tooltipIcon = <Rocket size={16} />
        tooltipColor = "text-green-600"
    } else if (index === 0 || students[0].points === student.points) {
        pointsText = `🏆 #1 Rank`
        pointsIcon = ""
        pointsColor = "text-yellow-600"
        tooltipText = `${student.name} is a champion!`
        tooltipIcon = <Trophy size={16} />
        tooltipColor = "text-yellow-600"
    } else {
        if (index > 0 && students[index - 1].points === student.points) {
            pointsText = `🛡️ Tied - Need +1`
            pointsIcon = ""
            pointsColor = "text-blue-600"
            const pointsToNext = 1
            tooltipText = `Break tie with ${pointsToNext}+ points to take rank ${actualRank - 1}.`
            tooltipIcon = <Shield size={16} />
            tooltipColor = "text-blue-600"
        } else {
            let previousDifferentStudent: Student | null = null
            let previousRank = actualRank
            for (let i = index - 1; i >= 0; i--) {
                if (students[i].points !== student.points) {
                    previousDifferentStudent = students[i]
                    previousRank = i + 1
                    break
                }
            }
            if (!previousDifferentStudent) {
                pointsText = `🛡️ Tied - Need +1`
                pointsIcon = ""
                pointsColor = "text-blue-600"
                const pointsToNext = 1
                tooltipText = `Break tie with ${pointsToNext}+ points to take rank ${actualRank - 1}.`
                tooltipIcon = <Shield size={16} />
                tooltipColor = "text-blue-600"
            } else {
                const nextHigherStudent = previousDifferentStudent
                const nextHigherRank = previousRank
                const pointsNeeded = nextHigherStudent.points - student.points + 1
                pointsText = `🚀Needs +${pointsNeeded} Pts to Rank ${actualRank - 1} ↑`
                pointsIcon = ""
                pointsColor = "text-green-600"
                tooltipText = `${student.name} needs ${pointsNeeded} more points to overtake rank ${nextHigherRank}.`
                tooltipIcon = <Rocket size={16} />
                tooltipColor = "text-green-600"
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

const LeaderBoardView = ({ view }: { view: string }) => {
    const navigate = useNavigate()
    const { event_id } = useParams<{ event_id: string }>()
    const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[] }>({
        overall: [],
        weekly: [],
        monthly: [],
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [openTooltipId, setOpenTooltipId] = useState<string | null>(null)
    const [eventTotalPossibleScore, setEventTotalPossibleScore] = useState<number>(0)
    const tooltipRefs = useRef<Map<string, HTMLDivElement>>(new Map())

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
                    }
                )
                if (leaderboardResponse.data.success) {
                    setLeaderboardData({
                        overall: leaderboardResponse.data.overall || [],
                        weekly: leaderboardResponse.data.weekly || [],
                        monthly: leaderboardResponse.data.monthly || [],
                    })
                    setEventTotalPossibleScore(leaderboardResponse.data.total_possible_score || 0)
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

    const getFilteredStudents = () => {
        const apiList = leaderboardData[view as "overall" | "weekly" | "monthly"] || []
        return apiList
            .filter(
                (student: any) =>
                    student.name &&
                    student.name.trim() !== "" &&
                    student.student_id &&
                    student.student_id.trim() !== "" &&
                    student.status !== "pending"
            )
            .map((student: any, idx: number) => {
                const studentScore = student.total_score || 0
                const studentPossibleScore = student.total_possible_score || eventTotalPossibleScore || 0
                const progressPercentage = studentPossibleScore > 0 ? Math.round((studentScore / studentPossibleScore) * 100) : 0

                return {
                    id: student._id,
                    rank: idx + 1,
                    name: student.name || student.email || "Unknown",
                    level: student.level || 1,
                    points: studentScore,
                    total_possible_score: studentPossibleScore,
                    avatar: student.name
                        ? student.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                        : student.email
                            ? student.email[0].toUpperCase()
                            : "?",
                    progress: progressPercentage,
                    achievements: student.achievements || [],
                    totalProjects: student.totalProjects || 0,
                    completionRate: student.completionRate || 0,
                    joinDate: student.joinDate || "",
                    streak: student.streak || 0,
                    weeklyChange: student.weeklyChange || 0,
                }
            })
    }

    const filteredStudents = getFilteredStudents()

    const handleStudentClick = (studentId: string) => {
        navigate(`/tasks/leaderboard/${event_id}/${view}/${studentId}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-20 left-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        {/* Logo Section */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-black/20 to-black/30 rounded-2xl flex items-center justify-center shadow-lg">
                                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">Leaderboard</h2>
                                <p className="text-white/80 text-xs sm:text-sm lg:text-base font-medium">
                                    {view === "weekly"
                                        ? "Top weekly performers"
                                        : view === "monthly"
                                            ? "Top monthly performers"
                                            : "Top performers overall"}
                                </p>
                            </div>
                        </div>
                        {/* Student Count Badge */}
                        <div className="flex flex-row items-center space-x-2 sm:space-x-4">
                            <div className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white/90 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg backdrop-blur-sm text-sm sm:text-base">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{filteredStudents.length} Users</span>
                            </div>
                            <Link
                                to="/admin/dashboard"
                                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm text-sm sm:text-base"
                            >
                                <ArrowLeftFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Back to Events</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-4 sm:mb-6 shadow-2xl">
                            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl h-20 lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Users Rankings
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto">
                            Track Users performance and achievements with real-time leaderboard updates
                        </p>
                        {eventTotalPossibleScore > 0 && (
                            <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm sm:text-base">
                                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                                <span className="text-yellow-800 font-medium">
                                    Total Possible Score: {eventTotalPossibleScore.toLocaleString()} points
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Filter Tabs - Overall, Weekly, and Monthly */}
                    <div className="flex gap-1.5 sm:gap-2 py-1 mb-6 sm:mb-8 justify-center flex-wrap">
                        <Link to={`/leaderboard/overall`}>
                            <button
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all font-medium shadow-lg transform hover:scale-105 text-sm sm:text-base ${
                                    view === "overall"
                                        ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-black"
                                        : "bg-white/90 text-gray-700 hover:text-yellow-600 hover:bg-white backdrop-blur-sm"
                                }`}
                            >
                                Overall
                            </button>
                        </Link>
                    </div>

                    {/* Student List */}
                    {loading ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full mb-6 sm:mb-8 shadow-lg">
                                <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Loading Leaderboard...</h3>
                            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">Please wait while we fetch the data</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mb-6 sm:mb-8 shadow-lg">
                                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Error Loading Leaderboard</h3>
                            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">{error}</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12 sm:py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full mb-6 sm:mb-8 shadow-lg">
                                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No Users Found</h3>
                            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
                                No users with complete details are available for this leaderboard
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4 mb-6">
                            {filteredStudents.map((student: Student, index: number) => {
                                const statusInfo = getStatusDisplay(student, index, filteredStudents)
                                return (
                                    <div
                                        key={student.id}
                                        className="group bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl cursor-pointer"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animation: "fadeInUp 0.6s ease-out forwards",
                                        }}
                                        onClick={() => handleStudentClick(student.id)}
                                    >
                                        <div className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                                {/* Rank */}
                                                <div
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${getRankColor(
                                                        index + 1
                                                    )} rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg`}
                                                >
                                                    #{index + 1}
                                                </div>
                                                {/* Avatar */}
                                                <div
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${getAvatarColor(
                                                        index + 1
                                                    )} rounded-full flex items-center justify-center text-white font-bold shadow-lg text-base sm:text-lg`}
                                                >
                                                    {student.avatar}
                                                </div>
                                                {/* Student Info */}
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-gray-900 font-semibold text-base sm:text-lg transition-colors">
                                                                {student.name}
                                                            </h3>
                                                            <p className="text-gray-600 text-xs sm:text-sm">Level {student.level}</p>
                                                        </div>
                                                        <div className="text-right mt-2 sm:mt-0">
                                                            <div className="font-bold text-base sm:text-lg text-gray-900">
                                                                {student.points.toLocaleString()} /{" "}
                                                                {student.total_possible_score.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                        <div
                                                            className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 h-2 rounded-full transition-all duration-300 shadow-lg"
                                                            style={{ width: `${student.progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                        {/* Achievement Icons */}
                                                        <div className="flex gap-1.5 sm:gap-2">
                                                            {student.achievements.map((achievement, achievementIndex) => {
                                                                const IconComponent =
                                                                    achievementIcons[achievement as keyof typeof achievementIcons]
                                                                return (
                                                                    <div
                                                                        key={achievementIndex}
                                                                        className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600"
                                                                    >
                                                                        <IconComponent className="w-full h-full" />
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                        {/* Status */}
                                                        <div className="flex items-center gap-1 sm:gap-1.5 mt-2 sm:mt-0">
                                                            <div
                                                                className="group relative flex items-center space-x-1 sm:space-x-2 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setOpenTooltipId(
                                                                        openTooltipId === student.id ? null : student.id
                                                                    )
                                                                }}
                                                                ref={(el) => {
                                                                    if (el) tooltipRefs.current.set(student.id, el)
                                                                    else tooltipRefs.current.delete(student.id)
                                                                }}
                                                            >
                                                                <span
                                                                    className={`text-xs sm:text-sm font-medium ${statusInfo.points.color}`}
                                                                >
                                                                    {statusInfo.points.text}
                                                                </span>
                                                                <span className={`text-xs sm:text-sm ${statusInfo.points.color}`}>
                                                                    {statusInfo.points.icon}
                                                                </span>
                                                                {openTooltipId === student.id && (
                                                                    <div className="absolute bottom-full mb-2 w-max max-w-[80vw] sm:max-w-xs bg-gray-800 text-white text-xs sm:text-sm rounded-lg py-2 px-3 shadow-lg flex items-center space-x-1.5 sm:space-x-2 z-10">
                                                                        <span className={statusInfo.tooltip.color}>
                                                                            {statusInfo.tooltip.icon}
                                                                        </span>
                                                                        <span>{statusInfo.tooltip.text}</span>
                                                                    </div>
                                                                )}
                                                                <div className="absolute opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto bottom-full mb-2 w-max max-w-[80vw] sm:max-w-xs bg-gray-800 text-white text-xs sm:text-sm rounded-lg py-2 px-3 shadow-lg flex items-center space-x-1.5 sm:space-x-2 z-10 transition-opacity duration-200">
                                                                    <span className={statusInfo.tooltip.color}>
                                                                        {statusInfo.tooltip.icon}
                                                                    </span>
                                                                    <span>{statusInfo.tooltip.text}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1.5 sm:mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            Progress: {student.progress}% of total possible
                                                        </span>
                                                        {student.progress === 100 && (
                                                            <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                                                                <Trophy className="w-3 h-3" />
                                                                Max Score!
                                                            </span>
                                                        )}
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
                        transform: translateY(20px);
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
                        transform: translate(15px, -25px) scale(1.05);
                    }
                    66% {
                        transform: translate(-10px, 10px) scale(0.95);
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

export default LeaderBoardView