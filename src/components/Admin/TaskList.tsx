"use client";

import React, { useState, useEffect, Component } from "react";
import type { ErrorInfo } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Layers, Target, CheckSquare, AlertCircle, Calendar, Award, User, Clock } from "lucide-react";
import Cookies from "js-cookie"; // at the top

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in TaskList:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-center shadow-sm max-w-7xl mx-auto">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-red-800 font-medium">Something went wrong</p>
            <p className="text-red-700 text-sm">
              {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface MarkingCriteria {
  fully_completed?: number;
  partially_completed?: number;
  incomplete?: number;
}

interface Subtask {
  subtask_id?: string;
  name?: string;
  description?: string;
  points?: number;
  deadline?: string;
  status?: string;
}

interface Task {
  task_id?: string;
  task_name?: string;
  description?: string;
  total_points?: number;
  deadline?: string;
  marking_criteria?: MarkingCriteria;
  subtasks?: Subtask[];
}

interface Level {
  level_id?: string;
  level_name?: string;
  total_points?: number;
  tasks?: Task[];
}

interface Event {
  _id?: string;
  event_id?: string;
  event_name?: string;
  assigned_to?: string[];
  levels?: Level[];
}

interface ApiResponse {
  events?: Event[];
}

const TaskList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const admin_name = Cookies.get("admin_name"); // reading from cookies
        const admin_id = Cookies.get("admin_id"); // reading from cookies
        if (!admin_name) {
          throw new Error("Admin name not found in cookies");
        }
        if (!admin_id) {
          throw new Error("Admin ID not found in cookies");
        }
        const response = await axios.post<ApiResponse>(
          "https://leaderboard-backend-4uxl.onrender.com/api/admin/fetch_grouped_tasks/",
          { admin_name, admin_id }, // POST body
          {
            headers: {
              "Content-Type": "application/json"
            },
            withCredentials: true
          }
        );

        console.log("API Response:", response.data);
        setEvents(response.data.events || []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.error || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);


  const toggleEvent = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "No Deadline";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Event List
              </h1>
              <p className="text-sm text-gray-600">Explore events, levels, tasks, and subtasks with detailed information</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-center shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading tasks...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && events.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No events found.</p>
              <p className="text-gray-500 text-sm">Create a new event to get started.</p>
            </div>
          )}

          {/* Events List */}
          {!loading && events.length > 0 && (
            <div className="space-y-6">
              {events.map((event, eventIndex) => (
                <div
                  key={event._id || `event-${eventIndex}`}
                  className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {eventIndex + 1}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{event.event_name || "Unnamed Event"}</h2>
                        {/* <p className="text-sm text-gray-600">Event ID: {event.event_id || "N/A"}</p> */}
                        <p className="text-sm text-gray-600 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Assigned to: {event.assigned_to && event.assigned_to.length > 0
                            ? event.assigned_to.join(", ")
                            : "None"}
                        </p>

                      </div>
                    </div>
                    <button
                      onClick={() => toggleEvent(event._id || `event-${eventIndex}`)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
                      aria-label={expandedEvents.has(event._id || `event-${eventIndex}`) ? "Collapse event" : "Expand event"}
                    >
                      {expandedEvents.has(event._id || `event-${eventIndex}`) ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {/* Levels */}
                  {expandedEvents.has(event._id || `event-${eventIndex}`) && (
                    <div className="space-y-4 ml-6">
                      {event.levels?.map((level, levelIndex) => (
                        <div
                          key={level.level_id || `level-${levelIndex}`}
                          className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Target className="w-5 h-5 text-blue-600" />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{level.level_name || "Unnamed Level"}</h3>
                                {/* <p className="text-sm text-gray-600">Level ID: {level.level_id || "N/A"}</p> */}
                                <p className="text-sm text-gray-600">Total Points: {level.total_points ?? 0}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLevel(level.level_id || `level-${levelIndex}`)}
                              className="p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
                              aria-label={expandedLevels.has(level.level_id || `level-${levelIndex}`) ? "Collapse level" : "Expand level"}
                            >
                              {expandedLevels.has(level.level_id || `level-${levelIndex}`) ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          {/* Tasks */}
                          {expandedLevels.has(level.level_id || `level-${levelIndex}`) && (
                            <div className="space-y-4 ml-6">
                              {level.tasks?.map((task, taskIndex) => (
                                <div
                                  key={task.task_id || `task-${taskIndex}`}
                                  className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <CheckSquare className="w-5 h-5 text-purple-600" />
                                      <div>
                                        <h4 className="text-md font-semibold text-gray-900">{task.task_name || "Unnamed Task"}</h4>
                                        {/* <p className="text-sm text-gray-600">Task ID: {task.task_id || "N/A"}</p> */}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => toggleTask(task.task_id || `task-${taskIndex}`)}
                                      className="p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
                                      aria-label={expandedTasks.has(task.task_id || `task-${taskIndex}`) ? "Collapse task" : "Expand task"}
                                    >
                                      {expandedTasks.has(task.task_id || `task-${taskIndex}`) ? (
                                        <ChevronUp className="w-5 h-5" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Task Details */}
                                  {expandedTasks.has(task.task_id || `task-${taskIndex}`) && (
                                    <div className="ml-6 space-y-3">
                                      <p className="text-sm text-gray-700">{task.description || "No description"}</p>
                                      <p className="text-sm text-gray-600 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Deadline: {formatDate(task.deadline)}
                                      </p>
                                      <p className="text-sm text-gray-600">Total Points: {task.total_points ?? 0}</p>
                                      {task.marking_criteria && (
                                        <div className="space-y-2">
                                          <div className="flex items-center">
                                            <Award className="w-5 h-5 text-emerald-600 mr-2" />
                                            <h5 className="text-sm font-semibold text-gray-900">Marking Criteria</h5>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-200">
                                              <div className="flex items-center mb-2">
                                                <CheckSquare className="w-4 h-4 text-emerald-600 mr-1" />
                                                <span className="text-sm font-medium text-emerald-800">Fully Completed</span>
                                              </div>
                                              <p className="text-sm text-emerald-700">
                                                {task.marking_criteria.fully_completed ?? 0}%
                                              </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-3 rounded-lg border border-amber-200">
                                              <div className="flex items-center mb-2">
                                                <Clock className="w-4 h-4 text-amber-600 mr-1" />
                                                <span className="text-sm font-medium text-amber-800">Partially Completed</span>
                                              </div>
                                              <p className="text-sm text-amber-700">
                                                {task.marking_criteria.partially_completed ?? 0}%
                                              </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
                                              <div className="flex items-center mb-2">
                                                <AlertCircle className="w-4 h-4 text-red-600 mr-1" />
                                                <span className="text-sm font-medium text-red-800">Incomplete</span>
                                              </div>
                                              <p className="text-sm text-red-700">
                                                {task.marking_criteria.incomplete ?? 0}%
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Subtasks */}
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                                          <CheckSquare className="w-5 h-5 text-purple-600 mr-2" />
                                          Subtasks
                                        </h5>
                                        {task.subtasks?.length ? (
                                          task.subtasks.map((subtask, subtaskIndex) => (
                                            <div
                                              key={subtask.subtask_id || `subtask-${subtaskIndex}`}
                                              className="bg-white p-3 rounded-lg border border-gray-200"
                                            >
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {subtaskIndex + 1}
                                                  </div>
                                                  <div>
                                                    <p className="text-sm font-medium text-gray-900">{subtask.name || "Unnamed Subtask"}</p>
                                                    <p className="text-xs text-gray-600">Subtask ID: {subtask.subtask_id || "N/A"}</p>
                                                  </div>
                                                </div>
                                                <span
                                                  className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusBadgeClass(
                                                    subtask.status
                                                  )}`}
                                                >
                                                  {subtask.status || "Unknown"}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-700">{subtask.description || "No description"}</p>
                                              <p className="text-sm text-gray-600 flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Deadline: {formatDate(subtask.deadline)}
                                              </p>
                                              <p className="text-sm text-gray-600">Points: {subtask.points ?? 0}</p>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-sm text-gray-600">No subtasks available</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TaskList;