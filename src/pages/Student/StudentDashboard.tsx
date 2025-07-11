import React, { useState, useEffect } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie"
import {
  Trophy,
  Target,
  Star,
  Medal,
  Zap,
  BookOpen,
  Flame,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import Navbar from "../../components/Student/Navbar"
import Bronze from "../../assets/bronze.jpg"
import Silver from "../../assets/silver.jpg"
import Gold from "../../assets/gold.jpg"
import Platinum from "../../assets/platnium.jpg"
import Elite from "../../assets/elite.jpg"

// Add global styles for custom scrollbar
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    height: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    margin: 0 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 6px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.45);
    border-color: rgba(255, 255, 255, 0.2);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:active {
    background: rgba(255, 255, 255, 0.6);
  }
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
  
  /* Enhanced scrollbar for desktop */
  @media (min-width: 768px) {
    .custom-scrollbar::-webkit-scrollbar {
      height: 12px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(90deg, rgba(156, 163, 175, 0.4), rgba(156, 163, 175, 0.6));
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(90deg, rgba(156, 163, 175, 0.6), rgba(156, 163, 175, 0.8));
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = customScrollbarStyles
  document.head.appendChild(styleSheet)
}

// Inline UI Components
// Card and CardContent for legacy usage (fixes Card is not defined error)
const Card = ({ className = "", children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={`bg-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-3xl text-white shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ className = "", children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);
// Modern Stat Card (redesigned with icon on left, title/content on right, progress at bottom)
const StatCardModern = ({
  icon,
  iconBg = "bg-blue-600",
  label,
  value,
  subLabel,
  progress = false,
  progressValue = 0,
  progressText = "",
  className = "",
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: React.ReactNode;
  value: React.ReactNode;
  subLabel?: React.ReactNode;
  progress?: boolean;
  progressValue?: number;
  progressText?: string;
  className?: string;
}) => (
  <div className={`relative rounded-2xl p-5 bg-gradient-to-br from-[#131862] to-[#0a1636] shadow-xl flex flex-col ${className} hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-white/10 backdrop-blur-xl group`} style={{minHeight:'140px'}}>
    {/* Top sparkle effect */}
    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <svg width="20" height="20" viewBox="0 0 24 24" className="text-yellow-400 animate-pulse">
        <path fill="currentColor" d="M12 2L9.1 9.1 2 12l7.1 2.9L12 22l2.9-7.1L22 12l-7.1-2.9z"/>
      </svg>
    </div>
    
    {/* Main content row with icon on left, content on right */}
    <div className="flex items-stretch mb-3 flex-1">
      {/* Large icon container on left */}
      <div className="mr-4">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${iconBg} group-hover:scale-105 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      
      {/* Content container on right */}
      <div className="flex flex-col justify-center flex-1">
        <div className="px-2.5 py-1 rounded-full text-xs text-white/10 font-semibold w-fit mb-2">
          {label}
        </div>
        
        <div className="text-2xl font-extrabold text-white leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300">
          {value}
        </div>
        
        {subLabel && <div className="text-xs text-gray-400 mt-1">{subLabel}</div>}
      </div>
    </div>
    
    {/* Progress bar at bottom */}
    {progress && (
      <div className="mt-auto pt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/70">{progressText}</span>
          <span className="text-cyan-400 font-medium">{progressValue}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#232b4d] overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 relative"
            style={{ width: `${progressValue}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    )}
    
    {/* Glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/[0.08] group-hover:via-pink-600/[0.08] group-hover:to-purple-600/[0.08] rounded-2xl transition-all duration-500 pointer-events-none" />
  </div>
);

const Badge = ({
  className = "",
  children,
  ...props
}: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div
    className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
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
  total_event_points: number;
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
  description: string;
  task_status: string;
  total_points: number;
  full_deadline: string;
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

// Update the Milestone component to show points under each badge and enlarge completed badges with enhanced animations
const Milestone: React.FC<{
  eventPoints: EventPointsData | null;
}> = ({ eventPoints }) => {
  // Define milestone thresholds based on actual points (not percentage)
  const totalEventPoints = eventPoints?.total_event_points || 1000; // Default to 1000 if not available
  const milestoneThresholds = [
    { name: "Bronze", points: Math.round(totalEventPoints * 0.2), icon: Bronze },
    { name: "Silver", points: Math.round(totalEventPoints * 0.4), icon: Silver },
    { name: "Gold", points: Math.round(totalEventPoints * 0.6), icon: Gold },
    { name: "Platinum", points: Math.round(totalEventPoints * 0.8), icon: Platinum },
    { name: "Elite", points: totalEventPoints, icon: Elite },
  ];

  // Calculate which milestones are completed based on actual points earned
  const userPoints = eventPoints?.total_points_earned || 0;
  const completionPercentage = eventPoints?.completion_percentage || 0;

  const milestones = milestoneThresholds.map((milestone) => ({
    label: milestone.name,
    icon: milestone.icon,
    completed: userPoints >= milestone.points,
    threshold: Math.round((milestone.points / totalEventPoints) * 100),
    points: milestone.points,
  }));

  // Find the current milestone - the highest achieved one based on points
  // For example: if user has 120 points, and Silver is 100 points, Gold is 150 points
  // Silver should be the current milestone that glows and animates
  let currentIndex = -1;
  
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (userPoints >= milestones[i].points) {
      currentIndex = i;
      break;
    }
  }
  
  // If no milestone is achieved yet, but user has some points, show the first milestone as the target
  if (currentIndex === -1 && userPoints > 0) {
    currentIndex = 0; // Show first milestone as target if user has some points but hasn't reached Bronze yet
  }

  return (
    <Card className="hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 w-full p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-[#0f1535] to-[#151c41] border border-blue-500/20">
      <CardContent>
      {/* Header with dynamic data - More compact */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
        <div className="mb-2 sm:mb-0 flex items-center">
          <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center mr-3">
            <Trophy className="w-6 h-6 text-blue-400" />
          </div>
            <div>
            <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-blue-300 to-purple-300">
              Achievement Path
            </h2>
            {eventPoints && (
              <p className="text-sm text-gray-400">
              {eventPoints.event_name || "Event Progress"}
              </p>
            )}
            </div>
        </div>
        <div className="flex items-center bg-white/5 px-3 py-2 rounded-lg border border-blue-500/20">
          <div className="mr-3">
            <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold">Points</div>
            <div className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
              {eventPoints ? eventPoints.total_points_earned.toLocaleString() : "0"}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 mx-2"></div>
          <div>
            <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold">Target</div>
            <div className="text-base sm:text-lg font-bold text-gray-400">
              {eventPoints ? eventPoints.total_event_points.toLocaleString() : "0"}
            </div>
          </div>
        </div>
      </div>

      

      {/* Milestone Progress Bar with Markers - Reduced height */}
      <div className="relative w-full h-32 sm:h-36 flex items-center justify-between px-2 sm:px-3">
        {/* Badge Icons at Top with compact spacing */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-2 sm:px-3">
          {milestones.map((milestone, index) => (
            <div key={index} className={`relative transition-all duration-500 ${
              index === currentIndex && milestone.completed
                ? "scale-150 animate-pulse" 
                : milestone.completed 
                ? "scale-105 opacity-100"
                : index === currentIndex 
                ? "scale-105 animate-bounce" 
                : "scale-100 opacity-75"
            }`}>
              {/* Simplified particle effects */}
              {index === currentIndex && milestone.completed && (
                <div className="absolute -top-1 -right-1 w-2 h-2 text-yellow-300  animate-sparkle-zap">
                  <Sparkles className="w-full h-full text-yellow-300 drop-shadow-glow" />
                </div>
              )}
              
              {/* Badge glow effect - smaller blur */}
              <div className={`absolute inset-0 rounded-full blur-sm transition-opacity duration-300 ${
                milestone.completed 
                  ? index === currentIndex 
                    ? "opacity-70 bg-yellow-400/50" 
                    : "opacity-40 bg-green-400/30"
                  : index === currentIndex 
                    ? "opacity-30 bg-blue-400/30" 
                    : "opacity-0"
              }`}></div>

              {/* Badge Icon with smaller size */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 relative">
                <img
                  src={milestone.icon}
                  alt={milestone.label}
                  className={`w-full h-full object-contain rounded-full transition-all duration-500 ${
                    milestone.completed
                      ? index === currentIndex 
                        ? "drop-shadow-[0_0_5px_rgba(250,204,21,0.7)] brightness-110"
                        : "drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]"
                      : index === currentIndex 
                        ? "brightness-110 drop-shadow-[0_0_3px_rgba(96,165,250,0.5)]"
                        : "grayscale-[70%] opacity-50"
                  }`}
                />
                
                {/* Smaller check mark */}
                {milestone.completed && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center border border-black">
                    <svg width="6" height="6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Connected Path Line - Thinner */}
        <div className="absolute top-1/2 left-2 right-2 sm:left-4 sm:right-4 h-2 -translate-y-1/2 z-0">
          {/* Background track */}
          <div className="absolute inset-0 h-1.5 bg-gray-700/50 rounded-full"></div>
          
          {/* Glowing progress line */}
          <div
            className="absolute inset-0 h-1.5 rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 transition-all duration-1000 overflow-hidden"
            style={{ width: `${completionPercentage}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Milestone Markers and Labels - More compact */}
        {milestones.map((milestone, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center mt-14 sm:mt-16">
            {/* Triangle Arrow Marker - Smaller */}
            <div className="relative">
              <div
                className={`w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent transition-all duration-300 ${
                  milestone.completed 
                    ? index === currentIndex 
                      ? "border-b-yellow-400 animate-bounce-slow" 
                      : "border-b-green-400"
                    : index === currentIndex 
                      ? "border-b-blue-400 animate-pulse" 
                      : "border-b-gray-500"
                }`}
              />
              
              {/* Smaller pulsing dot */}
              {index === currentIndex && (
                <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400 animate-ping opacity-75"></div>
              )}
            </div>

            {/* More compact labels */}
            <div className="text-center mt-2 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/10">
              <span className={`block text-[8px] sm:text-[18px] font-semibold whitespace-nowrap transition-all duration-300 ${
                milestone.completed 
                  ? index === currentIndex 
                    ? "text-yellow-300" 
                    : "text-green-300" 
                  : index === currentIndex 
                    ? "text-blue-300" 
                    : "text-gray-400"
              }`}>
                {milestone.label}
              </span>
              <span className={`block text-[8px] sm:text-[10px] mt-0.5 transition-all duration-300 ${
                milestone.completed 
                  ? index === currentIndex 
                    ? "text-yellow-400" 
                    : "text-green-400" 
                  : index === currentIndex 
                    ? "text-blue-400" 
                    : "text-gray-500"
              }`}>
                {milestone.points.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      </CardContent>
        </Card>
  );
};

const WeeklyGraph: React.FC<{
  student_profile: StudentProfile;
  studentName: string;
}> = ({ student_profile, studentName }) => {
  const [dailyPoints, setDailyPoints] = useState<DailyPointsData[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HoverPointData | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Function to update daily points data from the synchronized API call
  const updateDailyPoints = (eventId: string, data: DailyPointsData[]) => {
    console.log("Updating daily points for event:", eventId, "with data:", data);
    setDailyPoints(data || []);
    setGraphError(null);
    setGraphLoading(false);
  };

  // Listen for daily points updates from the synchronized API call
  useEffect(() => {
    const handleDailyPointsUpdate = (e: CustomEvent) => {
      const { eventId, data } = e.detail;
      console.log("WeeklyGraph received daily points update for event:", eventId, "with data:", data);
      updateDailyPoints(eventId, data);
    };

    // Listen for the custom event dispatched by fetchEventPoints
    window.addEventListener("dailyPointsUpdated", handleDailyPointsUpdate as EventListener);

    // Initialize with stored event data if available
    const storedEventId = localStorage.getItem("selectedEventId");
    if (storedEventId) {
      setGraphLoading(true);
      // The data will be loaded when fetchEventPoints is called
    }

    return () => {
      window.removeEventListener("dailyPointsUpdated", handleDailyPointsUpdate as EventListener);
    };
  }, []);

  // Generate last 7 days with real data, default to 0 for missing data
  const generateLast7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Find matching data point, default to 0 if not found or if there's an error
      const dataPoint = dailyPoints.find((point: DailyPointsData) => point.date === dateStr);
      const points = graphError ? 0 : dataPoint ? dataPoint.total_points || 0 : 0;

      days.push({
        date: dateStr,
        displayDate: date.getDate().toString(),
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        points: points,
        isToday: i === 0,
      });
    }

    return days;
  };

  const chartData = generateLast7Days();
  const dailyData = chartData.map((d) => d.points);
  const maxValue = Math.max(...dailyData, 50); // Minimum scale of 50 for weekly view
  const width = 800;
  const height = 280;
  const padding = 60;

  const getX = (index: number) => (index / (dailyData.length - 1)) * (width - 2 * padding) + padding;
  const getY = (value: number) => height - (value / maxValue) * (height - 2 * padding) - padding;

  const weeklyTotal = dailyData.reduce((sum, val) => sum + val, 0);

  return (
    <Card className="bg-gradient-to-br from-[#131862] to-[#0a1636] hover:border-purple-400/50 transition-all duration-500 w-full p-3 sm:p-4 md:p-6 lg:p-8 h-[420px] sm:h-[470px] md:h-[540px] lg:h-[620px] xl:h-[670px] shadow-2xl shadow-purple-900/20">
      <CardContent className="h-full flex flex-col p-2 sm:p-3 md:p-4 lg:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50 animate-pulse">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white truncate bg-gradient-to-r from-white to-purple-200 bg-clip-text">
                {(studentName || student_profile.name).split(" ")[0]}'s Weekly Progress
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 mt-1">Last 7 days performance</p>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">{weeklyTotal}</div>
              <div className="text-xs sm:text-sm text-gray-400">High Points</div>
            </div>
            
            
            {graphLoading && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 border-3 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            )}
          </div>
        </div>

        {/* Graph Container */}
        <div className="relative flex-1 min-h-0 bg-gradient-to-br from-gray-900/20 to-purple-900/10 rounded-2xl border border-purple-500/20 overflow-hidden">
          {/* Responsive SVG Container */}
          <div 
            className="w-full h-full p-4 sm:p-5 md:p-6 lg:p-8 relative"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Axis Labels */}
            <div className="hidden sm:block absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-purple-300 text-xs sm:text-sm font-semibold">
              Points
            </div>
            <div className="absolute left-1/2 bottom-1 -translate-x-1/2 text-purple-300 text-xs sm:text-sm font-semibold">
              Days of the Week 
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
              {/* Enhanced Grid Lines */}
              <defs>
                <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="25%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="75%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
                </filter>
              </defs>
              
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
                    stroke="url(#gridGradient)" 
                    strokeWidth={i === 0 || i === 4 ? 2 : 1}
                    strokeDasharray={i === 0 || i === 4 ? "none" : "5,5"}
                  />
                );
              })}
              
              {/* Default line at 0 */}
              <line
                x1={padding}
                x2={width - padding}
                y1={height - padding}
                y2={height - padding}
                stroke="#ec4899"
                strokeWidth="2"
                opacity="0.6"
              />
              
              {/* Y Axis Labels */}
              {[0, 25, 50, 75, 100].map((val, i) => {
                const y = getY((val / 100) * maxValue);
                return (
                  <text 
                    key={i} 
                    x={padding - 20} 
                    y={y + 4} 
                    fontSize="11" 
                    fill="#a855f7" 
                    textAnchor="end"
                    fontWeight="600"
                  >
                    {Math.round((val / 100) * maxValue)}
                  </text>
                );
              })}
              
              {/* X Axis Labels - Show day names for weekly view */}
              {chartData.map((day, index) => (
                <g key={index}>
                  <text 
                    x={getX(index)} 
                    y={height - padding + 20} 
                    fontSize="11" 
                    fill="#a855f7" 
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {day.dayName}
                  </text>
                  <text
                    x={getX(index)}
                    y={height - padding + 35}
                    fontSize="9"
                    fill="#c084fc"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {day.displayDate}
                  </text>
                </g>
              ))}
              
              {/* Area Fill */}
              {dailyData.length > 0 && (
                <polygon
                  fill="url(#areaGradient)"
                  points={`
                    ${getX(0)},${height - padding}
                    ${dailyData.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}
                    ${getX(dailyData.length - 1)},${height - padding}
                  `}
                  filter="url(#shadow)"
                />
              )}
              
              {/* Line Path */}
              {dailyData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={dailyData.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}
                  filter="url(#glow)"
                />
              )}
              
              {/* Data Points with Hover */}
              {dailyData.map((value, index) => (
                <g key={index}>
                  {/* Hover area for better detection */}
                  <circle 
                    cx={getX(index)} 
                    cy={getY(value)} 
                    r="15" 
                    fill="transparent" 
                    style={{ cursor: 'pointer' }}
                    className="data-point hover:opacity-50 transition-opacity duration-200"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                      
                      if (containerRect) {
                        setHoverPosition({
                          x: rect.left + rect.width / 2 - containerRect.left,
                          y: rect.top + rect.height / 2 - containerRect.top
                        });
                      }
                      
                      setHoveredPoint({ 
                        index, 
                        data: chartData[index] 
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  
                  {/* Visible data point */}
                  <circle 
                    cx={getX(index)} 
                    cy={getY(value)} 
                    r={hoveredPoint?.index === index ? "7" : "5"} 
                    fill="white" 
                    stroke="#ec4899" 
                    strokeWidth="3"
                    filter="url(#glow)"
                    className={`transition-all duration-200 ${hoveredPoint?.index === index ? 'drop-shadow-lg' : ''}`}
                    style={{ pointerEvents: 'none' }}
                  />
                  
                  {/* Pulse animation for active points
                  {value > 0 && (
                    <circle
                      cx={getX(index)}
                      cy={getY(value)}
                      r="10"
                      fill="transparent"
                      stroke="#ec4899"
                      strokeWidth="2"
                      opacity="0.4"
                      className={hoveredPoint?.index === index ? "animate-ping" : ""}
                      style={{ pointerEvents: 'none' }}
                    />
                  )} */}
                </g>
              ))}
            </svg>
          </div>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div 
              className="absolute bg-black/90 text-white p-3 rounded-lg shadow-2xl border border-purple-500/50 pointer-events-none z-50 backdrop-blur-sm"
              style={{
                left: `${hoverPosition.x + 10}px`,
                top: `${hoverPosition.y - 60}px`,
                transform: hoverPosition.x > width * 0.7 ? 'translateX(-100%)' : 'translateX(0)',
              }}
            >
              <div className="text-sm font-semibold text-purple-300">
                {hoveredPoint.data.dayName}, {new Date(hoveredPoint.data.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-lg font-bold text-white">
                {hoveredPoint.data.points} points
              </div>
              <div className="text-xs text-gray-400">
                {hoveredPoint.data.points === 0 ? 'No activity' : 'Great work!'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
const RecentTasks = ({ eventId }: { eventId: string }) => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!eventId) return;

  const fetchRecentTasks = async () => {
    try {
      const token = Cookies.get("jwt") || localStorage.getItem("jwt");
      console.log("Fetching recent tasks with token:", token);
      

      if (!token) {
        console.warn("JWT is missing from storage.");
        return;
      }

      const response = await fetch("https://leaderboard-backend-4uxl.onrender.com/api/student/recent_tasks_by_event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_id: eventId,
            jwt: token, // ✅ Include JWT here
          }),
        });


      const data = await response.json();
      console.log("Recent tasks API response:", data);

      if (data?.recent_tasks) {
        setTasks(data.recent_tasks.slice(0, 10)); // Increase to 10 for scroll
      }
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchRecentTasks();
}, [eventId]);

  return (
    <Card className="hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 w-full h-full">
      <CardContent className="p-4 sm:p-5 lg:p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-500 rounded-full flex items-center justify-center mr-3 animate-spin">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Recent Tasks</h3>
              <p className="text-xs sm:text-sm text-gray-400">Latest assignments & missions</p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white border-green-500 animate-pulse text-xs">
            {tasks.length} Tasks
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="text-center py-8 text-gray-300 text-base sm:text-lg">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading recent tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-300 text-base sm:text-lg">
              No recent tasks available
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-cyan-500/30"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                    task.task_status === "completed" 
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                      : task.task_status === "in_progress"
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                        : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                  }`}>
                    {task.task_status === "completed" ? "✓" : index + 1}
                  </div>
                  <div className="flex-1 min-w-0 p-2">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate mb-[2px] ${task.task_status === "completed" ? "line-through text-gray-400" : "text-white"}`}>
                        {task.task_name}
                      </p>
                      {task.task_status === "completed" && (
                        <Badge className="bg-green-500 text-white text-xs px-1.5 py-0 border-green-500 mb-[2px]">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{task.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        Deadline: {new Date(task.full_deadline).toLocaleDateString()}
                      </p>
                      <div className="flex items-center">
                        <Target className="w-2.5 h-2.5 text-cyan-400 mr-1" />
                        <span className="text-xs text-cyan-400">{task.total_points} pts</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500 flex-shrink-0">
                    {task.total_points} pts
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface DailyPointsData {
  date: string;
  total_points: number;
}

interface HoverPointData {
  index: number;
  data: {
    date: string;
    displayDate: string;
    dayName: string;
    month: string;
    points: number;
    isToday: boolean;
  };
}

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
  challenges: Challenge[];
}


const StudentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab,] = useState("Overall");
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
      } catch (error) {
        console.error("Error decoding JWT token:", error);
        setCurrentUserName(null);
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
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "jwt") {
        return value;
      }
    }
    return null;
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
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
        setStreak(data.attendance);
      }
    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

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

      // 3️⃣ Fetch Student Daily Points (triggered together with leaderboard)
      try {
        const dailyPointsResponse = await axios.post(
          `${API_BASE_URL}/api/student/student_daily_points_by_event/`,
          {
            jwt: jwtToken,
            event_id: eventId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
            withCredentials: true,
          }
        );
        
        // Trigger custom event for DailyGraph to update
        window.dispatchEvent(new CustomEvent('dailyPointsUpdated', { 
          detail: { 
            eventId, 
            data: dailyPointsResponse.data?.daily_points || [] 
          } 
        }));
      } catch (dailyPointsError) {
        console.error("Error fetching daily points:", dailyPointsError);
        // Don't fail the entire process if daily points fail
        window.dispatchEvent(new CustomEvent('dailyPointsUpdated', { 
          detail: { 
            eventId, 
            data: [] 
          } 
        }));
      }

      // 4️⃣ Fetch General Student Data
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

  const { student_profile } = dashboardData;
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
              <div className="items-center mb-4 sm:mb-6">
                <Milestone eventPoints={eventPointsData} />
              </div>
            )}

            <div className="flex flex-col xl:flex-row items-stretch space-y-6 xl:space-y-0 xl:space-x-6 mb-6">
              <div className="w-full xl:w-2/3">
                <WeeklyGraph 
                  student_profile={student_profile}
                  studentName={studentName}
                />
              </div>
            <div className="flex flex-col w-full xl:w-1/3 space-y-5 h-[420px] sm:h-[470px] md:h-[540px] lg:h-[620px] xl:h-[670px]">
              {/* Leaderboard Card */}
              <StatCardModern
              icon={<Trophy className="w-18 h-18 text-white item-center " />}
              iconBg="bg-gradient-to-r from-blue-600 to-blue-800 mt-14 p-4"
              label={
                <div className="absolute top-4 right-6 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-blue-300 uppercase tracking-wider z-10">
                LEADERBOARD RANK
                </div>
              }
              value={
                <div className="flex items-center">
                <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{leaderboardRank}</span>
                <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-5xl">
                  of {leaderboardData.total_students}
                </Badge>
                </div>
              }
              subLabel={`Among all participants in ${eventPointsData?.event_name || 'this event'}`}
              className="flex-1 relative overflow-hidden"
              />

              {/* Current Level Card with Enhanced Visual */}
              <StatCardModern
              icon={<Medal className="w-8 h-8 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600 mt-10"
              label={
                <div className="absolute top-4 right-6 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-green-300 uppercase tracking-wider z-10">
                CURRENT LEVEL
                </div>
              }
              value={
                <div className="flex items-center">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  {eventPointsData?.levels?.find((level) => level.completed_percentage < 100)?.level_name || eventPointsData?.levels?.[0]?.level_name || 'Level 1'}
                </span>
                </div>
              }
              subLabel={
                <div className="flex items-center justify-between w-full">
                <span>{eventPointsData?.event_name || ''}</span>
                <span className="text-green-400 font-medium text-sm">
                  {eventPointsData?.total_points_earned || 0}/{eventPointsData?.total_event_points || 0} pts
                </span>
                </div>
              }
              progress
              progressValue={eventPointsData ? (((eventPointsData.total_points_earned || 0) / (eventPointsData.total_event_points || 1)) * 100) : 0}
              progressText="Total Progress"
              className="flex-1 relative overflow-hidden mb-5"
              />

              {/* Attendance Streak Card with Enhanced Visual */}
              <StatCardModern
              icon={<Flame className="w-8 h-8 text-white" />}
              iconBg="bg-gradient-to-br from-orange-500 to-red-500 mt-14"
              label={
                <div className="absolute top-4 right-6 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-orange-300 uppercase tracking-wider z-10">
                CURRENT STREAK
                </div>
              }
              value={
                <div className="flex items-center">
                <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                  {streak?.current_streak ?? 0}
                </span>
                <span className="ml-2 text-orange-400 text-[35px] font-bold">days</span>
                {(streak?.current_streak ?? 0) > 0 && (
                  <div className="ml-2 animate-bounce">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 17H20L18 20H15V23L9 16.5L15 10V13H18L15 17Z" fill="#f97316" />
                    <path d="M8 7V4H11L9 1H4L6 4H3L8 7Z" fill="#f97316" />
                  </svg>
                  </div>
                )}
                </div>
              }
              subLabel={
                <div className="flex justify-between items-center w-full">
                <span>Streak in Progress! Keep the Heat!</span>
                </div>
              }
              className="flex-1 relative"
              />
            </div>
            </div>

            {/* Learning Journey with Game Elements - Fixed Height Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 mb-8 gap-6 h-[600px]">
              <div className="w-full">
                <RecentTasks eventId={eventPointsData?.event_id || ""} />
              </div>
              {/* Enhanced Leaderboard - Hall of Fame */}
              <div className="w-full">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full">
                  <CardContent className="p-4 sm:p-5 lg:p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3 animate-spin">
                          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white">Hall of Fame</h3>
                          <p className="text-xs sm:text-sm text-gray-400">Elite warriors this Event</p>
                        </div>
                      </div>
                      <Badge className="bg-cyan-500 text-white border-cyan-500 animate-pulse text-xs">
                        {leaderboardData.total_students} Total Players
                      </Badge>
                    </div>

                    

                    <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto custom-scrollbar py-4 sm:py-6">
                      {leaderboard.length === 0 ? (
                      <div className="text-center py-8 text-gray-300 text-base sm:text-lg">
                        No students have participated
                      </div>
                      ) : (
                      leaderboard.slice(0, 4).map((student, index) => (
                        <div
                        key={student._id}
                        className={`flex items-center p-3 sm:p-5 rounded-lg transition-all hover:scale-[1.02] ${
                          student.name === currentUserName
                          ? "bg-gradient-to-r from-yellow-600/20 to-yellow-600/20 border border-yellow-500/30 animate-pulse"
                          : "bg-white/5 hover:bg-white/10"
                        }`}
                        >
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                          <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold relative ${
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
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Trophy className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                            </div>
                          )}
                          </div>
                          <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-white text-sm sm:text-base truncate">{student.name || "Unknown"}</p>
                            {student.name === currentUserName && (
                            <Badge className="bg-yellow-500 text-white text-xs px-1.5 py-0 border-yellow-500 animate-bounce">
                              You
                            </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs sm:text-sm text-gray-400">Level {student.level}</p>
                            <div className="flex items-center">
                            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 mr-1" />
                            <span className="text-xs text-orange-400">{student.streak || 0}</span>
                            </div>
                          </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white text-sm sm:text-base">{student.total_score.toLocaleString()}</p>
                          <div className="flex items-center space-x-1 justify-end">
                          {index < 3 && <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 animate-bounce" />}
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 animate-pulse" />
                          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                          </div>
                        </div>
                        </div>
                      ))
                      )}
                    </div>

                    <div className="mt-4 sm:mt-6 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                            {currentUserName ? currentUserName.charAt(0) : "?"}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Your Position</p>
                                                        <p className="font-semibold text-white text-sm">{currentUserName || "Your Name"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white text-sm">{leaderboardRank}</p>
                          <p className="text-xs text-gray-400">Rank</p>
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