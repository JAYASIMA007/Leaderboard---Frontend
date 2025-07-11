import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Trophy,
    ArrowLeftFromLine,
    AlertCircle,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    Star,
} from "lucide-react";

interface Student {
    id: string;
    rank: number;
    name: string;
    email: string;
    student_id: string;
    level: number;
    points: number;
    total_possible_score: number;
    tests_taken: number;
    average_score: number;
    badge: string;
    status: string;
}

interface SubTask {
    subtask_id: string;
    subtask_name: string;
    points: number;
    total_points: number;
    status: string;
}

interface Task {
    task_id: string;
    task_name: string;
    points: number;
    total_points: number;
    status: string;
    level_name: string;
    sub_tasks: SubTask[];
}

interface Level {
    level_id: string;
    level_name: string;
    frequency: string | null;
    total_points: number;
    tasks: Task[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "completely_finished":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "partially_finished":
            return "bg-amber-100 text-amber-700 border-amber-200";
        case "incomplete":
            return "bg-red-100 text-red-700 border-red-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completely_finished":
            return <CheckCircle2 className="w-4 h-4" />;
        case "partially_finished":
            return <Clock className="w-4 h-4" />;
        case "incomplete":
            return <XCircle className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};

const SuperAdminUserDetailView = () => {
    const { student_id, event_id, view } = useParams<{ student_id: string; event_id: string; view: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredProgress, setHoveredProgress] = useState<boolean>(false);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const jwtToken = document.cookie
                    .split(";")
                    .find((c) => c.trim().startsWith("jwt="))
                    ?.split("=")[1];
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";
                const response = await axios.post(
                    `${API_BASE_URL}/api/student/leaderboard/`,
                    { event_id },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                );
                if (response.data.success) {
                    const students = response.data[view as "overall" | "weekly" | "monthly"] || [];
                    const selectedStudent = students.find((s: any) => s._id === student_id);
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
                        });
                    } else {
                        setError("Student not found");
                    }
                } else {
                    setError("Failed to fetch student data");
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching student data");
            }
        };

        const fetchTaskDetails = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";
                const response = await axios.post(
                    `${API_BASE_URL}/api/student/detailed-tasks/`,
                    { event_id, student_email: student?.email },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.data.success) {
                    setLevels(response.data.levels || []);
                    if (response.data.total_possible_score && student) {
                        setStudent((prev) => prev ? { ...prev, total_possible_score: response.data.total_possible_score } : prev);
                    }
                } else {
                    setError("Failed to fetch task data");
                }
            } catch (err: any) {
                console.error("Fetch Task Error:", err);
                setError(err.message || "An error occurred while fetching task data");
            } finally {
                setLoading(false);
            }
        };

        if (student_id && event_id && view) {
            fetchStudentDetails();
            if (student?.email) {
                fetchTaskDetails();
            }
        } else {
            setError("Missing required parameters");
            setLoading(false);
        }
    }, [student_id, event_id, view, student?.email]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Loading Student Details...</h3>
                </div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Error</h3>
                    <p className="text-gray-600">{error || "Student not found"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-20 left-20 w-60 h-60 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
            {/* Navbar */}
            <nav className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow-2xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Trophy className="w-7 h-7 text-white" />
                            <h2 className="text-2xl font-bold text-white">Student Profile</h2>
                        </div>
                        <button
                            onClick={() => navigate(`/superadmin/leaderboard/${event_id}/overall`)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 font-semibold rounded-xl shadow-lg transition-all duration-300"
                        >
                            <ArrowLeftFromLine className="w-5 h-5" />
                            <span>Back to Leaderboard</span>
                        </button>
                    </div>
                </div>
            </nav>
            <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mb-6 shadow-2xl">
                        <Trophy className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {student.name}
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                        {student.email} | Student ID: {student.student_id || "N/A"}
                    </p>
                </div>
                {/* Leaderboard and Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard Stats</h3>
                        <p className="text-gray-600">Rank: <span className="font-bold">#{student.rank}</span></p>
                        <p className="text-gray-600 mt-2">Earned Score: <span className="font-bold">{student.points}/{student.total_possible_score}</span></p>
                        <div className="mt-4">
                            <div
                                className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden"
                                onMouseEnter={() => setHoveredProgress(true)}
                                onMouseLeave={() => setHoveredProgress(false)}
                            >
                                <div
                                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${(student.points / student.total_possible_score) * 100}%` }}
                                />
                                {hoveredProgress && (
                                    <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                                        {student.points}/{student.total_possible_score}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Progress: {Math.round((student.points / student.total_possible_score) * 100)}%
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                        <p className="text-gray-600">Level: <span className="font-bold">{student.level}</span></p>
                        <p className="text-gray-600">Tests Taken: <span className="font-bold">{student.tests_taken}</span></p>
                        <p className="text-gray-600">Average Score: <span className="font-bold">{student.average_score.toFixed(1)}</span></p>
                        <p className="text-gray-600">Badge: <span className="font-bold">{student.badge}</span></p>
                    </div>
                </div>
                {/* Task Details */}
                <div className="space-y-12">
                    {levels.length > 0 ? (
                        levels.map((level, levelIndex) => (
                            <div key={level.level_id}>
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                                    {level.level_name}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {level.tasks.map((task, taskIndex) => (
                                        <div
                                            key={task.task_id}
                                            className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 hover:border-blue-300/50 transition-all duration-500 overflow-hidden transform hover:-translate-y-1"
                                            style={{
                                                animationDelay: `${levelIndex * 200 + taskIndex * 100}ms`,
                                                animation: "fadeInUp 0.6s ease-out forwards",
                                            }}
                                        >
                                            {/* Task Header */}
                                            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center">
                                                        <ClipboardList className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl lg:text-2xl font-bold text-white">{task.task_name}</h3>
                                                        <p className="text-white/80 font-medium">Level: {level.level_name}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-white">
                                                    <div className="bg-black/10 rounded-xl p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Star className="w-4 h-4" />
                                                            <span className="text-sm font-medium">Points</span>
                                                        </div>
                                                        <p className="text-xl font-bold">{task.points}/{task.total_points}</p>
                                                    </div>
                                                    {task.sub_tasks.length === 0 && (
                                                        <div className="bg-black/10 rounded-xl p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {getStatusIcon(task.status)}
                                                                <span className="text-sm font-medium">Status</span>
                                                            </div>
                                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                                                {task.status.replace("_", " ")}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Subtasks Section */}
                                            {task.sub_tasks.length > 0 && (
                                                <div className="p-6">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                                                            <ClipboardList className="w-4 h-4 text-white" />
                                                        </div>
                                                        <h4 className="text-lg font-bold text-gray-900">Subtasks</h4>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {task.sub_tasks.map((subtask, subtaskIndex) => (
                                                            <div
                                                                key={subtask.subtask_id}
                                                                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                                                style={{
                                                                    animationDelay: `${levelIndex * 200 + taskIndex * 100 + subtaskIndex * 50}ms`,
                                                                    animation: "fadeInUp 0.6s ease-out forwards",
                                                                }}
                                                            >
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <h5 className="text-base font-bold text-gray-900 line-clamp-2">{subtask.subtask_name}</h5>
                                                                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                                                        <Star className="w-4 h-4 text-blue-600" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                                        Points
                                                                    </span>
                                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-bold">
                                                                        {subtask.points}/{subtask.total_points}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                                        Status
                                                                    </span>
                                                                    <span
                                                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(subtask.status)}`}
                                                                    >
                                                                        {getStatusIcon(subtask.status)}
                                                                        {subtask.status.replace("_", " ")}
                                                                    </span>
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
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-8 shadow-lg">
                                <ClipboardList className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Tasks Found</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                No tasks have been assigned to this student for this event.
                            </p>
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
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default SuperAdminUserDetailView;