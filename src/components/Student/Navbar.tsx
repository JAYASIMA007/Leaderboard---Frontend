import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.svg';
import sampleProfile from '../../assets/sampleprofile.svg';

interface StudentEvent {
  event_id: string;
  event_name: string;
}

interface NavbarProps {
  onEventSelect?: (eventId: string) => void; // Callback function to handle event selection
}

const Navbar: React.FC<NavbarProps> = ({ onEventSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [events, setEvents] = useState<StudentEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const fetchStudentEvents = async () => {
      try {
        const jwtToken = getJwtToken();
        if (!jwtToken) throw new Error("Authentication required. Please login again.");

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://leaderboard-backend-4uxl.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/student/get-tasks/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.success) {
          setEvents(data.events);
          if (data.events.length > 0) {
            // Check if there's a previously selected event in localStorage
            const storedEventId = localStorage.getItem("selectedEventId");
            
            // Verify that the stored event ID exists in the current events list
            const eventExists = storedEventId && data.events.some(
              (event: StudentEvent) => event.event_id === storedEventId
            );
            
            let eventIdToSelect: string;
            
            if (eventExists) {
              // Use the stored event ID if it exists in the current events
              eventIdToSelect = storedEventId;
            } else {
              // Use the first event and update localStorage
              eventIdToSelect = data.events[0].event_id;
              localStorage.setItem("selectedEventId", eventIdToSelect);
            }
            
            setSelectedEvent(eventIdToSelect);
            
            if (onEventSelect) {
              onEventSelect(eventIdToSelect);
            }
          }
        } else {
          throw new Error(data.error || "Failed to fetch events");
        }
      } catch (err) {
        console.error("Error fetching student events:", err);
      }
    };

    fetchStudentEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEvent(value);
    
    // Store the selected event ID in localStorage
    localStorage.setItem("selectedEventId", value);
    
    if (onEventSelect) {
      onEventSelect(value); // Call the callback function with the selected event ID
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('selectedEventId'); // Clear selected event on logout
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    navigate('/');
    toast.success('Logged out successfully');
    setShowMobileMenu(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    if (selectedEvent) {
      navigate(path, { state: { selectedEventId: selectedEvent } });
    } else {
      navigate(path); // fallback in case no event selected yet
    }
    setShowMobileMenu(false);
  };

  const navigationItems = [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/tasks', label: 'Task' },
    { path: '/student/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="text-white bg-transparent shadow-md backdrop-blur-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-full mx-4 sm:mx-6 lg:mx-10">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-shrink-0">
            <img src={logo} alt="Logo" className="h-8 mr-[8px] mt-[6px] sm:h-10 w-auto" />
          </div>
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center space-x-8 xl:space-x-16">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 xl:px-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive(item.path)
                    ? 'font-semibold border border-[#FFCC00] bg-[rgba(255,244,200,0.33)] shadow-[inset_-7px_-3px_7.8px_-1px_rgba(255,204,0,0.25),inset_6px_6px_6.5px_-1px_rgba(255,204,0,0.25),0px_8px_15px_-1px_rgba(0,0,0,0.13)]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:cursor-pointer'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full max-w-xs">
            <div className="flex items-center border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 transition">
              <select
                onChange={handleChange}
                value={selectedEvent}
                className="bg-transparent text-white px-4 py-2 w-full pr-8 outline-none appearance-none"
                style={{ backgroundColor: "transparent", color: "white" }}
              >
                <option value="" disabled>
                  Select an event
                </option>
                {events.map((event) => (
                  <option
                    key={event.event_id}
                    value={event.event_id}
                    style={{ backgroundColor: "#6b21a8" }}
                  >
                    {event.event_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-white">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-end space-x-2 sm:space-x-4">
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors ml-7"
              >
                <img
                  src={sampleProfile}
                  alt="Profile"
                  className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer rounded-full border-2 border-gray-200"
                />
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/student/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg"
          >
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                    ? 'font-semibold border border-[#FFCC00] bg-[rgba(255,244,200,0.33)] shadow-[inset_-7px_-3px_7.8px_-1px_rgba(255,204,0,0.25),inset_6px_6px_6.5px_-1px_rgba(255,204,0,0.25),0px_8px_15px_-1px_rgba(0,0,0,0.13)]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate('/student/profile');
                  }}
                  className="w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-lg"
                >
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;