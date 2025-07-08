import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

interface Subtask {
  subtask_id: string;
  name: string;
  description: string;
  points: number;
  deadline: string;
  status: string;
  marking_criteria: {
    fully_completed: number;
    partially_completed: number;
    incomplete: number;
  };
}

interface Task {
  task_id: string;
  task_name: string;
  description: string;
  total_points: number;
  subtasks: Subtask[];
  deadline: string;
  status?: string; // Optional status for tasks without subtasks
}

interface Level {
  level_id: string;
  level_name: string;
  total_points: number;
  tasks: Task[];
}

interface EventData {
  _id: string;
  event_id: string;
  event_name: string;
  assigned_to: string[];
  levels: Level[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  event: EventData;
}

const StudentCriteria: React.FC = () => {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(0); // Add state for selected level
  const location = useLocation();
  const navigate = useNavigate();
  const passedEventId = location.state?.event_id;

  // Fetch data from API
  useEffect(() => {
    if (!passedEventId) {
      setError("No event selected.");
      setLoading(false);
      return;
    }

    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://leaderboard-backend-4uxl.onrender.com/api/student/task-details/?event_id=${passedEventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event not found.');
          } else if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}. Please try again later.`);
          } else {
            throw new Error(`HTTP error: ${response.status}. Please try again.`);
          }
        }

        const data: ApiResponse = await response.json();

        // Validate the response structure
        if (!data || typeof data !== 'object' || !data.success || !data.event) {
          throw new Error('Invalid data format received from server.');
        }

        setEventData(data.event);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [passedEventId]);

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
        {/* Enhanced Header Section */}
        <div className="px-4 sm:px-6 lg:px-4 pt-20 pb-4">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/student/tasks')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-purple-400/30 rounded-xl text-gray-300 hover:text-white transition-all duration-300 group"
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Tasks</span>
              </button>
            </div>

            {/* Main Title */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 px-2">
                {eventData.event_name}
              </h1>
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-4">
                Track your progress, complete tasks, and advance through levels in this comprehensive learning journey.
              </p>
            </div>

            {/* Responsive Level Navigation */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6 sm:mb-8 px-2">
              {eventData.levels.map((level, index) => (
                <button
                  key={level.level_id}
                  onClick={() => setSelectedLevel(index)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 min-w-0 flex-shrink-0 ${index === selectedLevel
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

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Level Overview */}
            <div className="mb-6 sm:mb-8">
              {/* Level Info Card */}
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-4 sm:p-6 lg:p-8 hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                      {eventData.levels[selectedLevel]?.level_name}
                    </h2>
                    <p className="text-gray-400 text-sm max-w-md">
                      Complete all tasks in this level to unlock the next stage of your learning journey.
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                      {selectedLevel + 1}
                    </div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Level
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Total Points</div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
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
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {eventData.levels[selectedLevel]?.tasks.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tasks Section */}
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
                    const completedSubtasks = task.subtasks.filter(s => s.status === 'completed').length;
                    const totalSubtasks = task.subtasks.length;
                    
                    // Handle progress calculation for both cases
                    let progressPercentage = 0;
                    
                    if (totalSubtasks === 0) {
                      // No subtasks - check task status if available
                      progressPercentage = task.status === 'completed' ? 100 : 0;
                    } else {
                      // Has subtasks - show subtask completion
                      progressPercentage = Math.round((completedSubtasks / totalSubtasks) * 100);
                    }

                    return (
                      <div key={task.task_id} className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl hover:bg-white/[0.04] transition-all duration-500 hover:scale-[1.01] hover:border-purple-400/20 hover:shadow-2xl hover:shadow-purple-500/10">
                        {/* Task Header */}
                        <div className="p-4 sm:p-6 lg:p-8 border-b border-white/[0.05]">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-bold text-purple-400">{taskIndex + 1}</span>
                                </div>
                                <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-400">{task.task_name}</span>
                              </div>
                              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4">
                                {task.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Due: {formatDate(task.deadline).split(',')[0]}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{task.total_points} points</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span>{totalSubtasks} subtasks</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-center sm:text-right">
                              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {progressPercentage}%
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400 font-medium">Complete</div>
                            </div>
                          </div>                          {/* Enhanced Progress Display */}
                          <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/[0.05]">
                            {/* Progress Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">Task Progress</div>
                                  <div className="text-xs text-gray-400">
                                    {totalSubtasks === 0 
                                      ? (progressPercentage === 100 ? 'Completed' : 'Not Completed')
                                      : `${completedSubtasks} of ${totalSubtasks} subtasks completed`
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Progress Bar */}
                            <div className="relative">
                              <div className="w-full bg-white/[0.05] rounded-full h-3 sm:h-4 border border-white/[0.1] overflow-hidden">
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
                          <>                 
                        {/* Subtasks Section */}
                        <div className="p-4 sm:p-6 lg:p-8">
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h4 className="text-lg sm:text-xl font-semibold text-white">Subtasks</h4>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-400">{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                          </div>

                          <div className="space-y-4 sm:space-y-6">
                            {task.subtasks.map((subtask, subtaskIndex) => (
                              <div key={subtask.subtask_id} className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${subtask.status === 'completed'
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                                      : subtask.status === 'in_progress'
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                                        : 'bg-white/[0.05] border border-white/[0.1] text-gray-400'
                                      }`}>
                                      {subtask.status === 'completed' ? '✓' : subtaskIndex + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-white mb-2 text-base sm:text-lg">{subtask.name}</h5>
                                      <p className="text-gray-400 text-xs sm:text-sm mb-3 leading-relaxed">{subtask.description}</p>
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                        <span>Due: {formatDate(subtask.deadline).split(',')[0]}</span>
                                        <span>•</span>
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${subtask.status === 'completed'
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
                                  <div className="text-center sm:text-right">
                                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                      {subtask.points}
                                    </div>
                                    <div className="text-xs text-gray-500">points</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  }

                        {/* Modern Hover Effects */ }
                    < div className = "absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-purple-600/[0.02] group-hover:via-pink-600/[0.02] group-hover:to-purple-600/[0.02] rounded-3xl transition-all duration-500 pointer-events-none" />
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
    </div >
  );
};

export default StudentCriteria;