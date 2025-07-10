import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CheckSquare,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash,
  Clock,
  Target,
  Award,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Trophy,
  Star,
  Crown,
  Users,
  BarChart3,
  Flame,
  Loader2,
} from "lucide-react";
import Select from "react-select";

interface Subtask {
  name: string;
  description: string;
  points: number | string;
  start_date: string;
  end_date: string;
  task_type: string;
  deadline_time: string;
  marking_criteria: {
    fully_completed: number;
    partially_completed: number;
    incomplete: number;
  };
}

interface Task {
  task_name: string;
  description: string;
  points: number | string;
  subtasks: Subtask[];
  start_date: string;
  end_date: string;
  task_type: string;
  deadline_time: string;
  marking_criteria: {
    fully_completed: number;
    partially_completed: number;
    incomplete: number;
  };
}

interface Level {
  level_name: string;
  tasks: Task[];
}

interface FormData {
  event_name: string;
  levels: Level[];
  assigned_to: string[];
}

interface Admin {
  name: string;
  email: string;
  Admin_ID: string;
}

interface AssignedAdmin {
  admin_id: string;
  students: { name: string; roll_no: string }[];
}

interface ResponseData {
  object_id: string;
  event_id: string;
  message: string;
  event_name: string;
  assigned_to: string[];
  assigned_admins: AssignedAdmin[];
}

const CreateTaskPageNew: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    event_name: "",
    levels: [],
    assigned_to: [],
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [showStudents, setShowStudents] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"overview" | "level" | "task">("overview");
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [selectedTask, setSelectedTask] = useState<number>(0);
  const [, setExpandedTasks] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setFormData({
        event_name: parsedData.event_name || "",
        levels: parsedData.levels || [],
        assigned_to: parsedData.assigned_to || [],
      });
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  // Close mobile sidebar when changing views
  const handleViewChange = (view: "overview" | "level" | "task", level?: number, task?: number) => {
    setCurrentView(view);
    if (level !== undefined) setSelectedLevel(level);
    if (task !== undefined) setSelectedTask(task);
    setMobileSidebarOpen(false);
  };

  const taskTypeOptions = [
    { value: "Daily", label: "Daily", icon: "🔄" },
    { value: "Weekly", label: "Weekly", icon: "📅" },
    { value: "Once", label: "Once", icon: "⚡" },
  ];

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("https://leaderboard-backend-4uxl.onrender.com/api/superadmin/get_admins/");
        setAdmins(response.data);
      } catch (err) {
        console.error("Fetch admins error:", err);
        setError("Failed to fetch admin details");
      }
    };
    fetchAdmins();
  }, []);

  // Calculate available task types based on date range
  const getAvailableTaskTypes = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const availableTypes = [];

    // Always available
    availableTypes.push({ value: "", label: "One-time Task", icon: "⚡" });

    // Daily: minimum 2 days
    if (diffDays >= 2) {
      availableTypes.push(taskTypeOptions[0]);
    }

    // Weekly: minimum 7 days
    if (diffDays >= 7) {
      availableTypes.push(taskTypeOptions[1]);
    }

    // Once: minimum 28 days (was Monthly, now Once)
    if (diffDays >= 28) {
      availableTypes.push(taskTypeOptions[2]);
    }

    return availableTypes;
  };

  const addLevel = () => {
    setFormData({
      ...formData,
      levels: [
        ...formData.levels,
        {
          level_name: "",
          tasks: [],
        },
      ],
    });
  };

  const removeLevel = (levelIndex: number) => {
    if (formData.levels.length > 1) {
      setFormData({
        ...formData,
        levels: formData.levels.filter((_, i) => i !== levelIndex),
      });
      if (selectedLevel >= levelIndex && selectedLevel > 0) {
        setSelectedLevel(selectedLevel - 1);
      }
      if (currentView === "level" && selectedLevel === levelIndex) {
        setCurrentView("overview");
      }
    }
  };

  const addTask = (levelIndex: number) => {
    const newLevels = [...formData.levels];
    newLevels[levelIndex].tasks.push({
      task_name: "",
      description: "",
      points: "" as unknown as number,
      subtasks: [],
      start_date: "",
      end_date: "",
      task_type: "",
      deadline_time: "",
      marking_criteria: { fully_completed: 0, partially_completed: 0, incomplete: 0 },
    });
    setFormData({ ...formData, levels: newLevels });
  };

  const removeTask = (levelIndex: number, taskIndex: number) => {
    const newLevels = [...formData.levels];
    if (newLevels[levelIndex].tasks.length > 1) {
      newLevels[levelIndex].tasks = newLevels[levelIndex].tasks.filter((_, i) => i !== taskIndex);
      setFormData({ ...formData, levels: newLevels });
      setExpandedTasks((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(`${levelIndex}-${taskIndex}`);
        return newSet;
      });
      if (selectedTask >= taskIndex && selectedTask > 0) {
        setSelectedTask(selectedTask - 1);
      }
      if (currentView === "task" && selectedTask === taskIndex) {
        setCurrentView("level");
      }
    }
  };

  const addSubtask = (levelIndex: number, taskIndex: number) => {
    const newLevels = [...formData.levels];
    newLevels[levelIndex].tasks[taskIndex].subtasks.push({
      name: "",
      description: "",
      points: "" as unknown as number,
      start_date: "",
      end_date: "",
      task_type: "",
      deadline_time: "",
      marking_criteria: { fully_completed: 0, partially_completed: 0, incomplete: 0 },
    });
    setFormData({ ...formData, levels: newLevels });
  };

  const removeSubtask = (levelIndex: number, taskIndex: number, subtaskIndex: number) => {
    const newLevels = [...formData.levels];
    newLevels[levelIndex].tasks[taskIndex].subtasks = newLevels[levelIndex].tasks[taskIndex].subtasks.filter(
      (_, i) => i !== subtaskIndex
    );
    setFormData({ ...formData, levels: newLevels });
  };

  const updateLevel = (levelIndex: number, field: keyof Level, value: string) => {
    const newLevels = [...formData.levels];
    newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
    setFormData({ ...formData, levels: newLevels });
  };

  const updateTask = (levelIndex: number, taskIndex: number, field: keyof Task, value: string | number | object) => {
    const newLevels = [...formData.levels];
    if (field === "marking_criteria") {
      const markingCriteria = value as Task["marking_criteria"];
      newLevels[levelIndex].tasks[taskIndex] = {
        ...newLevels[levelIndex].tasks[taskIndex],
        marking_criteria: {
          ...markingCriteria,
          incomplete: 0, // Always keep incomplete at 0
        },
      };
    } else {
      if (field === "points") {
        // For empty values, use 0 in the object but handle display separately with an empty string
        const inputValue = value === "" ? 0 : Math.min(Math.max(Number(value) || 0, 0), 100000);
        newLevels[levelIndex].tasks[taskIndex] = {
          ...newLevels[levelIndex].tasks[taskIndex],
          [field]: inputValue,
        };

        if (value !== "") {
          const points = inputValue as number;
          newLevels[levelIndex].tasks[taskIndex].marking_criteria = {
            fully_completed: points,
            partially_completed: Math.min(Math.floor(points / 2), 50000),
            incomplete: 0,
          };
        }
      } else {
        newLevels[levelIndex].tasks[taskIndex] = {
          ...newLevels[levelIndex].tasks[taskIndex],
          [field]: value,
        };
      }
    }
    setFormData({ ...formData, levels: newLevels });
  };

  const updateMarkingCriteria = (
    levelIndex: number,
    taskIndex: number,
    field: keyof Task["marking_criteria"],
    value: number
  ) => {
    const newLevels = [...formData.levels];
    const currentTask = newLevels[levelIndex].tasks[taskIndex];
    const taskPoints = Number(currentTask.points) || 0;

    // Apply maximum limits based on task points
    let limitedValue = value;
    if (field === "fully_completed") {
      limitedValue = Math.min(Math.max(value, 0), taskPoints);
    } else if (field === "partially_completed") {
      limitedValue = Math.min(Math.max(value, 0), taskPoints);
    } else if (field === "incomplete") {
      limitedValue = Math.min(Math.max(value, 0), taskPoints);
    }
    // Update only the specific marking criteria field
    newLevels[levelIndex].tasks[taskIndex].marking_criteria = {
      ...currentTask.marking_criteria,
      [field]: limitedValue,
    };
    setFormData({ ...formData, levels: newLevels });
  };

  const updateSubtask = (
    levelIndex: number,
    taskIndex: number,
    subtaskIndex: number,
    field: keyof Subtask,
    value: string | number | object
  ) => {
    const newLevels = [...formData.levels];
    const task = newLevels[levelIndex].tasks[taskIndex];
    const subtask = task.subtasks[subtaskIndex];

    if (field === "points") {
      // Calculate the total points allocated to other subtasks
      const otherSubtasksTotal = task.subtasks.reduce((sum, s, idx) =>
        idx !== subtaskIndex ? sum + (Number(s.points) || 0) : sum, 0);

      // Calculate the maximum points available for this subtask
      const maxAvailablePoints = Math.max(0, Number(task.points) - otherSubtasksTotal);

      // Limit the points to the available amount
      const points = Math.min(Math.max(Number(value) || 0, 0), maxAvailablePoints);



      newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex] = {
        ...subtask,
        points,
        marking_criteria: {
          fully_completed: points,
          partially_completed: Math.min(Math.floor(points / 2), 50000),
          incomplete: 0,
        },
      };
    } else if (field === "marking_criteria") {
      const markingCriteria = value as Subtask["marking_criteria"];
      newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex] = {
        ...subtask,
        marking_criteria: markingCriteria,
        points: markingCriteria.fully_completed,
      };
    } else if (field === "deadline_time") {
      const deadlineTime = value as string;
      const taskDeadlineTime = task.deadline_time;

      if (taskDeadlineTime) {
        if (deadlineTime > taskDeadlineTime) {
          toast.error("Subtask deadline time cannot be later than the task's deadline time.");
          return;
        }
      }

      newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex] = {
        ...subtask,
        [field]: deadlineTime,
      };
    } else {
      newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex] = {
        ...subtask,
        [field]: value,
      };
    }

    setFormData({ ...formData, levels: newLevels });
  };

  const updateSubtaskMarkingCriteria = (
    levelIndex: number,
    taskIndex: number,
    subtaskIndex: number,
    field: keyof Subtask["marking_criteria"],
    value: number
  ) => {
    const newLevels = [...formData.levels];
    const currentSubtask = newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex];
    const subtaskPoints = Number(currentSubtask.points) || 0;

    // Apply maximum limits based on subtask points
    let limitedValue = value;
    if (field === "fully_completed") {
      limitedValue = Math.min(Math.max(value, 0), subtaskPoints);
    } else if (field === "partially_completed") {
      limitedValue = Math.min(Math.max(value, 0), subtaskPoints);
    } else if (field === "incomplete") {
      limitedValue = Math.min(Math.max(value, 0), subtaskPoints);
    }
    // Update only the specific marking criteria field
    newLevels[levelIndex].tasks[taskIndex].subtasks[subtaskIndex].marking_criteria = {
      ...currentSubtask.marking_criteria,
      [field]: limitedValue,
    };
    // Add console logs to debug the values
    console.log("Subtask Points:", currentSubtask.points);
    console.log("Fully Completed:", currentSubtask.marking_criteria.fully_completed);
    console.log("Partially Completed:", currentSubtask.marking_criteria.partially_completed);
    console.log("Incomplete:", currentSubtask.marking_criteria.incomplete);
    setFormData({ ...formData, levels: newLevels });
  };

  const calculateTaskPoints = (task: Task) => {
    return task.subtasks.reduce((sum, subtask) => sum + (Number(subtask.points) || 0), 0);
  };

  const calculateLevelPoints = (level: Level) => {
    return level.tasks.reduce((sum, task) => sum + (Number(task.points) || 0), 0);
  };

  const calculateTotalPoints = () => {
    return formData.levels.reduce((sum, level) => sum + calculateLevelPoints(level), 0);
  };

  const getTotalTasks = () => {
    return formData.levels.reduce((sum, level) => sum + level.tasks.length, 0);
  };

  const validateMarkingCriteria = (criteria: Task["marking_criteria"], taskPoints: number | string) => {
    const points = Number(taskPoints) || 0;
    return (
      criteria.fully_completed >= 0 &&
      criteria.partially_completed >= 0 &&
      criteria.incomplete >= 0 &&
      criteria.fully_completed <= points &&
      criteria.fully_completed > criteria.partially_completed &&
      criteria.partially_completed > criteria.incomplete
    );
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case "Daily":
        return "🔄";
      case "Weekly":
        return "📅";
      case "Once":
        return "⚡";
      default:
        return "⚡";
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case "Daily":
        return "from-emerald-500 to-green-500";
      case "Weekly":
        return "from-blue-500 to-indigo-500";
      case "Once":
        return "from-amber-500 to-orange-500";
      default:
        return "from-amber-500 to-orange-500";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation logic
    if (!formData.event_name.trim()) {
      setError("Event name is required");
      return;
    }
    if (!/^[a-zA-Z0-9\s\-.,!&()]+$/.test(formData.event_name)) {
      setError("Event name contains invalid characters");
      return;
    }
    if (formData.assigned_to.length === 0) {
      setError("Please select at least one admin to assign the event");
      return;
    }
    if (formData.levels.length === 0) {
      setError("At least one level is required");
      return;
    }

    for (const [levelIndex, level] of formData.levels.entries()) {
      if (!level.level_name.trim()) {
        setError(`Level ${levelIndex + 1} name is required`);
        return;
      }
      if (!/^[a-zA-Z0-9\s\-.,!&()]+$/.test(level.level_name)) {
        setError(`Level ${levelIndex + 1} name contains invalid characters`);
        return;
      }
      if (level.tasks.length === 0) {
        setError(`Level ${levelIndex + 1} must have at least one task`);
        return;
      }

      for (const [taskIndex, task] of level.tasks.entries()) {
        if (
          !task.task_name.trim() ||
          !task.description.trim() ||
          !task.start_date ||
          !task.end_date ||
          (typeof task.points === 'number' && task.points < 0) ||
          task.points === ""
        ) {
          setError(`Task ${taskIndex + 1} in Level ${levelIndex + 1} is missing required fields or has invalid points`);
          return;
        }

        const taskStartDate = new Date(task.start_date);
        const taskEndDate = new Date(task.end_date);
        const todayDate = new Date(today);

        if (taskStartDate < todayDate) {
          setError(`Task ${taskIndex + 1} start date in Level ${levelIndex + 1} cannot be in the past`);
          return;
        }
        if (taskEndDate <= taskStartDate) {
          setError(`Task ${taskIndex + 1} end date in Level ${levelIndex + 1} must be after start date`);
          return;
        }
        if (!validateMarkingCriteria(task.marking_criteria, task.points)) {
          setError(
            `Task ${taskIndex + 1} in Level ${levelIndex + 1} marking criteria must follow: Fully Completed ≤ Task Points, Fully Completed > Partially Completed > Incomplete, and be non-negative`
          );
          return;
        }

        const totalSubtaskPoints = calculateTaskPoints(task);
        const taskPointsNum = Number(task.points) || 0;

        if (totalSubtaskPoints > taskPointsNum) {
          setError(`The sum of subtask points in Task ${taskIndex + 1} of Level ${levelIndex + 1} exceeds the task points.`);
          return;
        }

        if (task.subtasks.length > 0 && totalSubtaskPoints < taskPointsNum) {
          toast.error(`The sum of subtask points in Task ${taskIndex + 1} of Level ${levelIndex + 1} is below the task points.`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      const payload = {
        event_name: formData.event_name.trim(),
        assigned_to: formData.assigned_to,
        levels: formData.levels.map((level) => ({
          level_name: level.level_name.trim(),
          tasks: level.tasks.map((task) => {
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            // Map task_type for API: "Once" for one-time, "Daily", "Weekly"
            let mappedTaskType = "Once";
            if (!hasSubtasks) {
              if (task.task_type && typeof task.task_type === "string") {
                const ttype = task.task_type.toLowerCase();
                if (ttype === "weekly") mappedTaskType = "Weekly";
                else if (ttype === "daily") mappedTaskType = "Daily";
                else mappedTaskType = "Once";
              } else {
                mappedTaskType = "Once";
              }
            }
            return {
              task_name: task.task_name.trim(),
              description: task.description.trim(),
              points: task.points,
              start_date: task.start_date,
              end_date: task.end_date,
              ...(hasSubtasks ? {} : { task_type: mappedTaskType }),
              deadline_time: task.deadline_time || null,
              marking_criteria: task.marking_criteria,
              subtasks: task.subtasks
                .filter((s) => s.name.trim() && s.description.trim() && (Number(s.points) >= 0) && s.start_date && s.end_date)
                .map((s) => {
                  let mappedSubTaskType = "Once";
                  if (s.task_type && typeof s.task_type === "string") {
                    const stype = s.task_type.toLowerCase();
                    if (stype === "weekly") mappedSubTaskType = "Weekly";
                    else if (stype === "daily") mappedSubTaskType = "Daily";
                    else mappedSubTaskType = "Once";
                  } else {
                    mappedSubTaskType = "Once";
                  }
                  return {
                    name: s.name.trim(),
                    description: s.description.trim(),
                    points: s.points,
                    start_date: s.start_date,
                    end_date: s.end_date,
                    task_type: mappedSubTaskType,
                    deadline_time: s.deadline_time || null,
                    marking_criteria: s.marking_criteria,
                  };
                }),
            };
          }),
        })),
      };

      const response = await axios.post("https://leaderboard-backend-4uxl.onrender.com/api/superadmin/create_task/", payload);
      setResponseData(response.data);
      setSuccess(true);
      navigate("/superadmin/dashboard");
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.response?.data?.error || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const adminOptions = admins.map((admin) => ({
    value: admin.Admin_ID,
    label: `${admin.name} (${admin.Admin_ID})`,
  }));

  // Success screen with updated theme
  if (success && responseData) {
    const totalStudents = responseData.assigned_admins.reduce((sum, admin) => sum + admin.students.length, 0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Event Created Successfully!
          </h2>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">Event Name: {responseData.event_name}</p>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">Event ID: {responseData.event_id}</p>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">Assigned to: {responseData.assigned_to.join(", ")}</p>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Total Students Assigned: {totalStudents}</p>
          <button
            type="button"
            onClick={() => setShowStudents(!showStudents)}
            className="flex items-center justify-center mx-auto mb-4 text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base"
          >
            {showStudents ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Student Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Student Details
              </>
            )}
          </button>
          {showStudents && (
            <div className="text-left max-h-48 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {responseData.assigned_admins.map((admin, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">Admin: {admin.admin_id}</h3>
                  <ul className="list-disc pl-5 text-gray-600 text-sm">
                    {admin.students.length > 0 ? (
                      admin.students.map((student, sIndex) => (
                        <li key={sIndex}>
                          {student.name} ({student.roll_no})
                        </li>
                      ))
                    ) : (
                      <li>No students assigned</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full animate-pulse w-full"></div>
          </div>
          <p className="text-sm text-gray-500 mt-3 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Main interface with updated theme
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToastContainer />
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100/80 via-indigo-100/80 to-blue-100/80 backdrop-blur-sm border-b border-white/20 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-5 py-3 sm:py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-30 animate-pulse"></div>
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight truncate">
                  {formData.event_name || "Create Leadership Event"}
                </h1>
                <p className="text-xs text-gray-500 font-medium truncate">
                  {formData.levels.length} Levels • {getTotalTasks()} Tasks • {calculateTotalPoints()} Points
                </p>
              </div>
            </div>
            <div className="flex items-start justify-end space-x-3 sm:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500">Total Points</p>
                <p className="text-lg font-bold text-blue-600">{calculateTotalPoints()}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="fixed top-4 right-4 z-50 p-2 sm:p-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center text-xs sm:text-sm shadow-md hover:scale-105 transform"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-gray-600" />
                <span className="hidden sm:block font-medium">Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)]">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-full lg:w-80"
            } ${sidebarCollapsed ? "lg:w-16" : "lg:w-80"
            } bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl transition-all duration-300 flex flex-col ${sidebarCollapsed ? "" : "lg:border-r"
            } ${sidebarCollapsed ? "" : "lg:flex-shrink-0"
            } ${mobileSidebarOpen ? "fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto" : "hidden lg:flex"
            } order-2 lg:order-1`}
        >
          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Navigation</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileSidebarOpen(false);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {sidebarCollapsed ? (
                  <Menu className="w-4 h-4 text-gray-600" />
                ) : (
                  <X className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {!sidebarCollapsed && (
              <>
                {/* Overview */}
                <button
                  onClick={() => handleViewChange("overview")}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${currentView === "overview"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <div>
                      <div className="font-medium text-sm sm:text-base">Event Overview</div>
                      <div className="text-xs opacity-75">Configuration & Summary</div>
                    </div>
                  </div>
                </button>
                {/* Levels */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Levels ({formData.levels.length})</span>
                    <button onClick={addLevel} className="p-1 hover:bg-gray-100 rounded transition-all duration-200">
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  {formData.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="space-y-2">
                      <button
                        onClick={() => {
                          handleViewChange("level", levelIndex);
                        }}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${currentView === "level" && selectedLevel === levelIndex
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                          : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {levelIndex + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{level.level_name || `Level ${levelIndex + 1}`}</div>
                              <div className="text-xs opacity-75">
                                {level.tasks.length} Tasks • {calculateLevelPoints(level)} Points
                              </div>
                            </div>
                          </div>
                          {formData.levels.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLevel(levelIndex);
                              }}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </button>
                      {/* Tasks under this level */}
                      {currentView === "level" && selectedLevel === levelIndex && (
                        <div className="ml-4 space-y-1">
                          {level.tasks.map((task, taskIndex) => (
                            <button
                              key={taskIndex}
                              onClick={() => {
                                handleViewChange("task", levelIndex, taskIndex);
                              }}
                              className={`w-full p-2 rounded-lg text-left transition-all duration-200 ${selectedLevel === levelIndex && selectedTask === taskIndex
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                                  <div>
                                    <div className="font-medium text-xs">
                                      {task.task_name || `Task ${taskIndex + 1}`}
                                    </div>
                                    <div className="text-xs opacity-75">{task.points} Points</div>
                                  </div>
                                </div>
                                {level.tasks.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTask(levelIndex, taskIndex);
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                                  >
                                    <Trash className="w-2 h-2" />
                                  </button>
                                )}
                              </div>
                            </button>
                          ))}
                          <button
                            onClick={() => addTask(levelIndex)}
                            className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-all duration-200 text-xs"
                          >
                            <Plus className="w-3 h-3 inline mr-1" />
                            Add Task
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto order-1 lg:order-2">
          <div className="p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start sm:items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-red-800 font-medium text-sm sm:text-base">Error</p>
                  <p className="text-red-700 text-sm break-words">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Overview Content */}
              {currentView === "overview" && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center text-gray-900">
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                      Event Configuration
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <Flame className="w-4 h-4 mr-1" />
                          Event Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter event name (e.g., Leadership Challenge 2025)"
                          value={formData.event_name}
                          onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div className="relative space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <Users className="w-4 h-4 mr-1" />
                          Assign To Admins *
                        </label>
                        <Select
                          isMulti
                          options={adminOptions}
                          value={adminOptions.filter((option) => formData.assigned_to.includes(option.value))}
                          onChange={(selectedOptions) => {
                            const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                            setFormData({ ...formData, assigned_to: selectedValues });
                          }}
                          placeholder="Search and select admins..."
                          className="text-sm"
                          classNamePrefix="select"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: "white",
                              border: "1px solid rgb(209, 213, 219)",
                              borderRadius: "0.5rem",
                              padding: "0.25rem",
                              boxShadow: "none",
                              color: "rgb(17, 24, 39)",
                              "&:hover": {
                                borderColor: "rgb(59, 130, 246)",
                              },
                              "&:focus-within": {
                                borderColor: "rgb(59, 130, 246)",
                                boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2)",
                              },
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: "white",
                              border: "1px solid rgb(209, 213, 219)",
                              borderRadius: "0.5rem",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                              zIndex: 9999,
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                            option: (base, { isFocused, isSelected }) => ({
                              ...base,
                              backgroundColor: isSelected
                                ? "rgb(59, 130, 246)"
                                : isFocused
                                  ? "rgb(243, 244, 246)"
                                  : "transparent",
                              color: isSelected ? "white" : "rgb(17, 24, 39)",
                              "&:active": {
                                backgroundColor: "rgb(59, 130, 246)",
                              },
                            }),
                            multiValue: (base) => ({
                              ...base,
                              backgroundColor: "rgb(219, 234, 254)",
                              border: "1px solid rgb(147, 197, 253)",
                            }),
                            multiValueLabel: (base) => ({
                              ...base,
                              color: "rgb(30, 64, 175)",
                            }),
                            multiValueRemove: (base) => ({
                              ...base,
                              color: "rgb(30, 64, 175)",
                              "&:hover": {
                                backgroundColor: "rgb(239, 68, 68)",
                                color: "white",
                              },
                            }),
                            placeholder: (base) => ({
                              ...base,
                              color: "rgb(107, 114, 128)",
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: "rgb(17, 24, 39)",
                            }),
                            input: (base) => ({
                              ...base,
                              color: "rgb(17, 24, 39)",
                            }),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Event Summary */}
                  <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center text-gray-900">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                      Event Summary
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                          <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{formData.levels.length}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Levels</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{getTotalTasks()}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Tasks</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-600">{calculateTotalPoints()}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Total Points</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">{formData.assigned_to.length}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Admins</p>
                      </div>
                    </div>
                  </div>
                  {/* Levels Overview */}
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                      <h3 className="text-xl sm:text-2xl font-bold flex items-center text-gray-900">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                        Levels Overview
                      </h3>
                      <button
                        type="button"
                        onClick={addLevel}
                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Level
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.levels.map((level, levelIndex) => (
                        <div
                          key={levelIndex}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setCurrentView("level");
                            setSelectedLevel(levelIndex);
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {levelIndex + 1}
                            </div>
                            {formData.levels.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLevel(levelIndex);
                                }}
                                className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {level.level_name || `Level ${levelIndex + 1}`}
                          </h4>
                          <div className="text-sm text-gray-600">
                            <p>{level.tasks.length} Tasks</p>
                            <p>{calculateLevelPoints(level)} Points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Level Content */}
              {currentView === "level" && formData.levels[selectedLevel] && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                      <h3 className="text-xl sm:text-2xl font-bold flex items-center text-gray-900">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2 sm:mr-3">
                          {selectedLevel + 1}
                        </div>
                        Level Configuration
                      </h3>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Level Points</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                          {calculateLevelPoints(formData.levels[selectedLevel])}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Level Name *</label>
                        <input
                          type="text"
                          placeholder="Enter level name (e.g., Foundation Phase)"
                          value={formData.levels[selectedLevel].level_name}
                          onChange={(e) => updateLevel(selectedLevel, "level_name", e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {/* Tasks Grid */}
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                      <h3 className="text-lg sm:text-xl font-bold flex items-center text-gray-900">
                        <Target className="w-5 h-5 mr-2 text-emerald-600" />
                        Tasks ({formData.levels[selectedLevel].tasks.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => addTask(selectedLevel)}
                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.levels[selectedLevel].tasks.map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setCurrentView("task");
                            setSelectedTask(taskIndex);
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-8 h-8 bg-gradient-to-r ${getTaskTypeColor(task.task_type)} rounded-full flex items-center justify-center text-white text-lg`}
                            >
                              {getTaskTypeIcon(task.task_type)}
                            </div>
                            {formData.levels[selectedLevel].tasks.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTask(selectedLevel, taskIndex);
                                }}
                                className="p-1 text-red-500 hover:bg-red-100 rounded transition-all duration-200"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {task.task_name || `Task ${taskIndex + 1}`}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {task.points} Points
                            </p>
                            {task.task_type && (
                              <p className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.task_type}
                              </p>
                            )}
                            {task.start_date && task.end_date && (
                              <p className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.start_date).toLocaleDateString()} -{" "}
                                {new Date(task.end_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Task Content */}
              {currentView === "task" &&
                formData.levels[selectedLevel] &&
                formData.levels[selectedLevel].tasks[selectedTask] && (
                  <div className="space-y-6 sm:space-y-8">
                    {(() => {
                      const task = formData.levels[selectedLevel].tasks[selectedTask];
                      const availableTaskTypes = getAvailableTaskTypes(task.start_date, task.end_date);
                      return (
                        <>
                          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                              <h3 className="text-xl sm:text-2xl font-bold flex items-center text-gray-900">
                                <div
                                  className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r ${getTaskTypeColor(task.task_type)} rounded-full flex items-center justify-center text-white text-sm sm:text-lg mr-2 sm:mr-3`}
                                >
                                  {getTaskTypeIcon(task.task_type)}
                                </div>
                                Task Configuration
                              </h3>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Task Points</p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{task.points}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Task Name *</label>
                                  <input
                                    type="text"
                                    placeholder="Enter task name"
                                    value={task.task_name}
                                    onChange={(e) => updateTask(selectedLevel, selectedTask, "task_name", e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Task Points *</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      placeholder="Points"
                                      value={task.points}
                                      onChange={(e) => updateTask(selectedLevel, selectedTask, "points", e.target.value)}
                                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 placeholder-gray-500 pr-12 text-sm sm:text-base"
                                      min="0"
                                      max="100000"
                                      required
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">pts</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">Task Description *</label>
                                  <textarea
                                    value={task.description}
                                    onChange={(e) => updateTask(selectedLevel, selectedTask, "description", e.target.value)}
                                    rows={4}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none text-sm sm:text-base"
                                    placeholder="Describe the task..."
                                    required
                                  />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-700">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Start Date *
                                    </label>
                                    <input
                                      type="date"
                                      value={task.start_date}
                                      min={today}
                                      onChange={(e) => {
                                        updateTask(selectedLevel, selectedTask, "start_date", e.target.value);
                                        const newAvailableTypes = getAvailableTaskTypes(e.target.value, task.end_date);
                                        if (!newAvailableTypes.some((type) => type.value === task.task_type)) {
                                          updateTask(selectedLevel, selectedTask, "task_type", "");
                                        }
                                      }}
                                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 text-sm sm:text-base"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="flex items-center text-sm font-semibold text-gray-700">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      End Date *
                                    </label>
                                    <input
                                      type="date"
                                      value={task.end_date}
                                      min={task.start_date || today}
                                      onChange={(e) => {
                                        updateTask(selectedLevel, selectedTask, "end_date", e.target.value);
                                        const newAvailableTypes = getAvailableTaskTypes(task.start_date, e.target.value);
                                        if (!newAvailableTypes.some((type) => type.value === task.task_type)) {
                                          updateTask(selectedLevel, selectedTask, "task_type", "");
                                        }
                                      }}
                                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 text-sm sm:text-base"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {/* Show Task Type only if there are no subtasks */}
                                  {task.subtasks.length === 0 && (
                                    <>
                                      <label className="flex items-center text-sm font-semibold text-gray-700">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Task Type
                                      </label>
                                      <Select
                                        options={availableTaskTypes}
                                        value={availableTaskTypes.find((option) => option.value === task.task_type) || null}
                                        onChange={(selectedOption) =>
                                          updateTask(
                                            selectedLevel,
                                            selectedTask,
                                            "task_type",
                                            selectedOption ? selectedOption.value : "",
                                          )
                                        }
                                        placeholder={
                                          availableTaskTypes.length > 1 ? "Select task type" : "Set dates to unlock types"
                                        }
                                        isClearable
                                        isDisabled={availableTaskTypes.length <= 1}
                                        className="text-sm"
                                        classNamePrefix="select"
                                        formatOptionLabel={(option: any) => (
                                          <div className="flex items-center">
                                            <span className="mr-2">{option.icon}</span>
                                            {option.label}
                                          </div>
                                        )}
                                        styles={{
                                          control: (base, state) => ({
                                            ...base,
                                            backgroundColor: "white",
                                            border: "1px solid rgb(209, 213, 219)",
                                            borderRadius: "0.5rem",
                                            padding: "0.25rem",
                                            boxShadow: "none",
                                            color: "rgb(17, 24, 39)",
                                            opacity: state.isDisabled ? 0.5 : 1,
                                            "&:hover": {
                                              borderColor: "rgb(16, 185, 129)",
                                            },
                                            "&:focus-within": {
                                              borderColor: "rgb(16, 185, 129)",
                                              boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.2)",
                                            },
                                          }),
                                          menu: (base) => ({
                                            ...base,
                                            backgroundColor: "white",
                                            border: "1px solid rgb(209, 213, 219)",
                                            borderRadius: "0.5rem",
                                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                            zIndex: 9999,
                                          }),
                                          option: (base, { isFocused, isSelected }) => ({
                                            ...base,
                                            backgroundColor: isSelected
                                              ? "rgb(16, 185, 129)"
                                              : isFocused
                                                ? "rgb(243, 244, 246)"
                                                : "transparent",
                                            color: isSelected ? "white" : "rgb(17, 24, 39)",
                                            "&:active": {
                                              backgroundColor: "rgb(16, 185, 129)",
                                            },
                                          }),
                                          placeholder: (base) => ({
                                            ...base,
                                            color: "rgb(107, 114, 128)",
                                          }),
                                          singleValue: (base) => ({
                                            ...base,
                                            color: "rgb(17, 24, 39)",
                                          }),
                                          input: (base) => ({
                                            ...base,
                                            color: "rgb(17, 24, 39)",
                                          }),
                                        }}
                                      />
                                      {availableTaskTypes.length <= 1 && (
                                        <p className="text-xs text-gray-500">
                                          💡 Set a longer date range to unlock Daily (2+ days), Weekly (7+ days), or Once (28+ days) options
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="flex items-center text-sm font-semibold text-gray-700">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Deadline Time
                                  </label>
                                  <input
                                    type="time"
                                    value={task.deadline_time}
                                    onChange={(e) => updateTask(selectedLevel, selectedTask, "deadline_time", e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 text-sm sm:text-base"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Subtasks */}
                          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                              <h3 className="text-lg sm:text-xl font-bold flex items-center text-gray-900">
                                <CheckSquare className="w-5 h-5 mr-2 text-purple-600" />
                                Subtasks (Optional)
                              </h3>
                              <button
                                type="button"
                                onClick={() => addSubtask(selectedLevel, selectedTask)}
                                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subtask
                              </button>
                            </div>
                            {task.subtasks.length > 0 ? (
                              <div className="space-y-6">
                                {task.subtasks.map((subtask, subtaskIndex) => {
                                  const availableSubtaskTypes = getAvailableTaskTypes(subtask.start_date, subtask.end_date);
                                  return (
                                    <div key={subtaskIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Subtask {subtaskIndex + 1}</h4>
                                        <button
                                          type="button"
                                          onClick={() => removeSubtask(selectedLevel, selectedTask, subtaskIndex)}
                                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Subtask Name *</label>
                                            <input
                                              type="text"
                                              placeholder="Enter subtask name"
                                              value={subtask.name}
                                              onChange={(e) => updateSubtask(selectedLevel, selectedTask, subtaskIndex, "name", e.target.value)}
                                              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Subtask Points *</label>
                                            <div className="relative">
                                              <input
                                                type="number"
                                                placeholder="Points"
                                                value={subtask.points}
                                                onChange={(e) => updateSubtask(selectedLevel, selectedTask, subtaskIndex, "points", e.target.value)}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 placeholder-gray-500 pr-12 text-sm sm:text-base"
                                                min="0"
                                                max={task.points}
                                                required
                                              />
                                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">pts</span>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                              Subtask Description *
                                            </label>
                                            <textarea
                                              value={subtask.description}
                                              onChange={(e) => updateSubtask(selectedLevel, selectedTask, subtaskIndex, "description", e.target.value)}
                                              rows={4}
                                              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none text-sm sm:text-base"
                                              placeholder="Describe the subtask..."
                                              required
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <label className="flex items-center text-sm font-semibold text-gray-700">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Start Date *
                                              </label>
                                              <input
                                                type="date"
                                                value={subtask.start_date}
                                                min={task.start_date}
                                                max={task.end_date}
                                                onChange={(e) => {
                                                  updateSubtask(selectedLevel, selectedTask, subtaskIndex, "start_date", e.target.value);
                                                  const newAvailableTypes = getAvailableTaskTypes(e.target.value, subtask.end_date);
                                                  if (!newAvailableTypes.some((type) => type.value === subtask.task_type)) {
                                                    updateSubtask(selectedLevel, selectedTask, subtaskIndex, "task_type", "");
                                                  }
                                                }}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 text-sm sm:text-base"
                                                required
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <label className="flex items-center text-sm font-semibold text-gray-700">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                End Date *
                                              </label>
                                              <input
                                                type="date"
                                                value={subtask.end_date}
                                                min={subtask.start_date || task.start_date}
                                                max={task.end_date}
                                                onChange={(e) => {
                                                  updateSubtask(selectedLevel, selectedTask, subtaskIndex, "end_date", e.target.value);
                                                  const newAvailableTypes = getAvailableTaskTypes(subtask.start_date, e.target.value);
                                                  if (!newAvailableTypes.some((type) => type.value === subtask.task_type)) {
                                                    updateSubtask(selectedLevel, selectedTask, subtaskIndex, "task_type", "");
                                                  }
                                                }}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 text-sm sm:text-base"
                                                required
                                              />
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                              <Clock className="w-4 h-4 mr-1" />
                                              Subtask Type
                                            </label>
                                            <Select
                                              options={availableSubtaskTypes}
                                              value={availableSubtaskTypes.find((option) => option.value === subtask.task_type) || null}
                                              onChange={(selectedOption) =>
                                                updateSubtask(
                                                  selectedLevel,
                                                  selectedTask,
                                                  subtaskIndex,
                                                  "task_type",
                                                  selectedOption ? selectedOption.value : "",
                                                )
                                              }
                                              placeholder={
                                                availableSubtaskTypes.length > 1 ? "Select subtask type" : "Set dates to unlock types"
                                              }
                                              isClearable
                                              isDisabled={availableSubtaskTypes.length <= 1}
                                              className="text-sm"
                                              classNamePrefix="select"
                                              formatOptionLabel={(option: any) => (
                                                <div className="flex items-center">
                                                  <span className="mr-2">{option.icon}</span>
                                                  {option.label}
                                                </div>
                                              )}
                                              styles={{
                                                control: (base, state) => ({
                                                  ...base,
                                                  backgroundColor: "white",
                                                  border: "1px solid rgb(209, 213, 219)",
                                                  borderRadius: "0.5rem",
                                                  padding: "0.25rem",
                                                  boxShadow: "none",
                                                  color: "rgb(17, 24, 39)",
                                                  opacity: state.isDisabled ? 0.5 : 1,
                                                  "&:hover": {
                                                    borderColor: "rgb(147, 51, 234)",
                                                  },
                                                  "&:focus-within": {
                                                    borderColor: "rgb(147, 51, 234)",
                                                    boxShadow: "0 0 0 4px rgba(147, 51, 234, 0.2)",
                                                  },
                                                }),
                                                menu: (base) => ({
                                                  ...base,
                                                  backgroundColor: "white",
                                                  border: "1px solid rgb(209, 213, 219)",
                                                  borderRadius: "0.5rem",
                                                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                                  zIndex: 9999,
                                                }),
                                                option: (base, { isFocused, isSelected }) => ({
                                                  ...base,
                                                  backgroundColor: isSelected
                                                    ? "rgb(147, 51, 234)"
                                                    : isFocused
                                                      ? "rgb(243, 244, 246)"
                                                      : "transparent",
                                                  color: isSelected ? "white" : "rgb(17, 24, 39)",
                                                  "&:active": {
                                                    backgroundColor: "rgb(147, 51, 234)",
                                                  },
                                                }),
                                                placeholder: (base) => ({
                                                  ...base,
                                                  color: "rgb(107, 114, 128)",
                                                }),
                                                singleValue: (base) => ({
                                                  ...base,
                                                  color: "rgb(17, 24, 39)",
                                                }),
                                                input: (base) => ({
                                                  ...base,
                                                  color: "rgb(17, 24, 39)",
                                                }),
                                              }}
                                            />
                                            {availableSubtaskTypes.length <= 1 && (
                                              <p className="text-xs text-gray-500">
                                                💡 Set a longer date range to unlock Daily (2+ days), Weekly (7+ days), or Once (28+ days) options
                                              </p>
                                            )}
                                          </div>
                                          <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                              <Clock className="w-4 h-4 mr-1" />
                                              Deadline Time
                                            </label>
                                            <input
                                              type="time"
                                              value={subtask.deadline_time}
                                              onChange={(e) => updateSubtask(selectedLevel, selectedTask, subtaskIndex, "deadline_time", e.target.value)}
                                              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-gray-900 text-sm sm:text-base"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      {/* Subtask Marking Criteria */}
                                      <div className="mt-6">
                                        <h4 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                                          <Award className="w-5 h-5 mr-2 text-amber-600" />
                                          Subtask Marking Criteria
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                                            <div className="flex items-center mb-3">
                                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                              </div>
                                              <label className="text-sm font-semibold text-emerald-800">Fully Completed</label>
                                            </div>
                                            <div className="relative">
                                              <input
                                                type="number"
                                                placeholder="Points"
                                                value={subtask.marking_criteria.fully_completed}
                                                onChange={(e) => updateSubtaskMarkingCriteria(selectedLevel, selectedTask, subtaskIndex, "fully_completed", Number(e.target.value) || 0)}
                                                className="w-full p-3 bg-white border border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 pr-12 text-sm sm:text-base"
                                                min="0"
                                                max={subtask.points}
                                                required
                                              />
                                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-700 font-medium text-sm">pts</span>
                                            </div>
                                          </div>
                                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                                            <div className="flex items-center mb-3">
                                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center mr-2">
                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                              </div>
                                              <label className="text-sm font-semibold text-amber-800">Partially Completed</label>
                                            </div>
                                            <div className="relative">
                                              <input
                                                type="number"
                                                placeholder="Points"
                                                value={subtask.marking_criteria.partially_completed}
                                                onChange={(e) => updateSubtaskMarkingCriteria(selectedLevel, selectedTask, subtaskIndex, "partially_completed", Number(e.target.value) || 0)}
                                                className="w-full p-3 bg-white border border-amber-200 rounded-lg focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-200 text-gray-900 pr-12 text-sm sm:text-base"
                                                min="0"
                                                max={subtask.points}
                                                required
                                              />
                                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-700 font-medium text-sm">pts</span>
                                            </div>
                                          </div>
                                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                                            <div className="flex items-center mb-3">
                                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                              </div>
                                              <label className="text-sm font-semibold text-red-800">Incomplete</label>
                                            </div>
                                            <div className="relative">
                                              <input
                                                type="number"
                                                placeholder="Points"
                                                value={subtask.marking_criteria.incomplete}
                                                onChange={(e) => updateSubtaskMarkingCriteria(selectedLevel, selectedTask, subtaskIndex, "incomplete", Number(e.target.value) || 0)}
                                                className="w-full p-3 bg-white border border-red-200 rounded-lg focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 text-gray-900 pr-12 text-sm sm:text-base"
                                                min="0"
                                                max={subtask.points}
                                                required
                                              />
                                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-700 font-medium text-sm">pts</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <CheckSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                                <p className="text-gray-600 text-sm sm:text-base">No subtasks added yet</p>
                                <p className="text-xs sm:text-sm text-gray-500">Break down complex tasks into smaller, manageable pieces</p>
                              </div>
                            )}
                          </div>
                          {/* Marking Criteria - Only show if no subtasks */}
                          {task.subtasks.length === 0 && (
                            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
                              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                                <Award className="w-5 h-5 mr-2 text-amber-600" />
                                Marking Criteria
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                                  <div className="flex items-center mb-3">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <label className="text-sm font-semibold text-emerald-800">Fully Completed</label>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      placeholder="Points"
                                      value={task.marking_criteria.fully_completed}
                                      onChange={(e) => updateMarkingCriteria(selectedLevel, selectedTask, "fully_completed", Number(e.target.value) || 0)}
                                      className="w-full p-3 bg-white border border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-gray-900 pr-12 text-sm sm:text-base"
                                      min="0"
                                      max={task.points}
                                      required
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-700 font-medium text-sm">pts</span>
                                  </div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                                  <div className="flex items-center mb-3">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center mr-2">
                                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <label className="text-sm font-semibold text-amber-800">Partially Completed</label>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      placeholder="Points"
                                      value={task.marking_criteria.partially_completed}
                                      onChange={(e) => updateMarkingCriteria(selectedLevel, selectedTask, "partially_completed", Number(e.target.value) || 0)}
                                      className="w-full p-3 bg-white border border-amber-200 rounded-lg focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-200 text-gray-900 pr-12 text-sm sm:text-base"
                                      min="0"
                                      max={task.points}
                                      required
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-700 font-medium text-sm">pts</span>
                                  </div>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                                  <div className="flex items-center mb-3">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <label className="text-sm font-semibold text-red-800">Incomplete</label>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      placeholder="Points"
                                      value={task.marking_criteria.incomplete}
                                      onChange={(e) => updateMarkingCriteria(selectedLevel, selectedTask, "incomplete", Number(e.target.value) || 0)}
                                      className="w-full p-3 bg-white border border-red-200 rounded-lg focus:ring-4 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 text-gray-900 pr-12 text-sm sm:text-base"
                                      min="0"
                                      max={task.points}
                                      required
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-700 font-medium text-sm">pts</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/superadmin/dashboard")}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold disabled:opacity-50 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      Create Leadership Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPageNew;