import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

interface MarkingCriteria {
  fully_completed: number;
  partially_completed: number;
  incomplete: number;
}

interface Subtask {
  subtask_id: string;
  name: string;
  description: string;
  points: number;
  deadline: string;
  status: string;
  marking_criteria: MarkingCriteria;
}

interface Task {
  task_id: string;
  task_name: string;
  description: string;
  total_points: number;
  subtasks: Subtask[];
  deadline: string;
  status?: string;
  deadline_time?: string;
  full_deadline?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  marking_criteria?: MarkingCriteria;
  last_updated?: string | null;
  update_history?: any[];
  next_update_due?: string | null;
  task_status?: string;
}

interface Level {
  level_id: string;
  level_name: string;
  total_points: number;
  tasks: Task[];
}

interface ProgressTask {
  task_id: string;
  task_name: string;
  earned_points: number;
  total_points: number;
  progress_percent: number;
}

interface ProgressLevel {
  level_id: string;
  level_name: string;
  tasks: ProgressTask[];
}

interface EventData {
  _id: string;
  event_id: string;
  event_name: string;
  assigned_to: Array<{ name: string; admin_id: string }>;
  levels: Level[];
  created_at: string;
  updated_at: string;
  progress?: ProgressLevel[];
  has_recurring_tasks?: boolean;
}

interface ApiResponse {
  success: boolean;
  event: EventData;
}

const StudentCriteria: React.FC = () => {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const passedEventId = location.state?.event_id;

  const fetchProgressData = async (eventId: string, levelId: string, taskIds: string[]) => {
    try {
      const jwt = Cookies.get('jwt');
      if (!jwt) {
        throw new Error('JWT token not found. Please log in again.');
      }

      console.log('Sending data:', {
        event_id: eventId,
        jwt: jwt,
        level_id: levelId,
        task_ids: taskIds
      });

      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/student/points_by_eventid/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          jwt: jwt,
          level_id: levelId,
          task_ids: taskIds
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      return data;
    } catch (err) {
      console.error('Error fetching progress data:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (!passedEventId) {
      setError("No event selected.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial event data from the task details API
        const eventResponse = await fetch(`https://leaderboard-backend-4uxl.onrender.com/api/student/task-details/?event_id=${passedEventId}`);
        if (!eventResponse.ok) {
          throw new Error(`HTTP error: ${eventResponse.status}`);
        }

        const eventResponseData: ApiResponse = await eventResponse.json();
        const eventDataFromSecondApi = eventResponseData.event;

        // Fetch progress data using the data from the task details API
        const levelId = eventDataFromSecondApi.levels[selectedLevel]?.level_id;
        const taskIds = eventDataFromSecondApi.levels[selectedLevel]?.tasks.map(task => task.task_id) || [];

        let progressData;
        try {
          progressData = await fetchProgressData(passedEventId, levelId, taskIds);
          if (progressData.error) {
            // If progress API returns error, create default progress data with 0% progress
            progressData = {
              level_id: levelId,
              tasks: eventDataFromSecondApi.levels[selectedLevel]?.tasks.map(task => ({
                task_id: task.task_id,
                task_name: task.task_name,
                earned_points: 0,
                total_points: task.total_points,
                progress_percent: 0
              })) || []
            };
          }
        } catch (err) {
          // If fetchProgressData fails, create default progress data with 0% progress
          progressData = {
            level_id: levelId,
            tasks: eventDataFromSecondApi.levels[selectedLevel]?.tasks.map(task => ({
              task_id: task.task_id,
              task_name: task.task_name,
              earned_points: 0,
              total_points: task.total_points,
              progress_percent: 0
            })) || []
          };
        }

        // Combine the data
        const combinedData = {
          ...eventDataFromSecondApi,
          progress: [{
            level_id: progressData.level_id,
            level_name: eventDataFromSecondApi.levels[selectedLevel]?.level_name || '',
            tasks: progressData.tasks.map((task: ProgressTask) => ({
              task_id: task.task_id,
              task_name: task.task_name,
              earned_points: task.earned_points,
              total_points: task.total_points,
              progress_percent: task.progress_percent
            }))
          }]
        };

        setEventData(combinedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [passedEventId, selectedLevel]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading event data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-red-400 text-lg font-medium mb-2">Error Loading Data</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">No event data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{
      background: `radial-gradient(ellipse 60% 50% at 0% 40%, rgba(218,0,171,0.45) 0%, rgba(12,0,37,0.95) 70%, #0C0025 100%)`,
      backgroundColor: '#0C0025',
    }}>
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}
      </style>
      <div className="relative z-10">
        <div className="px-4 pt-20 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => navigate('/student/tasks')}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-purple-400/30 rounded-xl text-gray-300 hover:text-white transition-all duration-300 group"
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Tasks</span>
              </button>
            </div>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                {eventData.event_name}
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Track your progress, complete tasks, and advance through levels in this comprehensive learning journey.
              </p>
            </div>
            <div className="flex flex-wrap justify-start gap-2 mb-8">
              {eventData.levels.map((level, index) => (
                <button
                  key={level.level_id}
                  onClick={() => setSelectedLevel(index)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${index === selectedLevel
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700/90 hover:text-white'
                    }`}
                >
                  {level.level_name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
                      {eventData.levels[selectedLevel]?.level_name}
                    </h2>
                    <p className="text-gray-400 text-sm max-w-md">
                      Complete all tasks in this level to unlock the next stage of your learning journey.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                      {selectedLevel + 1}
                    </div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Level
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Total Points</div>
                      <div className="text-2xl font-bold text-white">
                        {eventData.levels[selectedLevel]?.total_points}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Total Tasks</div>
                      <div className="text-2xl font-bold text-white">
                        {eventData.levels[selectedLevel]?.tasks.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tasks</h3>
                  <p className="text-gray-400">Complete these tasks to progress in your learning journey</p>
                </div>
                <div className="text-sm text-gray-400">
                  {eventData.levels[selectedLevel]?.tasks.length} tasks available
                </div>
              </div>
              <div className="space-y-8">
                {eventData.levels[selectedLevel]?.tasks.length > 0 ? (
                  eventData.levels[selectedLevel]?.tasks.map((task, taskIndex) => {
                    const taskProgress = eventData.progress?.find(levelProgress =>
                      levelProgress.level_id === eventData.levels[selectedLevel].level_id
                    )?.tasks.find(t => t.task_id === task.task_id);
                    const progressPercentage = taskProgress?.progress_percent || 0;
                    const completedSubtasks = task.subtasks.filter(s => s.status === 'completed').length;
                    const totalSubtasks = task.subtasks.length;
                    return (
                      <div key={task.task_id} className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.01] hover:border-purple-400/20 hover:shadow-2xl hover:shadow-purple-500/10">
                        <div className="p-8 border-b border-white/[0.05]">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-purple-400">{taskIndex + 1}</span>
                                </div>
                                <span className="text-2xl font-semibold text-gray-400">{task.task_name}</span>
                              </div>
                              <p className="text-gray-400 text-base leading-relaxed mb-4">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Due: {formatDate(task.deadline).split(',')[0]}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{task.total_points} points</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span>{totalSubtasks} subtasks</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-6">
                              <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {progressPercentage.toFixed(0)}%
                              </div>
                              <div className="text-sm text-gray-400 font-medium">Complete</div>
                            </div>
                          </div>
                          <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.05]">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">Task Progress</div>
                                  <div className="text-xs text-gray-400">
                                    {totalSubtasks === 0
                                      ? (progressPercentage === 100 ? 'Completed' : 'Not Completed')
                                      : `${completedSubtasks} of ${totalSubtasks} subtasks completed`}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-white/[0.05] rounded-full h-4 border border-white/[0.1] overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 h-full rounded-full transition-all duration-700 ease-out relative shadow-lg shadow-purple-500/25"
                                  style={{ width: `${progressPercentage}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-pink-400/50 rounded-full blur-sm"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {task.subtasks.length > 0 && (
                          <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-xl font-semibold text-white">Subtasks</h4>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <span className="text-sm text-gray-400">{completedSubtasks}/{totalSubtasks}</span>
                              </div>
                            </div>
                            <div className="space-y-6">
                              {task.subtasks.map((subtask, subtaskIndex) => (
                                <div key={subtask.subtask_id} className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-300">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4 flex-1">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${subtask.status === 'completed'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                                        : subtask.status === 'in_progress'
                                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                                          : 'bg-white/[0.05] border border-white/[0.1] text-gray-400'
                                        }`}>
                                        {subtask.status === 'completed' ? '✓' : subtaskIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-white mb-2 text-lg">{subtask.name}</h5>
                                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{subtask.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                          <span>Due: {formatDate(subtask.deadline).split(',')[0]}</span>
                                          <span>•</span>
                                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${subtask.status === 'completed'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                            : subtask.status === 'in_progress'
                                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                                              : 'bg-white/[0.05] text-gray-400 border border-white/[0.1]'
                                            }`}>
                                            {subtask.status === 'completed' ? 'Complete' :
                                              subtask.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        {subtask.points}
                                      </div>
                                      <div className="text-xs text-gray-500">points</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/[0.02] group-hover:via-pink-600/[0.02] group-hover:to-purple-600/[0.02] rounded-3xl transition-all duration-500 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="text-white text-xl font-semibold mb-2">No tasks available</div>
                    <div className="text-gray-400">This level doesn't have any tasks assigned yet.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCriteria;