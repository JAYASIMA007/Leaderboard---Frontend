"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import {
  Trophy,
  Target,
  Star,
  Medal,
  Zap,
  BookOpen,
  Flame,
  Crown,
  Sparkles,
  CheckCircle,
  Clock,
} from "lucide-react"
import Navbar from "../../components/Student/Navbar"
import Bronze from "../../assets/bronze.jpg"
import Silver from "../../assets/silver.jpg"
import Gold from "../../assets/gold.jpg"
import Platinum from "../../assets/platnium.jpg"
import Elite from "../../assets/elite.jpg"

// Inline UI Components
const Card = ({
  className = "",
  children,
  ...props
}: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={`bg-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-3xl text-white shadow-lg ${className}`} {...props}>
    {children}
  </div>
)

const CardContent = ({
  className = "",
  children,
  ...props
}: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

const Badge = ({
  className = "",
  children,
  ...props
}: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </div>
)

// Add new interfaces for our event points data
interface EventPointsData {
  event_id: string;
  event_name: string;
  total_points_earned: number;
  total_possible_points: number;
  completion_percentage: number;
  levels: LevelData[];
}

interface LevelData {
  level_id: string;
  level_name: string;
  points_earned: number;
  points_possible: number;
  completed_percentage: number;
  tasks: TaskData[];
}

interface TaskData {
  task_id: string;
  task_name: string;
  points_earned: number;
  points_possible: number;
  status: string;
  frequency: string;
  deadline: string;
  completed_percentage: number;
  subtasks: SubtaskData[];
}

interface SubtaskData {
  subtask_id: string;
  subtask_name: string;
  points_possible: number;
  points_earned: number;
  status: string;
}

interface JwtPayload {
  name?: string;
  email?: string;
  [key: string]: any;
}

// Update the Milestone component to remove the event selection dropdown
const Milestone: React.FC<{
  eventPoints: EventPointsData | null;
}> = ({ eventPoints }) => {
  // Define milestone thresholds based on percentage completion
  const milestoneThresholds = [
    { name: "Bronze", threshold: 20, icon: Bronze },
    { name: "Silver", threshold: 40, icon: Silver },
    { name: "Gold", threshold: 60, icon: Gold },
    { name: "Platinum", threshold: 80, icon: Platinum },
    { name: "Elite", threshold: 100, icon: Elite },
  ];

  // Calculate which milestones are completed based on completion percentage
  const completionPercentage = eventPoints?.completion_percentage || 0;

  const milestones = milestoneThresholds.map((milestone) => ({
    label: milestone.name,
    icon: milestone.icon,
    completed: completionPercentage >= milestone.threshold,
    threshold: milestone.threshold,
  }));

  return (
    <Card className="hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 w-full p-4 sm:p-6 lg:p-7">
      <CardContent>
        {/* Header with dynamic data */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="mb-2 sm:mb-0">
            <h3 className="text-lg sm:text-xl font-bold text-white">Milestone</h3>
            {eventPoints && (
              <p className="text-xs sm:text-sm text-gray-400">
                {eventPoints.event_name || "Event Progress"}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-xl sm:text-2xl font-bold text-blue-400">
              {eventPoints ? eventPoints.total_points_earned : "0"}
            </span>
          </div>
        </div>

        {/* Milestone Progress Bar with Markers */}
        <div className="relative w-full h-12 sm:h-16 flex items-center justify-between px-2 sm:px-4">
          {/* Full progress bar behind the icons */}
          <div className="absolute top-1/2 left-2 right-2 sm:left-4 sm:right-4 h-1.5 sm:h-2 bg-gray-700 rounded-full -translate-y-1/2 z-0 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Badges */}
          {milestones.map((milestone, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center">
              {/* Pin/Pointer */}
              <div
                className="w-0 h-0 border-l-4 border-r-4 border-b-[8px] sm:border-l-8 sm:border-r-8 sm:border-b-[12px] border-l-transparent border-r-transparent mb-1"
                style={{
                  borderBottomColor: milestone.completed ? "#22c55e" : "#4b5563", // green-500 or gray-600
                }}
              />

              {/* Icon */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10">
                <img
                  src={milestone.icon}
                  alt={milestone.label}
                  className={`w-full h-full object-contain transition-all duration-300 rounded-full
                    ${!milestone.completed ? "grayscale opacity-40" : ""}`}
                />
              </div>

              {/* Label */}
              <span className={`text-[10px] sm:text-xs mt-1 text-center whitespace-nowrap ${milestone.completed ? "text-green-300" : "text-gray-400"}`}>
                {milestone.label}
                <span className="block text-[8px] sm:text-[10px] text-gray-500">{milestone.threshold}%</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AttendanceStreak = ({ streak }: { streak: { current_streak: number; max_streak: number; attendance_percentage: number; last_login: string; login_count: number } | null }) => {
  return (
    <Card className="hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pt-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <h3 className="text-base sm:text-lg font-bold text-white">Attendance Streak</h3>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 sm:pt-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Flame className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <div className="text-center sm:text-right sm:mr-4 mb-2 sm:mb-4">
            <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1 sm:mb-2">{streak?.current_streak ?? 0}</div>
            <p className="text-xs sm:text-sm text-gray-300">Days in a row</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DailyGraph = ({ student_profile, studentName }: { student_profile: StudentProfile; studentName?: string }) => {
  // Generate 30 days of sample data
  const dailyData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1);
  const days = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
  const maxValue = Math.max(...dailyData);

  const width = 1000;
  // Use 800 for mobile and 300 for larger screens
  const height = window.innerWidth < 450 ? 800 : 300;
  const padding = 50;

  const getX = (index: number) =>
    (index / (dailyData.length - 1)) * (width - 2 * padding) + padding;

  const getY = (value: number) =>
    height - ((value / maxValue) * (height - 2 * padding)) - padding;

  return (
    <Card className="bg-[#0f0f0f] w-full p-4 sm:p-6 lg:p-7 h-[400px] sm:h-[450px] lg:h-[530px]">
      <CardContent className="h-full flex flex-col justify-between">
        <div className="text-white font-semibold text-center text-lg sm:text-xl">
          {(studentName || student_profile.name).split(" ")[0]}'s Weekly Contribution Trend
        </div>
        <div className="relative flex-1 mt-4">
          {/* Axis Legends */}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 sm:-ml-8 text-gray-300 text-xs rotate-[-90deg]">Points</span>
          <span className="absolute left-1/2 bottom-0 translate-x-[-50%] mt-4 sm:mt-6 text-gray-300 text-xs">Days</span>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const y = padding + t * (height - 2 * padding);
              return (
                <line
                  key={i}
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke="#2f2f2f"
                  strokeWidth={2}
                />
              );
            })}

            {/* Y Axis Labels */}
            {[0, 25, 50, 75, 100].map((val, i) => {
              const y = getY((val / 100) * maxValue);
              return (
                <text
                  key={i}
                  x={padding - 18}
                  y={y + 4}
                  fontSize="12"
                  fill="#ccc"
                  textAnchor="end"
                  className="text-lg sm:text-sm"
                >
                  {Math.round((val / 100) * maxValue)}
                </text>
              );
            })}

            {/* X Axis Labels - Show fewer labels on small screens */}
            {days.map((day, index) => {
              // Show every 5th day on mobile, every 3rd on tablet, all on desktop
              const isMobile = index % 5 === 0;
              const isTablet = index % 3 === 0;
              
              return (
                <text
                  key={index}
                  x={getX(index)}
                  y={height - padding + 25}
                  fontSize="8"
                  fill="#ccc"
                  textAnchor="middle"
                  className={`text-lg sm:text-sm ${
                    // Show on mobile (every 5th), tablet (every 3rd), desktop (all)
                    'block sm:block lg:block'
                  }`}
                  style={{
                    display: isMobile || isTablet ? 'block' : 'none'
                  }}
                >
                  {day}
                </text>
              );
            })}

            {/* Line Path */}
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={dailyData.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}
              className="sm:stroke-[3px]"
            />

            {/* Data Dots - Show fewer on small screens */}
            {dailyData.map((value, index) => {
              const showEvery3 = index % 3 === 0;
              const showEvery2 = index % 2 === 0;
              
              return (
                <circle
                  key={index}
                  cx={getX(index)}
                  cy={getY(value)}
                  r="2"
                  fill="white"
                  className={`sm:r-3 ${
                    showEvery3 ? 'block' : 'hidden'
                  } sm:${showEvery2 ? 'block' : 'hidden'} lg:block`}
                />
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentTasks = ({ loginHistory }: { loginHistory?: string[] }) => {
  // Process login history to get unique dates
  const processLoginHistory = (history: string[]) => {
    if (!history || history.length === 0) return [];

    const uniqueDates = new Set<string>();
    const tasks: { title: string; status: string; priority: string; date: string }[] = [];

    // Sort login history in descending order (most recent first)
    const sortedHistory = [...history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    sortedHistory.forEach((loginTime) => {
      const date = new Date(loginTime);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      if (!uniqueDates.has(dateStr)) {
        uniqueDates.add(dateStr);
        tasks.push({
          title: "Daily Login",
          status: "completed",
          priority: "high",
          date: dateStr,
        });
      }
    });

    return tasks.slice(0, 5); // Show only the latest 5 unique login dates
  };

  const tasks = loginHistory
    ? processLoginHistory(loginHistory)
    : [
        { title: "Complete AI Module", status: "completed", priority: "high", date: "Today" },
        { title: "Submit Assignment 3", status: "pending", priority: "medium", date: "Yesterday" },
        { title: "Practice Coding", status: "in-progress", priority: "high", date: "2 days ago" },
        { title: "Review Lecture Notes", status: "pending", priority: "low", date: "3 days ago" },
        { title: "Team Meeting", status: "completed", priority: "medium", date: "4 days ago" },
      ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "in-progress":
        return "text-blue-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "pending":
        return <Target className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 w-full">
      <CardContent>
        <div className="flex items-center justify-between mb-4 pt-4">
          <h3 className="text-lg font-bold text-white">Recent Tasks</h3>
          <BookOpen className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              <div className={getStatusColor(task.status)}>{getStatusIcon(task.status)}</div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${task.status === "completed" ? "line-through text-gray-400" : "text-white"}`}
                >
                  {task.title}
                </p>
                {loginHistory && loginHistory.length > 0 && task.title === "Daily Login" && (
                  <p className="text-xs text-gray-400">Successfully logged into the system</p>
                )}
                <p className="text-xs text-gray-500">Submitted: {task.date}</p>
              </div>
              <Badge
                className={`text-xs ${
                  task.priority === "high"
                    ? "bg-red-500/20 text-red-300 border-red-500"
                    : task.priority === "medium"
                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                      : "bg-gray-500/20 text-gray-300 border-gray-500"
                }`}
              >
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  student_id: string;
  department: string;
  total_score: number;
  tests_taken: number;
  average_score: number;
  rank: string | number;
  streak: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  timeLeft: string;
  xpReward: number;
  type: "daily" | "weekly" | "special";
}

interface LeaderboardEntry {
  _id: string;
  name: string | null;
  email: string;
  student_id: string;
  total_score: number;
  tests_taken: number;
  average_score: number;
  badge?: string;
  level: number;
  streak?: number;
  status?: string;
  rank: number;
}

interface DashboardData {
  student_profile: StudentProfile;
  leaderboard: LeaderboardEntry[];
  total_students: number;
  achievements: Achievement[];
  challenges: Challenge[];
}

const StatCard = ({
  icon,
  iconBg,
  highlight,
  label,
  value,
  subLabel,
  progress,
  progressColor,
  progressWidth,
  bgGradient,
  isAnimated = false,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor?: string;
  highlight?: string;
  label: string;
  value: React.ReactNode;
  subLabel?: string;
  progress?: boolean;
  progressFrom?: string;
  progressTo?: string;
  progressColor?: string;
  progressWidth?: string;
  bgGradient?: string;
  isAnimated?: boolean;
  onClick?: () => void;
}) => (
  <div
    className={`group relative rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 border border-white/10 ${bgGradient ? bgGradient : "bg-white/10"} backdrop-blur-xl cursor-pointer ${isAnimated ? "animate-pulse" : ""}`}
    onClick={onClick}
  >
    {/* Sparkle Effect */}
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
    </div>

    {/* Modern Card Header */}
    <div className="flex items-start space-x-7 mb-6">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${iconBg} group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      {highlight && (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/5 ${highlight} animate-bounce`}>
          {highlight}
        </span>
      )}
      <div>
        <p className="text-3xl font-extrabold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300">
          {value}
        </p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      </div>
    </div>

    {/* Main Content */}
    <div>
      {subLabel && <p className="text-sm text-gray-500 mb-2">{subLabel}</p>}
      {progress && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${progressColor || ""} relative`}
            style={{ width: progressWidth || "100%" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      )}
    </div>

    {/* Glow Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/[0.08] group-hover:via-pink-600/[0.08] group-hover:to-purple-600/[0.08] rounded-2xl transition-all duration-500 pointer-events-none" />
  </div>
);

const StudentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState("Overall");
  const [, setShowLevelUp] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [streak, setStreak] = useState<{
    current_streak: number;
    max_streak: number;
    attendance_percentage: number;
    last_login: string;
    login_count: number;
  } | null>(null);
  const [eventPointsData, setEventPointsData] = useState<EventPointsData | null>(null);
  const [eventLoading, setEventLoading] = useState<boolean>(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [setStudentEmail] = useState<(email: string) => void>(() => () => {});
  const [loginHistory, setLoginHistory] = useState<string[]>([]);
  const [apiLeaderboard, setApiLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{
    overall: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    total_students: number;
  }>({ overall: [], weekly: [], monthly: [], total_students: 0 });
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  // Decode JWT token to get user name
  useEffect(() => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("jwt="))?.split("=")[1];
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        setCurrentUserName(decoded.name || null);
        setStudentEmail(decoded.email || "");
      } catch (error) {
        console.error("Error decoding JWT token:", error);
        setCurrentUserName(null);
        setStudentEmail("");
      }
    }
  }, []);

  useEffect(() => {
    // Initialize with empty leaderboard to avoid static data
    const initialData: DashboardData = {
      student_profile: {
        id: "",
        name: "",
        email: "",
        student_id: "",
        department: "",
        total_score: 0,
        tests_taken: 0,
        average_score: 0,
        rank: "--",
        streak: 0,
        level: 0,
        xp: 0,
        nextLevelXp: 100,
      },
      leaderboard: [],
      total_students: 0,
      achievements: [
        {
          id: "1",
          title: "First Steps",
          description: "Complete your first challenge",
          icon: <Star className="w-5 h-5 text-white" />,
          unlocked: false,
          progress: 0,
          maxProgress: 1,
          rarity: "common",
          xpReward: 50,
        },
        {
          id: "2",
          title: "Streak Master",
          description: "Maintain a 7-day streak",
          icon: <Flame className="w-5 h-5 text-white" />,
          unlocked: false,
          progress: 0,
          maxProgress: 7,
          rarity: "rare",
          xpReward: 150,
        },
        {
          id: "3",
          title: "Code Warrior",
          description: "Solve 50 coding problems",
          icon: <Trophy className="w-5 h-5 text-white" />,
          unlocked: false,
          progress: 0,
          maxProgress: 50,
          rarity: "epic",
          xpReward: 300,
        },
        {
          id: "4",
          title: "Legend",
          description: "Reach the top 5 in leaderboard",
          icon: <Crown className="w-5 h-5 text-white" />,
          unlocked: false,
          progress: 0,
          maxProgress: 5,
          rarity: "legendary",
          xpReward: 500,
        },
      ],
      challenges: [
        {
          id: "1",
          title: "Daily Coding",
          description: "Solve 3 problems today",
          icon: <BookOpen className="w-4 h-4 text-white" />,
          progress: 0,
          maxProgress: 3,
          timeLeft: "8h 32m",
          xpReward: 100,
          type: "daily",
        },
        {
          id: "2",
          title: "Weekly Challenge",
          description: "Complete 5 assignments this week",
          icon: <Target className="w-4 h-4 text-white" />,
          progress: 0,
          maxProgress: 5,
          timeLeft: "3d 12h",
          xpReward: 250,
          type: "weekly",
        },
        {
          id: "3",
          title: "AI Mastery",
          description: "Complete the AI bootcamp module",
          icon: <Zap className="w-4 h-4 text-white" />,
          progress: 0,
          maxProgress: 1,
          timeLeft: "2d 5h",
          xpReward: 500,
          type: "special",
        },
      ],
    };

    setTimeout(() => {
      setDashboardData(initialData);
      setLoading(false);

      // Simulate level up notification
      setTimeout(() => {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }, 2000);
    }, 1000);
  }, []);

  const getJwtToken = (): string | null => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "jwt") {
        return value;
      }
    }
    return null;
  };

  const fetchStreak = async () => {
    try {
      const jwtToken = getJwtToken();
      if (!jwtToken) return;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";

      const response = await fetch(`${API_BASE_URL}/api/student/student-streaks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setStreak(data.attendance); // Or data.streak if backend sends that
      }
    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  const fetchEventPoints = async (eventId: string) => {
    if (!eventId) return;

    try {
      setEventLoading(true);
      setEventError(null);

      const jwtToken = getCookie("jwt");

      if (!jwtToken) {
        throw new Error("Authentication required. Please login again.");
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";

      // 1️⃣ Fetch Event Points
      const eventPointsResponse = await axios.get(`${API_BASE_URL}/api/student/events/${eventId}/points/`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (eventPointsResponse.data.success) {
        setEventPointsData(eventPointsResponse.data.data);
      } else {
        throw new Error(eventPointsResponse.data.error || "Failed to fetch event points");
      }

      // 2️⃣ Fetch Leaderboard Data
      const filterValidEntries = (entries: LeaderboardEntry[]) =>
        entries.filter((entry) => entry.name && entry.name.trim() !== "");

      const leaderboardResponse = await axios.post(
        `${API_BASE_URL}/api/student/leaderboard/`,
        { event_id: eventId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (leaderboardResponse.data.success) {
        console.log("Leaderboard data:", leaderboardResponse.data);
        const filteredData = {
          overall: filterValidEntries(leaderboardResponse.data.overall || []),
          weekly: filterValidEntries(leaderboardResponse.data.weekly || []),
          monthly: filterValidEntries(leaderboardResponse.data.monthly || []),
          total_students: filterValidEntries(leaderboardResponse.data.overall || []).length,
        };
        setLeaderboardData(filteredData);
        setApiLeaderboard(filteredData.overall);
      } else {
        throw new Error(leaderboardResponse.data.error || "Failed to fetch leaderboard data");
      }

      // 3️⃣ Fetch General Student Data
      const getDataResponse = await axios.post(
        `${API_BASE_URL}/api/student/get-data/`,
        { token: jwtToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (getDataResponse.data.success) {
        console.log("Student general data:", getDataResponse.data.student_data);
        setStudentName(getDataResponse.data.student_data.name || "");
        setStudentEmail(getDataResponse.data.student_data.email || "");
        setLoginHistory(getDataResponse.data.student_data.login_history || []);
      }
    } catch (err: any) {
      console.error("Error during data fetching:", err);

      if (err.response?.status === 403) {
        setEventError("You don't have access to this event.");
      } else {
        setEventError(err.message || "An error occurred while fetching data");
      }

      setEventPointsData(null);
      setLeaderboardData({ overall: [], weekly: [], monthly: [], total_students: 0 });
      setApiLeaderboard(null);
    } finally {
      setEventLoading(false);
    }
  };

  // Listen for changes to the selected event ID in localStorage
  useEffect(() => {
    const storedEventId = localStorage.getItem("selectedEventId");
    if (storedEventId) {
      fetchEventPoints(storedEventId);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedEventId" && e.newValue) {
        fetchEventPoints(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen font-sans flex items-center justify-center"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 0% 40%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
          backgroundColor: "#0C0025",
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading your gaming dashboard...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { student_profile, achievements } = dashboardData;
  const leaderboard = leaderboardData[activeTab.toLowerCase() as "overall" | "weekly" | "monthly"]?.length
    ? leaderboardData[activeTab.toLowerCase() as "overall" | "weekly" | "monthly"]
    : apiLeaderboard || [];

  // Find the student's rank from the overall leaderboard by name
  const matchedEntry = leaderboardData.overall.find((entry) => entry.name === currentUserName);
  const leaderboardRank = matchedEntry && matchedEntry.rank ? `#${matchedEntry.rank}` : "--";

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <Navbar onEventSelect={(eventId) => fetchEventPoints(eventId)} />

      {/* Background Effects */}
      <div
        className="min-h-screen font-sans"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 0% 40%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
          backgroundColor: "#0C0025",
        }}
      >
        <div className="relative z-10 min-h-screen text-white py-6 sm:py-8 lg:py-10">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-start text-white pt-6 sm:pt-8 lg:pt-10">
                Welcome to your dashboard, <span className="text-[#9b83cf]">{studentName || student_profile.name}!</span>
              </h2>
            </div>

            {/* Display loading state or error for event points */}
            {eventLoading ? (
              <div className="w-full mb-6 sm:mb-8 p-4 sm:p-6 lg:p-7 bg-white/5 rounded-3xl flex flex-col sm:flex-row justify-center items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto sm:mx-0"></div>
                <p className="mt-2 sm:mt-0 sm:ml-3 text-white text-sm sm:text-base">Loading event data...</p>
              </div>
            ) : eventError ? (
              <div className="w-full mb-6 sm:mb-8 p-4 sm:p-6 lg:p-7 bg-white/5 rounded-3xl text-center">
                <p className="text-red-400 text-sm sm:text-base">{eventError}</p>
                <button
                  onClick={() => {
                    const eventId = localStorage.getItem("selectedEventId");
                    if (eventId) fetchEventPoints(eventId);
                  }}
                  className="mt-2 px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700 text-sm sm:text-base"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="items-center mb-6 sm:mb-8 space-x-6">
                <Milestone eventPoints={eventPointsData} />
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-6 mb-6">
              <div className="w-full lg:w-3/4">
                <DailyGraph student_profile={student_profile} studentName={studentName} />
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col w-full lg:w-1/4 space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                <div className="w-full sm:w-1/2 lg:w-full">
                  <AttendanceStreak streak={streak} />
                </div>
                <div className="w-full sm:w-1/2 lg:w-full">
                  <StatCard
                    icon={<Trophy className="w-6 h-6 text-white" />}
                    iconBg="bg-purple-500"
                    label="Leaderboard"
                    value={leaderboardRank}
                    subLabel={`Top ${leaderboardRank === "--" ? "--" : Math.round(((matchedEntry?.rank || leaderboardData.total_students) / leaderboardData.total_students) * 100)}%`}
                    progress
                    progressColor="bg-gradient-to-r from-purple-400 to-pink-500"
                    progressWidth={leaderboardRank === "--" ? "0%" : "85%"}
                    bgGradient="bg-gradient-to-br from-purple-800/30 via-purple-700/30 to-pink-900/30"
                  />
                </div>
                <div className="w-full sm:w-1/2 lg:w-full">
                  <StatCard
                    icon={<Medal className="w-6 h-6 text-white" />}
                    iconBg="bg-green-500"
                    label="Achievements"
                    value={`${achievements.filter((a) => a.unlocked).length}/${achievements.length}`}
                    subLabel="Unlocked"
                    progress
                    progressColor="bg-gradient-to-r from-green-400 to-emerald-500"
                    progressWidth={`${(achievements.filter((a) => a.unlocked).length / achievements.length) * 100}%`}
                    bgGradient="bg-gradient-to-br from-green-800/30 via-green-700/30 to-emerald-900/30"
                  />
                </div>
              </div>
            </div>

            {/* Learning Journey with Game Elements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 mb-8 gap-5">
              <RecentTasks loginHistory={loginHistory} />
              {/* Enhanced Leaderboard */}
              <div>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6 pt-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3 animate-spin">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Hall of Fame</h3>
                          <p className="text-sm text-gray-400">Elite warriors this season</p>
                        </div>
                      </div>
                      <Badge className="bg-cyan-500 text-white border-cyan-500 animate-pulse">
                        {leaderboardData.total_students} Players
                      </Badge>
                    </div>

                    <div className="flex space-x-1 mb-6">
                      {["Overall"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1 rounded text-sm transition-all ${
                            activeTab === tab
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {leaderboard.length === 0 ? (
                        <div className="text-center py-8 text-gray-300 text-lg">
                          No students have participated
                        </div>
                      ) : (
                        leaderboard.slice(0, 5).map((student, index) => (
                          <div
                            key={student._id}
                            className={`flex items-center p-3 rounded-lg transition-all hover:scale-[1.02] ${
                              student.name === currentUserName
                                ? "bg-gradient-to-r from-yellow-600/20 to-yellow-600/20 border border-yellow-500/30 animate-pulse"
                                : "bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative ${
                                  index === 0
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                                    : index === 1
                                      ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
                                      : index === 2
                                        ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                }`}
                              >
                                {student.name ? student.name.charAt(0) : "?"}
                                {index < 3 && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Crown className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold text-white">{student.name || "Unknown"}</p>
                                  {student.name === currentUserName && (
                                    <Badge className="bg-yellow-500 text-white text-xs px-2 py-0 border-yellow-500 animate-bounce">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm text-gray-400">Level {student.level}</p>
                                  <div className="flex items-center">
                                    <Flame className="w-3 h-3 text-orange-400 mr-1" />
                                    <span className="text-xs text-orange-400">{student.streak || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">{student.total_score.toLocaleString()}</p>
                              <div className="flex items-center space-x-1">
                                {index < 3 && <Trophy className="w-3 h-3 text-yellow-400 animate-bounce" />}
                                <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
                                <Zap className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-green-400">+{(index + 1) * 50}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-6 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                            {leaderboardRank}
                          </div>
                          <span className="text-white font-semibold">Your Battle Position</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {eventPointsData ? eventPointsData.total_points_earned.toLocaleString() : student_profile.total_score.toLocaleString()} XP
                          </p>
                          <p className="text-xs text-green-400 animate-bounce">
                            {eventPointsData ? `${eventPointsData.event_name} Event` : "+150 this week"} 🚀
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;