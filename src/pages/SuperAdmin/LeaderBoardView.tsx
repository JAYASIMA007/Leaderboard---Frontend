
"use client"
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
    ArrowLeft,
    ArrowLeftFromLine,
    Rocket,
} from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import type { JSX } from 'react';

interface Student {
    id: string
    rank: number
    name: string
    level: number
    points: number // Maps to total_score
    total_possible_score: number
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

// Main Leaderboard Component
const LeaderBoardView = ({ view }: { view: string }) => {
    const navigate = useNavigate()
    const { event_id } = useParams<{ event_id: string }>()
    const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[] }>({
        overall: [],
        weekly: [],
        monthly: [],
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [errorCompetition, setErrorCompetition] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [eventTotalPossibleScore, setEventTotalPossibleScore] = useState<number>(0)
    const [processedStudents, setProcessedStudents] = useState<Student[]>([])

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
            setErrorCompetition(null)
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
                    // Assuming total_possible_score is provided at the event level
                    setEventTotalPossibleScore(leaderboardResponse.data.total_possible_score || 0)
                } else {
                    console.error("Leaderboard API error:", leaderboardResponse.data)
                    setErrorCompetition("Failed to fetch leaderboard data")
                }
            } catch (err: any) {
                setErrorCompetition(err.message || "An error occurred while fetching leaderboard data")
            } finally {
                setLoading(false)
            }
        }

        if (event_id) {
            console.log("Fetching leaderboard for event ID:", event_id)
            fetchLeaderboard()
        } else {
            setErrorCompetition("No event ID found in URL.")
            setLoading(false)
        }
    }, [view, event_id])

    // Process students data and calculate progress bars
    useEffect(() => {
        const getFilteredStudents = () => {
            const apiList = leaderboardData[view as "overall" | "weekly" | "monthly"] || []
            const filteredList = apiList.filter(
                (student: any) =>
                    student.name !== null && student.name !== "" && student.student_id !== null && student.student_id !== "",
            )

            return filteredList.map((student: any, index: number) => {
                const studentScore = student.total_score || 0
                const studentPossibleScore = student.total_possible_score || eventTotalPossibleScore || 0
                // Calculate progress as percentage of total_possible_score
                const progressPercentage = studentPossibleScore > 0 ? Math.round((studentScore / studentPossibleScore) * 100) : 0

                return {
                    id: student._id,
                    rank: index + 1,
                    name: student.name || "Unknown",
                    level: student.level || 1,
                    points: studentScore, // Maps to total_score
                    total_possible_score: studentPossibleScore,
                    avatar: student.name
                        ? student.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                        : "?",
                    progress: progressPercentage,
                    weeklyChange: student.weeklyChange || 0,
                    achievements: student.achievements || [],
                    totalProjects: student.totalProjects || 0,
                    completionRate: student.completionRate || 0,
                    joinDate: student.joinDate || "",
                    streak: student.streak || 0,
                }
            })
        }

        const students = getFilteredStudents()
        setProcessedStudents(students)
    }, [leaderboardData, view, eventTotalPossibleScore])

    const getStatusDisplay = (student: Student, index: number, students: Student[]) => {
        const actualRank = index + 1
        let pointsText = ""
        let pointsIcon: string | JSX.Element = ""
        let pointsColor = "text-green-600"
        let tooltipText = ""
        const tooltipIcon = <Rocket size={16} />
        let tooltipColor = "text-green-600"

        if (student.points === 0) {
            pointsText = "💤 Start Progressing"
            pointsIcon = ""
            pointsColor = "text-green-600"
            tooltipText = "Start completing tasks to climb the leaderboard!"
            tooltipColor = "text-green-600"
        } else if (index === 0 || students[0].points === student.points) {
            pointsText = `🏆 #1 Rank`
            pointsIcon = ""
            pointsColor = "text-yellow-600"
            tooltipText = `${student.name} is a champion!`
            tooltipColor = "text-yellow-600"
        } else {
            if (index > 0 && students[index - 1].points === student.points) {
                pointsText = `🛡️ Tied - Need +1`
                pointsIcon = ""
                pointsColor = "text-blue-600"
                const pointsToNext = 1
                tooltipText = `Break tie with ${pointsToNext}+ points to take rank ${actualRank - 1}.`
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
                    tooltipColor = "text-blue-600"
                } else {
                    const nextHigherStudent = previousDifferentStudent
                    const nextHigherRank = previousRank
                    const pointsNeeded = nextHigherStudent.points - student.points + 1
                    pointsText = `🚀Needs +${pointsNeeded} Pts to Rank ${actualRank - 1} ↑`
                    pointsIcon = ""
                    pointsColor = "text-green-600"
                    tooltipText = `${student.name} needs ${pointsNeeded} more points to overtake rank ${nextHigherRank}.`
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

    const handleStudentClick = (studentId: string) => {
        navigate(`/student/${studentId}`)
    }

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

    if (errorCompetition) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl text-center shadow-lg max-w-sm sm:max-w-md w-full">
                    <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
                        Error Loading Leaderboard
                    </h2>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{errorCompetition}</p>
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
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
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
                        <div className="flex flex-row items-center gap-2 sm:gap-3 lg:gap-4">
                            <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm border border-gray-200 text-xs sm:text-sm">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{processedStudents.length} Users</span>
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
                <div className="max-w-5xl mx-auto">
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
                        {eventTotalPossibleScore > 0 && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                                <Trophy className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-800 text-sm font-medium">
                                    Total Possible Score: {eventTotalPossibleScore.toLocaleString()} points
                                </span>
                            </div>
                        )}
                    </div>

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

                    <div className="space-y-3 sm:space-y-4 mb-6">
                        {processedStudents.length > 0 ? (
                            processedStudents.map((student, index) => {
                                const statusInfo = getStatusDisplay(student, index, processedStudents)
                                return (
                                    <div
                                        key={student.id}
                                        className="group bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-visible transform hover:-translate-y-1 cursor-pointer"
                                        onClick={() => handleStudentClick(student.id)}
                                    >
                                        <div className="p-4 sm:p-6">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${getRankColor(
                                                        index + 1,
                                                    )} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md flex-shrink-0`}
                                                >
                                                    #{index + 1}
                                                </div>
                                                <div
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${getAvatarColor(
                                                        index + 1,
                                                    )} rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 text-sm sm:text-base`}
                                                >
                                                    {student.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                                        <div className="min-w-0">
                                                            <h3 className="text-gray-900 font-semibold text-base sm:text-lg transition-colors truncate">
                                                                {student.name}
                                                            </h3>
                                                            <p className="text-gray-600 text-xs sm:text-sm">Level {student.level}</p>
                                                        </div>
                                                        <div className="text-left sm:text-right flex-shrink-0">
                                                            <div className="text-gray-900 font-bold text-lg sm:text-xl">
                                                                {student.points.toLocaleString()} /{" "}
                                                                {student.total_possible_score.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                                            style={{ width: `${student.progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-1 sm:gap-2">
                                                            {student.achievements
                                                                .slice(0, isMobile ? 3 : 5)
                                                                .map((achievement, achievementIndex) => {
                                                                    const IconComponent =
                                                                        achievementIcons[achievement as keyof typeof achievementIcons]
                                                                    return (
                                                                        <div
                                                                            key={achievementIndex}
                                                                            className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
                                                                        >
                                                                            <IconComponent className="w-full h-full" />
                                                                        </div>
                                                                    )
                                                                })}
                                                        </div>
                                                        <div className="flex items-start gap-1">
                                                            <div className="group/tooltip relative flex items-start space-x-2 cursor-pointer">
                                                                <span className={`text-xs sm:text-sm font-medium ${statusInfo.points.color}`}>
                                                                    {statusInfo.points.text}
                                                                </span>
                                                                <span className={`text-xs sm:text-sm ${statusInfo.points.color}`}>
                                                                    {statusInfo.points.icon}
                                                                </span>
                                                                <div
                                                                    className={`
                                    absolute w-max max-w-xs bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg flex items-center space-x-2
                                    opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50
                                    sm:right-0 sm:-translate-x-full sm:top-1/2 sm:-translate-y-1/2
                                    right-0 -translate-x-full top-1/2 -translate-y-1/2 
                                  `}
                                                                >
                                                                    <span className={statusInfo.tooltip.color}>
                                                                        {statusInfo.tooltip.icon}
                                                                    </span>
                                                                    <span>{statusInfo.tooltip.text}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
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

export default LeaderBoardView