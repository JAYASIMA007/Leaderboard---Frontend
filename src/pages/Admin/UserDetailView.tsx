import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Trophy,Star, Flame, Award, Zap, Target, Crown, Shield, Gem, Sword, ArrowLeftFromLine, AlertCircle } from "lucide-react"

interface Student {
    id: string
    rank: number
    name: string
    email: string
    student_id: string
    level: number
    points: number
    total_possible_score: number
    tests_taken: number
    average_score: number
    badge: string
    status: string
    achievements: string[]
}

interface Task {
    task_id: string
    task_name: string
    points: number
    points_assigned_on: string
    last_updated_on: string
    status: string
    level_name: string
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

// const getRankColor = (rank: number) => {
//     switch (rank) {
//         case 1:
//             return "bg-gradient-to-r from-yellow-400 to-yellow-500"
//         case 2:
//             return "bg-gradient-to-r from-gray-300 to-gray-400"
//         case 3:
//             return "bg-gradient-to-r from-orange-400 to-orange-500"
//         default:
//             return "bg-gradient-to-r from-orange-600 to-red-600"
//     }
// }

const getAvatarColor = (rank: number) => {
    switch (rank) {
        case 1:
            return "bg-gradient-to-r from-blue-500 to-blue-600"
        case 2:
            return "bg-gradient-to-r from-amber-500 to-orange-500"
        case 3:
            return "bg-gradient-to-r from-blue-600 to-indigo-600"
        default:
            return "bg-gradient-to-r from-orange-600 to-red-600"
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "completely_finished":
            return "text-green-600"
        case "partially_finished":
            return "text-yellow-600"
        case "incomplete":
            return "text-red-600"
        default:
            return "text-gray-600"
    }
}

const UserDetailView = () => {
    const { student_id, event_id, view } = useParams<{ student_id: string; event_id: string; view: string }>()
    const navigate = useNavigate()
    const [student, setStudent] = useState<Student | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStudentDetails = async () => {
            setLoading(true)
            setError(null)
            try {
                const jwtToken = document.cookie
                    .split(";")
                    .find((c) => c.trim().startsWith("jwt="))
                    ?.split("=")[1]
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com"
                const response = await axios.post(
                    `${API_BASE_URL}/api/student/leaderboard/`,
                    { event_id },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                )
                if (response.data.success) {
                    const students = response.data[view as "overall" | "weekly" | "monthly"] || []
                    const selectedStudent = students.find((s: any) => s._id === student_id)
                    if (selectedStudent) {
                        setStudent({
                            id: selectedStudent._id,
                            rank: selectedStudent.rank,
                            name: selectedStudent.name || selectedStudent.email || "Unknown",
                            email: selectedStudent.email,
                            student_id: selectedStudent.student_id,
                            level: selectedStudent.level || 1,
                            points: selectedStudent.total_score || 0,
                            total_possible_score: selectedStudent.total_possible_score || 0,
                            tests_taken: selectedStudent.tests_taken || 0,
                            average_score: selectedStudent.average_score || 0,
                            badge: selectedStudent.badge || "BRONZE",
                            status: selectedStudent.status || "Active",
                            achievements: selectedStudent.achievements || [],
                        })
                    } else {
                        setError("Student not found")
                    }
                } else {
                    setError("Failed to fetch student data")
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching student data")
            }
        }

        const fetchTaskDetails = async () => {
            try {
                const jwtToken = document.cookie
                    .split(";")
                    .find((c) => c.trim().startsWith("jwt="))
                    ?.split("=")[1]
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com"
                const response = await axios.post(
                    `${API_BASE_URL}/api/student/tasks/`,
                    { event_id, student_email: student?.email, student_name: student?.name },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                )
                if (response.data.success) {
                    const assignedTo = response.data.assigned_to || []
                    const tasks: Task[] = []
                    assignedTo.forEach((admin: any) => {
                        const studentData = admin.marks.find(
                            (mark: any) => mark.student_email === student?.email && mark.student_name === student?.name
                        )
                        if (studentData) {
                            studentData.score.forEach((score: any) => {
                                score.task.forEach((task: any) => {
                                    tasks.push({
                                        task_id: task.task_id,
                                        task_name: task.task_name,
                                        points: task.points,
                                        points_assigned_on: new Date(task.points_assigned_on.$date).toLocaleDateString(),
                                        last_updated_on: new Date(task.last_updated_on.$date).toLocaleDateString(),
                                        status: task.status,
                                        level_name: score.level_name,
                                    })
                                })
                            })
                        }
                    })
                    setTasks(tasks)
                } else {
                    setError("Failed to fetch task data")
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching task data")
            } finally {
                setLoading(false)
            }
        }

        if (student_id && event_id && view) {
            fetchStudentDetails()
            if (student?.email && student?.name) {
                fetchTaskDetails()
            }
        } else {
            setError("Missing required parameters")
            setLoading(false)
        }
    }, [student_id, event_id, view, student?.email, student?.name])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Loading Student Details...</h3>
                </div>
            </div>
        )
    }

    if (error || !student) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Error</h3>
                    <p className="text-gray-600">{error || "Student not found"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-20 left-20 w-60 h-60 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar */}
            <nav className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-2xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Trophy className="w-7 h-7 text-white" />
                            <h2 className="text-2xl font-bold text-white">Student Profile</h2>
                        </div>
                        <button
                            onClick={() => navigate(`/tasks/leaderboard/${event_id}/${view}`)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 font-semibold rounded-xl shadow-lg transition-all duration-300"
                        >
                            <ArrowLeftFromLine className="w-5 h-5" />
                            <span>Back to Leaderboard</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className={`w-16 h-16 ${getAvatarColor(student.rank)} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                            {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                            <p className="text-gray-600">{student.email}</p>
                            <p className="text-gray-600">Student ID: {student.student_id || "N/A"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Leaderboard Stats</h3>
                            <p className="text-gray-600">Rank: <span className="font-bold">#{student.rank}</span></p>
                            <p className="text-gray-600">Total Points: <span className="font-bold">{student.points.toLocaleString()}</span></p>
                            <p className="text-gray-600">Total Possible Score: <span className="font-bold">{student.total_possible_score.toLocaleString()}</span></p>
                            <p className="text-gray-600">Progress: <span className="font-bold">{Math.round((student.points / student.total_possible_score) * 100)}%</span></p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
                            <p className="text-gray-600">Level: <span className="font-bold">{student.level}</span></p>
                            <p className="text-gray-600">Tests Taken: <span className="font-bold">{student.tests_taken}</span></p>
                            <p className="text-gray-600">Average Score: <span className="font-bold">{student.average_score.toFixed(1)}</span></p>
                            <p className="text-gray-600">Badge: <span className="font-bold">{student.badge}</span></p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Achievements</h3>
                        <div className="flex gap-2">
                            {student.achievements.length > 0 ? (
                                student.achievements.map((achievement, index) => {
                                    const IconComponent = achievementIcons[achievement as keyof typeof achievementIcons]
                                    return IconComponent ? (
                                        <div key={index} className="w-6 h-6 text-yellow-600">
                                            <IconComponent className="w-full h-full" />
                                        </div>
                                    ) : null
                                })
                            ) : (
                                <p className="text-gray-600">No achievements yet</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Details</h3>
                        {tasks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-2 px-4 font-semibold text-gray-900">Level</th>
                                            <th className="py-2 px-4 font-semibold text-gray-900">Task Name</th>
                                            <th className="py-2 px-4 font-semibold text-gray-900">Points</th>
                                            <th className="py-2 px-4 font-semibold text-gray-900">Status</th>
                                            <th className="py-2 px-4 font-semibold text-gray-900">Assigned On</th>
                                            <th className="py-2 px-4 font-semibold text-gray-900">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task) => (
                                            <tr key={task.task_id} className="border-b border-gray-100 hover:bg-gray-100">
                                                <td className="py-2 px-4">{task.level_name}</td>
                                                <td className="py-2 px-4">{task.task_name}</td>
                                                <td className="py-2 px-4">{task.points}</td>
                                                <td className={`py-2 px-4 ${getStatusColor(task.status)}`}>{task.status.replace("_", " ")}</td>
                                                <td className="py-2 px-4">{task.points_assigned_on}</td>
                                                <td className="py-2 px-4">{task.last_updated_on}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600">No tasks found for this student in this event.</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 h-3 rounded-full"
                                style={{ width: `${(student.points / student.total_possible_score) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Progress: {(student.points / student.total_possible_score) * 100} % of total possible
                        </p>
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

export default UserDetailView