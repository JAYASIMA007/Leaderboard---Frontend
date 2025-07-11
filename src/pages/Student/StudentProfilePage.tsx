import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  User,
  Trophy,
 Flame,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Zap,
  BookOpen,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import fire from '../../assets/fire.png';

interface EventTask {
  task_id: string;
  task_name: string;
  status: string;
  subtasks: any[];
}

interface EventLevel {
  level_id: string;
  level_name: string;
  tasks: EventTask[];
}

interface RecentEvent {
  event_id: string;
  event_name: string;
  student_email: string;
  student_name: string;
  task_total: number;
  task_completed: number;
  levels?: EventLevel[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  status: 'completed' | 'pending' | 'verified';
  submittedDate?: string;
  verifiedDate?: string;
}

interface ActivityDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface StudentProfileData {
  _id: string;
  name: string;
  email: string;
  student_id: string;
  department: string;
  created_at: string;
  last_login: string;
  total_score: number;
  tests_taken: number;
  task_progression: number;
  total_tasks_completed: number;
  total_tasks_allocated: number;
  attendance_percentage: number;
  login_history: string[];
  login_streak: number;
  max_login_streak: number;
  currentRank: number;
  level: number;
  tasksCompleted: number;
  tasksVerified: number;
  status: 'ACTIVE' | 'INACTIVE';
  achievements: Achievement[];
  recentTasks: Task[];
  weeklyProgress: number;
  monthlyProgress: number;
  activityData: ActivityDay[];
}

const LeadershipProfile: React.FC = () => {
  const [studentData, setStudentData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<null | {
    name: string;
    email: string;
    task_points_from: Record<string, any>;
    total_user_points: number;
    total_tasks_allocated: number;
    total_tasks_completed: number;
    task_progression: number;
  }>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  const generateActivityDataFromLogins = (loginHistory: string[]): ActivityDay[] => {
    const data: ActivityDay[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 365);
    const loginCounts = new Map<string, number>();
    loginHistory.forEach(login => {
      const date = new Date(login).toISOString().split('T')[0];
      loginCounts.set(date, (loginCounts.get(date) || 0) + 1);
    });
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const count = loginCounts.get(dateStr) || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 0) level = 0;
      else if (count <= 2) level = 1;
      else if (count <= 5) level = 2;
      else if (count <= 10) level = 3;
      else level = 4;
      data.push({
        date: dateStr,
        count,
        level
      });
    }
    return data;
  };

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('jwt');
      if (!token) {
        throw new Error('No JWT token found');
      }
      const response = await axios.post('https://leaderboard-backend-4uxl.onrender.com/api/student/get-data/', {
        token: token
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const apiData = response.data.student_data;
      const mappedData: StudentProfileData = {
        _id: apiData._id,
        name: apiData.name,
        email: apiData.email,
        student_id: apiData.student_id,
        department: apiData.department,
        created_at: apiData.created_at,
        last_login: apiData.last_login,
        total_score: apiData.total_score,
        tests_taken: apiData.tests_taken,
        task_progression: 0,
        total_tasks_completed: 0,
        total_tasks_allocated: 0,
        attendance_percentage: apiData.attendance_percentage,
        login_history: apiData.login_history,
        login_streak: apiData.login_streak,
        max_login_streak: apiData.max_login_streak,
        currentRank: Math.floor(apiData.total_score / 10000) + 1,
        level: Math.floor(apiData.total_score / 8000) + 1,
        tasksCompleted: apiData.tests_taken,
        tasksVerified: Math.floor(apiData.tests_taken * 0.8),
        status: apiData.login_streak > 0 ? 'ACTIVE' : 'INACTIVE',
        achievements: generateAchievements(apiData),
        recentTasks: generateRecentTasks(apiData),
        weeklyProgress: Math.min(apiData.attendance_percentage, 100),
        monthlyProgress: Math.min(apiData.attendance_percentage, 100),
        activityData: generateActivityDataFromLogins(apiData.login_history)
      };
      setStudentData(mappedData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch student profile');
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPoints && studentData) {
      setStudentData(prev => ({
        ...prev!,
        total_score: userPoints.total_user_points,
        tests_taken: userPoints.total_tasks_completed,
        task_progression: userPoints.task_progression * 100,
        total_tasks_completed: userPoints.total_tasks_completed,
        total_tasks_allocated: userPoints.total_tasks_allocated
      }));
    }
  }, [userPoints]);

  const generateAchievements = (apiData: any): Achievement[] => {
    const achievements: Achievement[] = [];
    if (apiData.total_score >= 50000) {
      achievements.push({
        id: "high_scorer",
        title: "High Scorer",
        description: "Achieved 50,000+ points",
        icon: <Trophy className="w-6 h-6" />,
        earned: true,
        earnedDate: new Date().toISOString().split('T')[0],
        rarity: "epic"
      });
    }
    if (apiData.max_login_streak >= 7) {
      achievements.push({
        id: "week_warrior",
        title: "Week Warrior",
        description: "Login streak of 7+ days",
        icon: <Flame className="w-6 h-6" />,
        earned: true,
        earnedDate: new Date().toISOString().split('T')[0],
        rarity: "rare"
      });
    }
    if (apiData.attendance_percentage >= 90) {
      achievements.push({
        id: "perfect_attendance",
        title: "Perfect Attendance",
        description: "90%+ attendance rate",
        icon: <CheckCircle2 className="w-6 h-6" />,
        earned: true,
        earnedDate: new Date().toISOString().split('T')[0],
        rarity: "legendary"
      });
    }
    if (apiData.login_history.length >= 50) {
      achievements.push({
        id: "active_user",
        title: "Active User",
        description: "50+ login sessions",
        icon: <Zap className="w-6 h-6" />,
        earned: true,
        earnedDate: new Date().toISOString().split('T')[0],
        rarity: "common"
      });
    }
    return achievements;
  };

  const generateRecentTasks = (apiData: any): Task[] => {
    const tasks: Task[] = [];
    if (apiData.login_history.length > 0) {
      const uniqueDates = new Set<string>();
      const recentUniqueDates: string[] = [];
      for (let i = apiData.login_history.length - 1; i >= 0 && recentUniqueDates.length < 3; i--) {
        const date = apiData.login_history[i].split('T')[0];
        if (!uniqueDates.has(date)) {
          uniqueDates.add(date);
          recentUniqueDates.push(date);
        }
      }
      recentUniqueDates.forEach((date, index) => {
        tasks.push({
          id: `login_task_${index}`,
          title: "Daily Login",
          description: "Successfully logged into the system",
          points: 100,
          status: "verified",
          submittedDate: date,
          verifiedDate: date
        });
      });
    }
    return tasks;
  };

  const fetchRecentEvents = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await axios.post(
        'https://leaderboard-backend-4uxl.onrender.com/api/student/recent_events_by_student/',
        { jwt: token },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setRecentEvents(response.data.recent_events);
    } catch (err) {
      console.error('Error fetching recent events:', err);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
    fetchRecentEvents();
  }, []);

  useEffect(() => {
    const token = Cookies.get('jwt');
    const fetchTotalPoints = async () => {
      try {
        if (!token) {
          setError('No JWT token found for fetching points');
          return;
        }
        const response = await axios.get('https://leaderboard-backend-4uxl.onrender.com/api/student/total_points_of_user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserPoints(response.data);
      } catch (err) {
        setUserPoints(null);
        setError('Failed to fetch points data. Showing cached information.');
        console.error('Error fetching total points:', err);
      }
    };
    fetchTotalPoints();
  }, []);

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return "bg-white/5 border-white/10";
      case 1: return "bg-green-400/20 border-green-400/30";
      case 2: return "bg-green-400/40 border-green-400/50";
      case 3: return "bg-green-400/60 border-green-400/70";
      case 4: return "bg-green-400/80 border-green-400/90";
      default: return "bg-white/5 border-white/10";
    }
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const getDayOfWeek = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const groupActivityByWeeks = (data: ActivityDay[]) => {
    const weeks: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];
    data.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
      if (index === data.length - 1) {
        weeks.push(currentWeek);
      }
    });
    return weeks;
  };

  const handleEventToggle = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="min-h-screen font-sans flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 0% 40%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
            backgroundColor: '#0C0025',
          }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-200">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentStudentData = studentData ?? {
    name: '',
    email: '',
    student_id: '',
    department: '',
    created_at: '',
    last_login: '',
    total_score: 0,
    tests_taken: 0,
    task_progression: 0,
    total_tasks_completed: 0,
    total_tasks_allocated: 0,
    attendance_percentage: 0,
    login_history: [],
    login_streak: 0,
    max_login_streak: 0,
    currentRank: 0,
    level: 0,
    tasksCompleted: 0,
    tasksVerified: 0,
    status: 'INACTIVE',
    achievements: [],
    recentTasks: [],
    weeklyProgress: 0,
    monthlyProgress: 0,
    activityData: [],
  };

  const safeActivityData = currentStudentData?.activityData ?? [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="min-h-screen font-sans"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 0% 40%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
          backgroundColor: '#0C0025',
        }}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-6">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-sm">!</span>
                </div>
                <div>
                  <p className="text-red-400 font-medium">Unable to load latest data</p>
                  <p className="text-red-300 text-sm">Showing cached profile information</p>
                </div>
              </div>
              <button
                onClick={fetchStudentProfile}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          )}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-4 ring-purple-400/50">
                  <User className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-4xl font-bold mb-2">{currentStudentData.name}</h2>
                <p className="text-purple-200 text-lg mb-4">{currentStudentData.email}</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <div className="bg-purple-500/20 border border-purple-400/30 rounded-full px-4 py-2 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">{currentStudentData.department}</span>
                  </div>
                  <div className="bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2 flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">{currentStudentData.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-400">{(userPoints ? userPoints.total_user_points : currentStudentData.total_score) || 0}</p>
                    <p className="text-sm text-purple-200">Total Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{(userPoints && userPoints.total_tasks_allocated !== undefined ? userPoints.total_tasks_allocated : currentStudentData.tests_taken) || 0}</p>
                    <p className="text-sm text-purple-200">Total Tasks Allocated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400">{currentStudentData.attendance_percentage || 0}%</p>
                    <p className="text-sm text-purple-200">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-400">{currentStudentData.max_login_streak || 0}</p>
                    <p className="text-sm text-purple-200">Max Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Target className="w-6 h-6 mr-3 text-purple-400" />
                    Recent Events
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-xs text-green-300">Completed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-xs text-yellow-300">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span className="text-xs text-gray-300">Not Started</span>
                    </div>
                  </div>
                </div>
                <div className="overflow-y-auto flex-grow" style={{ height: "400px" }}>
                  <div className="space-y-4 pr-2">
                    {recentEvents.map((event) => (
                      <div key={event.event_id} className="bg-white/[0.02] border border-white/[0.03] rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => handleEventToggle(event.event_id)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{event.event_name}</h4>
                            <p className="text-purple-200 text-sm">Tasks completed: {event.task_completed}/{event.task_total}</p>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 transition-transform duration-200">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className={`transform transition-transform ${expandedEvents[event.event_id] ? 'rotate-180' : ''}`}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        </div>
                        
                        {expandedEvents[event.event_id] && event.levels && event.levels.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                            {event.levels.map((level) => (
                              <div key={level.level_id} className="bg-white/[0.01] rounded-lg p-2">
                                <h5 className="text-sm font-medium text-purple-300 mb-1">{level.level_name}</h5>
                                <div className="space-y-1">
                                  {level.tasks.map((task) => (
                                    <div key={task.task_id} className="flex items-center">
                                      <div className={`w-2 h-2 rounded-full mr-2 ${
                                        task.status === 'completely_finished' ? 'bg-green-400' : 
                                        task.status === 'partially_finished' ? 'bg-yellow-400' : 'bg-gray-400'
                                      }`}></div>
                                      <p className="text-xs text-white">{task.task_name}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {recentEvents.length === 0 && (
                      <div className="flex items-center justify-center py-8 text-purple-200">
                        <p>No recent events found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full" style={{ height: "510px" }}>

              
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 flex-grow">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  Progress Overview
                </h3>
                <div className="space-y-7">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-200 text-sm">Attendance</span>
                      <span className="text-green-400 font-bold text-md">{currentStudentData.attendance_percentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${currentStudentData.attendance_percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-200 text-sm">Task Progression</span>
                      <span className="text-blue-400 font-bold text-sm">
                        {currentStudentData.total_tasks_allocated
                          ? `${currentStudentData.total_tasks_completed}/${currentStudentData.total_tasks_allocated}`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${currentStudentData.task_progression || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-8">
                    <img src={fire} className="w-7 h-7" alt="Login Streak" />
                    <span className="text-lg text-orange-400 font-medium">Login streak: {currentStudentData.login_streak} days</span>
                  </div>
                </div>
              </div>
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 mb-5">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-400" />
                  Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Joined:</span>
                    <span className="text-white text-sm">{currentStudentData.created_at ? new Date(currentStudentData.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Last Login:</span>
                    <span className="text-green-400 text-sm">
                      {currentStudentData.last_login ? new Date(currentStudentData.last_login).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Student ID:</span>
                    <span className="text-white text-sm font-mono">{currentStudentData.student_id || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Total Logins:</span>
                    <span className="text-blue-400 text-sm font-bold">{currentStudentData.login_history.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-purple-400" />
                    Login Activity
                  </h3>
                  <div className="flex items-center space-x-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm">Current streak:</span>
                    <span className="text-orange-400 font-bold text-sm">{currentStudentData.login_streak} days</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
                    <p className="text-2xl font-bold text-green-400 mb-1">{currentStudentData.login_history.length}</p>
                    <p className="text-xs text-purple-200">Total Logins</p>
                  </div>
                  <div className="text-center bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
                    <p className="text-2xl font-bold text-yellow-400 mb-1">{currentStudentData.max_login_streak}</p>
                    <p className="text-xs text-purple-200">Max Streak</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-purple-300">Past 365 days</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-purple-300">Less</span>
                    <div className="flex items-center space-x-1">
                      {[0, 1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-sm border ${getActivityColor(level)}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-purple-300">More</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="flex items-center mb-3">
                      <div className="w-12"></div>
                      <div className="flex space-x-1">
                        {groupActivityByWeeks(safeActivityData).map((week, weekIndex) => {
                          if (week.length > 0) {
                            const date = new Date(week[0].date);
                            const isFirstWeekOfMonth = weekIndex === 0 ||
                              (weekIndex > 0 &&
                                new Date(groupActivityByWeeks(safeActivityData)[weekIndex - 1][0]?.date).getMonth() !== date.getMonth());
                            if (isFirstWeekOfMonth) {
                              return (
                                <div key={weekIndex} className="text-xs text-purple-300 w-4 text-left">
                                  {getMonthName(date)}
                                </div>
                              );
                            }
                          }
                          return <div key={weekIndex} className="w-4"></div>;
                        })}
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex flex-col mr-3">
                        {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                          <div key={dayIndex} className={`h-4 mb-1 text-xs flex items-center justify-end pr-2 w-10 ${dayIndex % 2 === 0 ? 'text-purple-300' : 'text-transparent'}`}>
                            {getDayOfWeek(dayIndex)}
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-1">
                        {groupActivityByWeeks(safeActivityData).map((week, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col space-y-1">
                            {Array.from({ length: 7 }, (_, dayIndex) => {
                              const day = week.find(d => new Date(d.date).getDay() === dayIndex);
                              const date = day ? new Date(day.date) : null;
                              const formattedDate = date ? date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'No activity';
                              return (
                                <div
                                  key={dayIndex}
                                  className={`w-4 h-4 rounded-sm border transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-purple-400/50 cursor-pointer ${day ? getActivityColor(day.level) : 'bg-white/5 border-white/10'}`}
                                  title={day ? `${formattedDate}: ${day.count} ${day.count === 1 ? 'login' : 'logins'}` : formattedDate}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipProfile;