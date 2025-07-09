import type React from "react";
import { useState } from "react";
import { BarChart3, LogOut, Menu, Shield as ShieldUser, Sparkles } from "lucide-react";
import Overview from "../../components/Admin/Overview";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Utility function to get a cookie by name
  const getCookie = (name: string): string => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "Admin";
    return "Admin";
  };

  // Retrieve admin name from cookies
  const username = getCookie("admin_name");

  const clearCookiesAndSession = () => {
    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    // Clear session storage
    sessionStorage.clear();
    // Clear local storage (optional, depending on your use case)
    localStorage.clear();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      clearCookiesAndSession();
      navigate("/");
    }
  };

  const renderTopNav = () => (
    <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-">
          {/* Left Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-black/20 to-black/30 rounded-xl flex items-center justify-center shadow-md border border-white/20">
                  <ShieldUser className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>

              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">
                  Admin Dashboard
                </h1>
                <p className="text-white/90 text-sm sm:text-base font-medium">
                  Student Progress & Points Management
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-md border border-yellow-300/50"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className=" sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Sidebar */}
          <div className="lg:hidden fixed top-0 left-0 w-64 sm:w-80 h-full bg-gradient-to-b from-yellow-500 to-amber-600 z-50 shadow-2xl transition-transform duration-300">
            <div className="p-4 sm:p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shadow-md">
                    <ShieldUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h2>
                    <p className="text-white/90 text-xs sm:text-sm">Management System</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-300"
                  aria-label="Close sidebar"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-2 sm:space-y-3">
                {[
                  { id: "overview", label: "Overview", icon: BarChart3 },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 sm:px-4 sm:py-4 rounded-lg transition-all duration-300 ${activeView === item.id
                      ? "bg-white text-yellow-600 shadow-md transform scale-105"
                      : "text-white hover:bg-white/20 hover:scale-105"
                      }`}
                  >
                    <div className={`p-2 rounded-md ${activeView === item.id ? "bg-yellow-100" : "bg-white/20"}`}>
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                  <p className="text-white/90 text-xs sm:text-sm text-center">Admin Dashboard v2.0</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderOverview = () => {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-25">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, rgba(217, 119, 6, 0.15) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        {/* Content Container */}
        <div className="relative px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-white/80 to-yellow-100/30 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-yellow-200/50 hover:shadow-3xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                      Welcome back, {username}!
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium mt-1">
                      Here's what's happening with your Users today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Content */}
          <div className="mt-4 sm:mt-6 lg:mt-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <Overview />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {renderTopNav()}
      <div className="flex-grow">{activeView === "overview" && renderOverview()}</div>
    </div>
  );
};

export default AdminDashboard;