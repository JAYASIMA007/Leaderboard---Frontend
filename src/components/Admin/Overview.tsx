import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Types (based on backend structure)
interface Task {
  task_id: string;
  task_name: string;
  description: string;
  [key: string]: any;
}

interface Level {
  level_id: string;
  level_name: string;
  tasks: Task[];
}

interface Event {
  _id: string;
  event_name: string;
  assigned_to: { name: string; admin_id: string }[];
  levels: Level[];
  created_at: string;
  updated_at: string;
  has_recurring_tasks: boolean;
}

interface Task {
  task_id: string;
  task_name: string;
  description: string;
  total_points: number;
  deadline: string;
  deadline_time: string;
  full_deadline: string;
  frequency: string;
  start_date: string;
  end_date: string;
  marking_criteria: {
    fully_completed: number;
    partially_completed: number;
    incomplete: number;
  };
  last_updated: string | null;
  next_update_due: string | null;
  task_status: string;
  subtasks: any[];
}

const Overview: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = Cookies.get("admin_token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.post<{ events: Event[] }>(
          "https://leaderboard-backend-4uxl.onrender.com/api/admin/get_events/",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        console.log("API response:", response.data);
        setEvents(response.data.events || []);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.response?.data?.error || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCardClick = (eventId: string) => {
    navigate(`/tasks/${eventId}`);
  };

  if (loading) return <div className="text-center py-10">Loading events...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 min-h-screen">
      <h1 className="text-4xl h-15 font-bold bg-gradient-to-r from-black via-yellow-600 to-black bg-clip-text text-transparent mb-10 tracking-tight text-center">
        My Events
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/90 rounded-2xl shadow-lg border border-yellow-200">
            <p className="text-lg font-medium text-gray-800">No events found.</p>
          </div>
        ) : (
          events.map((event) => {
            const eventName = event.event_name || "Untitled Event";

            return (
              <div
                key={event._id}
                onClick={() => handleCardClick(event._id)}
                className="relative bg-white/95 rounded-2xl p-6 border border-yellow-100 shadow-xl cursor-pointer overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-yellow-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/30 via-white to-yellow-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <h2 className="relative text-xl font-semibold text-black mb-3 tracking-tight">
                  {eventName}
                </h2>
                <div className="relative flex justify-between items-center">
                  <div className="h-1 w-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Overview;