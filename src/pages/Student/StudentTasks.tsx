import { useState, useEffect } from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { Progress } from "../../components/ui/progress";
import Navbar from "../../components/Student/Navbar";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import fire from "../../assets/fire.png";
import trophy from "../../assets/tropy.png";
import xpIcon from "../../assets/xp.png";
import rank from "../../assets/rank.png";
import batch from "../../assets/batch.png";
import cube from "../../assets/level1-tasks.png";
import rocket from "../../assets/rocket-level.png";
import taskCard from "../../assets/task-card.png";
import settings from "../../assets/setting.png";

// Types for the API response
interface Task {
  id: string;
  event_id: string;
  event_name: string;
  level_id: string;
  level_name: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  category: string;
  deadline: string;
  frequency: string;
  start_date: string;
  end_date: string;
  status: string;
  subtasks: any[];
  requirements: any[];
  resources: any[];
  estimated_time: string;
  tags: any[];
  marking_criteria: {
    fully_completed: number;
    partially_completed: number;
    incomplete: number;
  };
  last_updated: string | null;
  next_update_due: string | null;
  update_history: any[];
}

interface StudentTasksResponse {
  success: boolean;
  event_id: string;
  event_name: string;
  tasks: Task[];
  total_tasks: number;
  error?: string;
}

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Daily"); // Track selected filter
  const location = useLocation();
  const navigate = useNavigate();
  const initialEventId = location.state?.selectedEventId;
  const [selectedEventId, setSelectedEventId] = useState<string | null>(initialEventId || null);
  const [eventPointsData, setEventPointsData] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState<boolean>(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[] }>({ overall: [], weekly: [], monthly: [] });
  const [studentName, setStudentName] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");

  const getJwtToken = (): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'jwt') {
        return value;
      }
    }
    return null;
  };

  const fetchStudentTasks = async () => {
    if (!selectedEventId) return;

    try {
      setLoading(true);
      setError(null);
      const jwtToken = getJwtToken();
      if (!jwtToken) {
        throw new Error('Authentication required. Please login again.');
      }
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leaderboard-backend-4uxl.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/student/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ event_id: selectedEventId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudentTasksResponse = await response.json();

      if (data.success) {
        setTasks(data.tasks);
      } else {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching student tasks:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventPoints = async (eventId: string) => {
    if (!eventId) return;
    try {
      setEventLoading(true);
      setEventError(null);
      const jwtToken = getJwtToken();
      if (!jwtToken) {
        throw new Error("Authentication required. Please login again.");
      }
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";
      // 1️⃣ Fetch Event Points
      const eventPointsResponse = await fetch(
        `${API_BASE_URL}/api/student/events/${eventId}/points/`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const eventPointsData = await eventPointsResponse.json();
      if (eventPointsData.success) {
        setEventPointsData(eventPointsData.data);
      } else {
        throw new Error(eventPointsData.error || "Failed to fetch event points");
      }
      // 2️⃣ Fetch Leaderboard Data
      const leaderboardResponse = await fetch(
        `${API_BASE_URL}/api/student/leaderboard/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ event_id: eventId }),
        }
      );
      const leaderboardDataJson = await leaderboardResponse.json();
      if (leaderboardDataJson.success) {
        setLeaderboardData({
          overall: leaderboardDataJson.overall || [],
          weekly: leaderboardDataJson.weekly || [],
          monthly: leaderboardDataJson.monthly || [],
        });
      }
      // 3️⃣ Fetch General Student Data
      const getDataResponse = await fetch(
        `${API_BASE_URL}/api/student/get-data/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: jwtToken }),
          credentials: "include",
        }
      );
      const getDataJson = await getDataResponse.json();
      if (getDataJson.success) {
        setStudentName(getDataJson.student_data.name || "");
        setStudentEmail(getDataJson.student_data.email || "");
      }
    } catch (err: any) {
      setEventError(err.message || "An error occurred while fetching event data");
      setEventPointsData(null);
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchStudentTasks();
      fetchEventPoints(selectedEventId);
    }
  }, [selectedEventId]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    localStorage.setItem("selectedEventId", eventId);
  };

  // Extract unique levels fromtasks
  const uniqueLevels = Array.from(new Set(tasks.map(task => task.level_name))).sort();

  // Filter tasks based on selected filter
  const filteredTasks = selectedFilter === "Daily" 
    ? tasks 
    : tasks.filter(task => task.level_name === selectedFilter);

  // Map level names to icons
  const levelIcons: { [key: string]: string } = {
    "Level 1": cube,
    "Level 2": settings,
    "Level 3": rocket,
  };

  return (
    <div className="max-w-auto mx-auto min-h-screen pt-16 sm:pt-7" style={{
      background: `radial-gradient(ellipse 50% 100% at 0% 60%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
      backgroundColor: '#0C0025',
    }}>
      <Navbar onEventSelect={handleEventSelect} />
      <div className="p-3 sm:p-4 md:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            Level up through consistency! <img src={fire} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-500" alt="Fire" />
          </h1>
          <button
            onClick={fetchStudentTasks}
            disabled={loading}
            className="text-white bg-white/[0.05] backdrop-blur-xl p-2 sm:p-2.5 lg:p-3 rounded-full border border-white/[0.1] hover:bg-white/[0.1] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh tasks"
          >
            <RefreshCcw className={`w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Current Level */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white mb-1">
              <img src={trophy} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" alt="Trophy" />
              Current Level
            </div>
            <div className="font-bold text-base sm:text-lg text-white">Level 2</div>
            <div className="text-xs sm:text-sm text-white">
              Agentic AI Bootcamp
              <span className="ml-1 sm:ml-2 text-xs text-yellow-300 font-semibold">
                {(() => {
                  const entry = leaderboardData.overall.find((item: any) => item.email === studentEmail);
                  return entry ? `| Tasks Taken: ${entry.tests_taken}` : '';
                })()}
              </span>
            </div>
          </div>
          {/* XP Earned */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white mb-1">
              <img src={xpIcon} className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" alt="XP Icon" />
              XP Earned
            </div>
            <div className="font-bold text-base sm:text-lg text-white mb-2">
              {(() => {
                const entry = leaderboardData.overall.find((item: any) => item.email === studentEmail);
                return entry ? `${entry.total_score} XP` : '--';
              })()}
            </div>
            <Progress
              value={(() => {
                const entry = leaderboardData.overall.find((item: any) => item.email === studentEmail);
                return entry ? Math.min(100, entry.total_score) : 0;
              })()}
              className="h-[8px] sm:h-[10px] bg-gradient-to-r from-gray-200 via-yellow-200 to-yellow-300 [&_.progress-indicator]:bg-gradient-to-r [&_.progress-indicator]:from-yellow-200 [&_.progress-indicator]:to-yellow-400"
            />
          </div>
          {/* Your Rank */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white mb-1">
              <img src={rank} className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" alt="Rank" />
              Your Rank
            </div>
            <div className="font-bold text-base sm:text-lg text-white">
              {(() => {
                const entry = leaderboardData.overall.find((item: any) => item.email === studentEmail);
                return entry ? `#${entry.rank}` : '--';
              })()}
            </div>
            <div className="text-xs sm:text-sm text-white">
              of {leaderboardData.overall.length} Individuals
            </div>
          </div>
          {/* Available Tasks */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white mb-1">
              <img src={batch} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" alt="Batch" />
              Available Tasks
            </div>
            <div className="font-bold text-base sm:text-lg text-white">{loading ? '...' : filteredTasks.length}</div>
            <div className="text-xs sm:text-sm text-white">
              {loading ? 'Loading...' : `${filteredTasks.length} Total Tasks`}
            </div>
          </div>
        </div>
        <div className="mb-6 sm:mb-8 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-4 sm:p-6 lg:p-10">
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6">
            <button
              className={`text-white bg-white/[0.02] backdrop-blur-xl p-2 sm:p-3 rounded-[20px] sm:rounded-[30px] border border-white/[0.05] shadow-xl hover:bg-gradient-to-r hover:from-white/[0.05] hover:to-white/[0.1] px-3 sm:px-4 lg:px-6 text-xs sm:text-sm lg:text-base font-medium transition-all duration-150 focus:outline-none flex items-center gap-1 sm:gap-2 ${selectedFilter === "Daily" ? 'bg-gradient-to-r from-white/[0.05] to-white/[0.1]' : ''}`}
              onClick={() => setSelectedFilter("Daily")}
            >
              <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              All Tasks
            </button>
            {uniqueLevels.map(level => (
              <button
                key={level}
                className={`text-white bg-white/[0.02] backdrop-blur-xl p-2 sm:p-3 rounded-[20px] sm:rounded-[30px] border border-white/[0.05] shadow-xl hover:bg-gradient-to-r hover:from-white/[0.05] hover:to-white/[0.1] px-3 sm:px-4 lg:px-6 text-xs sm:text-sm lg:text-base font-medium transition-all duration-150 focus:outline-none flex items-center gap-1 sm:gap-2 ${selectedFilter === level ? 'bg-gradient-to-r from-white/[0.05] to-white/[0.1]' : ''}`}
                onClick={() => setSelectedFilter(level)}
              >
                <img src={levelIcons[level] || cube} className="w-3 h-3 sm:w-4 sm:h-4" alt={level} />
                {level}
              </button>
            ))}
          </div>
          {/* Quiz Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8 lg:mt-10">
            {loading ? (
              <div className="col-span-full text-center text-white">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white mx-auto mb-2"></div>
                <span className="text-sm sm:text-base">Loading your tasks...</span>
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-red-400 bg-red-100/10 rounded-2xl p-4 sm:p-6">
                <p className="mb-4 text-sm sm:text-base">Error: {error}</p>
                <button
                  onClick={fetchStudentTasks}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Retry
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="col-span-full text-center text-white/70 bg-white/[0.02] rounded-2xl p-6 sm:p-8">
                <img src={taskCard} className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" alt="Task Card" />
                <p className="text-base sm:text-lg mb-2">No tasks assigned yet</p>
                <p className="text-xs sm:text-sm">Check back later for new assignments!</p>
              </div>
            ) : (
              filteredTasks.map((task, _index) => (
                <div
                  key={task.id}
                  className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4 pb-6 sm:pb-8 pt-4 sm:pt-6 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] cursor-pointer hover:bg-white/[0.04] transition-all duration-200"
                  onClick={() => navigate("/student/criteria", {
                    state: {
                      event_id: task.event_id,
                    },
                  })}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 border-gray-200 bg-[#FFDF92] rounded-full flex items-center justify-center flex-shrink-0">
                        <img src={taskCard} className="w-3 h-3 sm:w-5 sm:h-5" alt="Task Card" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white text-sm sm:text-base leading-tight line-clamp-2">
                          {task.title}
                        </div>
                        <div className="text-xs text-white/[0.8] leading-tight mt-1 line-clamp-2">
                          {task.description}
                        </div>
                      </div>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-medium flex-shrink-0 ml-2">
                      {task.level_name}
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 mb-2">
                    <label className="text-xs text-white/[0.8] font-bold">Progress</label>
                    <Progress
                      value={0}
                      className="h-[8px] sm:h-[10px] bg-gradient-to-r from-gray-200 via-yellow-200 to-yellow-300 [&_.progress-indicator]:bg-gradient-to-r [&_.progress-indicator]:from-yellow-200 [&_.progress-indicator]:to-yellow-400 mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <span className="text-yellow-500">⚡</span>
                      <span>+{task.points} XP</span>
                    </div>
                    <button className="text-xs text-white rounded px-2 py-1 flex items-center gap-1 border-0 border-b-4 border-yellow-300  font-semibold transition-all duration-150 focus:outline-none">
                      Start <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}