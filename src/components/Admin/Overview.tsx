import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../Pagination";
import { Layers, Calendar, UserX } from "lucide-react";

// Types (based on backend structure)
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

interface Level {
  level_id: string;
  level_name: string;
  total_points: number;
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

const Overview: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize currentPage from URL query parameter or default to 1
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 9; // Show 6 events per page

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
          "http://13.54.119.187:8000/api/admin/get_events/",
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
        setError("No Events Allocated to this Admin");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Update URL query parameter when currentPage changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("page", currentPage.toString());
    navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
  }, [currentPage, navigate, location.pathname]);

  const handleCardClick = (eventId: string) => {
    navigate(`/tasks/${eventId}`);
  };

  // Calculate paginated events
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  if (loading) return <div className="text-center py-12 text-xl sm:text-2xl lg:text-3xl font-medium text-gray-800">Loading events...</div>;
  if (error) return (
    <div className="col-span-full flex flex-col items-center py-6 sm:py-20 lg:py-6 bg-gradient-to-br from-white/90 to-yellow-100/30 rounded-3xl shadow-xl border border-yellow-300/50 backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
      <UserX className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-500 mb-4 sm:mb-6" />
      <p className="text-xl sm:text-2xl lg:text-32xl font-medium text-gray-800">{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 min-h-screen">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-black via-yellow-600 to-black bg-clip-text text-transparent mb-8 sm:mb-10 lg:mb-12 tracking-tight text-center">
        My Events
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {currentEvents.length === 0 ? (
          <div className="col-span-full text-center py-14 bg-white/95 rounded-3xl shadow-xl border border-yellow-200">
            <p className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-800">No events found.</p>
          </div>
        ) : (
          currentEvents.map((event) => {
            const eventName = event.event_name || "Untitled Event";
            const levelCount = event.levels.length;

            return (
              <div
                key={event._id}
                onClick={() => handleCardClick(event._id)}
                className="relative bg-white/95 rounded-3xl p-6 sm:p-8 lg:p-10 border border-yellow-200 shadow-xl cursor-pointer overflow-hidden transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl hover:border-yellow-400 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-white to-yellow-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center space-x-2 mb-2 sm:mb-3">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  <h2 className="text-xl sm:text-1xl lg:text-1xl font-semibold text-gray-900 tracking-tight">
                    {eventName}
                  </h2>
                </div>
                <div className="relative flex items-center space-x-2 mb-4 sm:mb-5">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  <span className="text-sm sm:text-base font-medium text-gray-800">
                    {levelCount} Level{levelCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="relative flex justify-between items-center">
                  <div className="h-1 w-24 sm:w-28 lg:w-32 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:brightness-125" />

                </div>
              </div>
            );
          })
        )}
      </div>
      <Pagination
        totalItems={events.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Overview;