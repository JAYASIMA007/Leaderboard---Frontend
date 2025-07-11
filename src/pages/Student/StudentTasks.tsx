import { useState, useEffect } from "react";
import { ArrowRight, RefreshCcw, Calendar } from "lucide-react";
import { Progress } from "../../components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Student/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
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

interface Level {
  level_id: string;
  level_name: string;
  points: number;
  created_at: string;
  updated_at: string;
}

interface StudentLevelsProgressResponse {
  success: boolean;
  email: string;
  event_id: string;
  event_name: string;
  levels: Level[];
  total_points: number;
  error?: string;
}

interface EventPointsData {
  success: boolean;
  student_email: string;
  data: {
    event_id: string;
    event_name: string;
    total_points_earned: number;
    total_possible_points: number;
    completion_percentage: number;
    levels: Array<{
      level_id: string;
      level_name: string;
      points_earned: number;
      points_possible: number;
      completed_percentage: number;
      tasks: any[];
    }>;
  };
}

interface StudentTasksResponse {
  success: boolean;
  event_id: string;
  event_name: string;
  tasks: Task[];
  total_tasks: number;
  error?: string;
}

export default function StudentDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Daily");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventPointsData, setEventPointsData] = useState<EventPointsData | null>(null);
  const [levelsProgressData, setLevelsProgressData] = useState<StudentLevelsProgressResponse | null>(null);
  const [eventLoading, setEventLoading] = useState<boolean>(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{ overall: any[]; weekly: any[]; monthly: any[] }>({ overall: [], weekly: [], monthly: [] });
  const [, setStudentName] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [currentEventName, setCurrentEventName] = useState<string>("");
  const [progressKey, setProgressKey] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const initialEventId = location.state?.selectedEventId;

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

  const fetchStudentData = async (jwtToken: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";
      const getDataResponse = await fetch(
        `${API_BASE_URL}/api/student/get-data/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ token: jwtToken }),
          credentials: "include",
        }
      );
      if (!getDataResponse.ok) {
        throw new Error(`HTTP error! status: ${getDataResponse.status}`);
      }
      const getDataJson = await getDataResponse.json();
      if (getDataJson.success) {
        setStudentName(getDataJson.student_data.name || "");
        setStudentEmail(getDataJson.student_data.email || "");
        return getDataJson.student_data.email || "";
      } else {
        throw new Error(getDataJson.error || "Failed to fetch student data");
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setEventError(err instanceof Error ? err.message : "Failed to fetch student data");
      return "";
    }
  };

  const fetchStudentTasks = async (eventId: string) => {
    if (!eventId) return;
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
        body: JSON.stringify({ event_id: eventId }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: StudentTasksResponse = await response.json();
      if (data.success) {
        setTasks(data.tasks);
        setCurrentEventName(data.event_name);
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

      const email = await fetchStudentData(jwtToken);
      if (!email) {
        throw new Error("Failed to fetch student email");
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";

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
      if (!eventPointsResponse.ok) {
        throw new Error(`HTTP error! status: ${eventPointsResponse.status}`);
      }
      const eventPointsData: EventPointsData = await eventPointsResponse.json();
      if (!eventPointsData.success) {
        throw new Error((eventPointsData as any).error || "Failed to fetch event points");
      }
      setEventPointsData(eventPointsData);
      setCurrentEventName(eventPointsData.data.event_name);
      setProgressKey(prev => prev + 1);

      const levelsProgressResponse = await fetch(
        `${API_BASE_URL}/api/student/get_student_levels_progress/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ event_id: eventId, email }),
          credentials: "include",
        }
      );
      if (!levelsProgressResponse.ok) {
        throw new Error(`HTTP error! status: ${levelsProgressResponse.status}`);
      }
      const levelsProgressData: StudentLevelsProgressResponse = await levelsProgressResponse.json();
      if (levelsProgressData.success) {
        setLevelsProgressData(levelsProgressData);
      } else {
        throw new Error(levelsProgressData.error || "Failed to fetch levels progress");
      }

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
    } catch (err: any) {
      console.error('Error fetching event points:', err);
      setEventError(err.message || "An error occurred while fetching event data");
      setEventPointsData(null);
      setLevelsProgressData(null);
    } finally {
      setEventLoading(false);
    }
  };

  const fetchAllData = async (eventId: string) => {
    setLoading(true);
    setEventLoading(true);
    try {
      await fetchEventPoints(eventId);
      await fetchStudentTasks(eventId);
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setEventLoading(false);
    }
  };

  const getCurrentLevel = () => {
    if (!eventPointsData || !eventPointsData.data.levels.length) return "Level 1";
    const levels = eventPointsData.data.levels;
    for (const level of levels) {
      if (level.completed_percentage < 100) {
        return level.level_name;
      }
    }
    return levels.length > 0 ? levels[levels.length - 1].level_name : "Level 1";
  };

  useEffect(() => {
    if (initialEventId && !selectedEventId) {
      setSelectedEventId(initialEventId);
      localStorage.setItem("selectedEventId", initialEventId);
    }
  }, [initialEventId, selectedEventId]);

  useEffect(() => {
    if (selectedEventId) {
      fetchAllData(selectedEventId);
    }
  }, [selectedEventId]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    localStorage.setItem("selectedEventId", eventId);
  };

  const uniqueLevels = Array.from(new Set(tasks.map(task => task.level_name))).sort();

  const filteredLevels = selectedFilter === "Daily"
    ? (levelsProgressData ? levelsProgressData.levels : [])
    : (levelsProgressData ? levelsProgressData.levels.filter(level => level.level_name === selectedFilter) : []);

  const levelIcons: { [key: string]: string } = {
    "Level 1": cube,
    "Level 2": settings,
    "Level 3": rocket,
  };

  const getTaskCountForLevel = (levelId: string) => {
    return tasks.filter(task => task.level_id === levelId).length;
  };

  const getLevelProgress = (levelId: string) => {
    if (!eventPointsData || !eventPointsData.data || !eventPointsData.data.levels) {
      return 0;
    }
    const level = eventPointsData.data.levels.find(l => l.level_id === levelId);
    if (!level) {
      return 0;
    }
    const progress = level.points_possible > 0
      ? (level.points_earned / level.points_possible) * 100
      : level.completed_percentage || 0;
    return Math.min(100, Math.max(0, progress));
  };

  const getLevelPoints = (levelId: string) => {
    if (!levelsProgressData || !levelsProgressData.levels) {
      return { points_earned: 0, points_possible: 0 };
    }
    const level = levelsProgressData.levels.find(l => l.level_id === levelId);
    const eventLevel = eventPointsData?.data.levels.find(l => l.level_id === levelId);
    return level
      ? { points_earned: level.points, points_possible: eventLevel?.points_possible || 0 }
      : { points_earned: 0, points_possible: 0 };
  };

  const getLatestDueDate = (levelId: string) => {
    const levelTasks = tasks.filter(task => task.level_id === levelId);
    if (!levelTasks.length) return "No due date";
    const dates = levelTasks
      .map(task => new Date(task.end_date))
      .filter(date => !isNaN(date.getTime()));
    return dates.length ? new Date(Math.max(...dates.map(date => date.getTime()))).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : "No due date";
  };

  return (
    <div className="max-w-auto mx-auto min-h-screen pt-16 sm:pt-7" style={{
      background: `radial-gradient(ellipse 50% 100% at 0% 60%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
      backgroundColor: '#0C0025',
    }}>
      <Navbar onEventSelect={handleEventSelect} />
      <div className="p-3 sm:p-4 md:p-6 lg:p-10">
        <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            Level up through consistency! <img src={fire} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-500" alt="Fire" />
          </h1>
          <button
            onClick={() => selectedEventId && fetchAllData(selectedEventId)}
            disabled={loading || eventLoading}
            className="text-white bg-white/[0.05] backdrop-blur-xl p-2 sm:p-2.5 lg:p-3 rounded-full border border-white/[0.1] hover:bg-white/[0.1] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh tasks"
          >
            <RefreshCcw className={`w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${loading || eventLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white mb-1">
              <img src={trophy} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" alt="Trophy" />
              Current Level
            </div>
            <div className="font-bold text-base sm:text-lg text-white">{getCurrentLevel()}</div>
            <div className="text-xs sm:text-sm text-white">
              {currentEventName ? `Event: ${currentEventName}` : 'Select an event to view tasks'}
            </div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white mb-1">
              <img src={xpIcon} className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" alt="XP Icon" />
              XP Earned
            </div>
            <div className="font-bold text-base sm:text-lg text-white mb-2">
              {levelsProgressData ? `${levelsProgressData.total_points} XP` : '--'}
            </div>
            <Progress
              value={levelsProgressData ? Math.min(100, levelsProgressData.total_points / 1000 * 100) : 0}
              className="h-[12px] sm:h-[14px] bg-gradient-to-r from-gray-200 via-yellow-200 to-yellow-300 [&_.progress-indicator]:bg-gradient-to-r [&_.progress-indicator]:from-yellow-200 [&_.progress-indicator]:to-yellow-400"
            />
          </div>
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
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white mb-1">
              <img src={batch} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" alt="Batch" />
              Available Tasks
            </div>
            <div className="font-bold text-base sm:text-lg text-white">{loading || eventLoading ? '...' : tasks.length}</div>
            <div className="text-xs sm:text-sm text-white">
              {loading || eventLoading ? 'Loading...' : `${tasks.length} Total Tasks`}
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
              All Levels
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
          {levelsProgressData && levelsProgressData.levels.length > 0 && tasks.length > 0 && levelsProgressData.levels.some(l => !tasks.some(t => t.level_id === l.level_id)) && (
            <div className="col-span-full text-center text-yellow-400 bg-yellow-100/10 rounded-2xl p-4 sm:p-6 mb-4">
              <p className="text-sm sm:text-base">Warning: Some level IDs do not match tasks. Progress bars may not display correctly.</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8 lg:mt-10">
            {loading || eventLoading ? (
              <div className="col-span-full text-center text-white">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white mx-auto mb-2"></div>
                <span className="text-sm sm:text-base">Loading your levels...</span>
              </div>
            ) : error || eventError ? (
              <div className="col-span-full text-center text-red-400 bg-red-100/10 rounded-2xl p-4 sm:p-6">
                <p className="mb-4 text-sm sm:text-base">Error: {error || eventError}</p>
                <button
                  onClick={() => selectedEventId && fetchAllData(selectedEventId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Retry
                </button>
              </div>
            ) : !levelsProgressData || filteredLevels.length === 0 ? (
              <div className="col-span-full text-center text-white/70 bg-white/[0.02] rounded-2xl p-6 sm:p-8">
                <img src={taskCard} className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" alt="Level Card" />
                <p className="text-base sm:text-lg mb-2">No levels assigned yet</p>
                <p className="text-xs sm:text-sm">Check back later for new assignments!</p>
              </div>
            ) : (
              filteredLevels.map((level, _index) => {
                const progress = getLevelProgress(level.level_id);
                const levelPoints = getLevelPoints(level.level_id);
                const taskCount = getTaskCountForLevel(level.level_id);
                const dueDate = getLatestDueDate(level.level_id);
                return (
                  <div
                    key={level.level_id}
                    className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] cursor-pointer hover:bg-white/[0.05] hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
                    onClick={() => navigate("/student/criteria", {
                      state: {
                        event_id: levelsProgressData?.event_id || selectedEventId || '',
                        level_id: level.level_id,
                      },
                    })}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <img src={levelIcons[level.level_name] || cube} className="w-4 h-4 sm:w-6 sm:h-6" alt="Level Icon" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white text-sm sm:text-base md:text-lg leading-tight line-clamp-2">
                            {level.level_name}
                          </div>
                          <div className="text-xs sm:text-sm text-white/[0.7] mt-1">
                            {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-white/[0.7]">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Due: {dueDate}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 mb-3">
                      <label className="text-xs sm:text-sm text-white/[0.8] font-semibold">
                        Completed
                        {eventLoading ? ' (Loading...)' : progress === 0 ? ' (No Progress Data)' : ` (${progress.toFixed(0)}%)`}
                      </label>
                      <div className="relative group">
                        {eventLoading ? (
                          <div className="h-[12px] sm:h-[14px] bg-gray-700/50 rounded-full mt-2 animate-pulse"></div>
                        ) : (
                          <AnimatePresence>
                            <motion.div
                              key={`${level.level_id}-${progressKey}`}
                              className="relative h-[12px] sm:h-[14px] bg-gray-700/50 rounded-full mt-2 overflow-hidden"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                className={`h-full rounded-full ${progress > 50 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-600'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut", type: "spring", stiffness: 100 }}
                                style={{ boxShadow: progress > 0 ? '0 0 8px rgba(255, 255, 0, 0.5)' : 'none' }}
                              />
                              {progress > 0 && (
                                <motion.span
                                  className="absolute top-0 right-0 text-xs text-white font-medium pr-2"
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5, duration: 0.3 }}
                                >
                                  {progress.toFixed(0)}%
                                </motion.span>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        )}
                        {levelsProgressData && progress > 0 && (
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-12">
                            {levelPoints.points_earned} / {levelPoints.points_possible} points
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-white/[0.7]">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⚡</span>
                          <span>{levelPoints.points_earned} XP</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-white/[0.7]">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">🏆</span>
                          <span>{levelPoints.points_earned}/{levelPoints.points_possible}</span>
                        </div>
                        <button className="text-xs sm:text-sm text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg px-3 py-1.5 flex items-center gap-1 font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-150 focus:outline-none">
                          Start <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}