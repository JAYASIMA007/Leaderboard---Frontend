import {
    Trophy,
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
} from "lucide-react"
import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import LeaderBoardView from "./LeaderBoardView"

interface Student {
    id: string
    rank: number
    name: string
    level: number
    points: number // Maps to total_score
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

// Student Profile Component
const StudentProfile = ({ student }: { student: Student }) => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-20 left-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 p-2.5 sm:p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Student Profile
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">Detailed performance overview</p>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 hover:border-yellow-300/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-xl hover:shadow-2xl transition-all duration-500">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                            <div
                                className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg`}
                            >
                                {student.avatar}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{student.name}</h2>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 text-sm sm:text-base">
                                    <span>Level {student.level}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Rank #{student.rank}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>
                                        {student.points.toLocaleString()} / {student.total_possible_score.toLocaleString()}{" "}
                                        points
                                    </span>
                                </div>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                                <div className="text-green-600 text-base sm:text-lg font-semibold mb-1">
                                    {student.weeklyChange >= 0 ? "+" : ""}
                                    {student.weeklyChange} this week
                                </div>
                                <div className="text-gray-500 text-xs sm:text-sm">Weekly Progress</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                                <span>Progress to Total Possible Score</span>
                                <span>{student.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 h-2.5 sm:h-3 rounded-full transition-all duration-300 shadow-lg"
                                    style={{ width: `${student.progress}%` }}
                                />
                            </div>
                            {student.progress === 100 && (
                                <div className="text-xs text-yellow-600 font-medium flex items-center gap-1 mt-1.5 sm:mt-2">
                                    <Trophy className="w-3 h-3" />
                                    Max Score!
                                </div>
                            )}
                        </div>

                        {/* Achievements */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-2 sm:mb-3">Achievements</h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {student.achievements.map((achievement, index) => {
                                    const IconComponent = achievementIcons[achievement as keyof typeof achievementIcons]
                                    return (
                                        <div
                                            key={index}
                                            className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                                <div>
                                    <div className="text-gray-900 text-lg sm:text-2xl font-bold">{student.totalProjects}</div>
                                    <div className="text-gray-600 text-xs sm:text-sm">Projects Completed</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                                <div>
                                    <div className="text-gray-900 text-lg sm:text-2xl font-bold">{student.completionRate}%</div>
                                    <div className="text-gray-600 text-xs sm:text-sm">Completion Rate</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                                <div>
                                    <div className="text-gray-900 text-lg sm:text-2xl font-bold">{student.streak}</div>
                                    <div className="text-gray-600 text-xs sm:text-sm">Day Streak</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                            <span className="text-gray-600 text-sm sm:text-base">Joined {student.joinDate}</span>
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

// Main Component with Routing Logic
export default function LeaderBoard() {
    const location = useLocation()
    const { view, studentId } = useParams<{ view: string; studentId: string }>()
    const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[]; total_possible_score?: number }>({
        overall: [],
        weekly: [],
        monthly: [],
    })

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const jwtToken = document.cookie
                    .split(";")
                    .find((c) => c.trim().startsWith("jwt="))
                    ?.split("=")[1]
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com"
                const { event_id } = useParams<{ event_id: string }>()
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
                        total_possible_score: leaderboardResponse.data.total_possible_score || 0,
                    })
                }
            } catch (err: any) {
                console.error("Error fetching leaderboard data:", err)
            }
        }
        fetchLeaderboard()
    }, [view])

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
                const studentPossibleScore = student.total_possible_score || leaderboardData.total_possible_score || 0
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

    // Check if we're on a student profile page
    if (location.pathname.startsWith("/student/") && studentId) {
        const student = filteredStudents.find((s: Student) => s.id === studentId)

        if (!student) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center px-4">
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center shadow-2xl max-w-md w-full">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Student Not Found</h2>
                        <Link to="/leaderboard/overall">
                            <button className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black px-4 sm:px-6 py-2 rounded-xl transition-colors shadow-lg font-semibold text-sm sm:text-base">
                                Back to Leaderboard
                            </button>
                        </Link>
                    </div>
                </div>
            )
        }

        return <StudentProfile student={student} />
    }

    // Default to leaderboard view
    return <LeaderBoardView view={view || "overall"} />
}