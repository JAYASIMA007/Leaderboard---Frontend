"use client"

import type React from "react"
import { useState } from "react"
import { Users, BarChart3, LogOut, Menu, ShieldIcon as ShieldUser, Bell, Settings } from "lucide-react"
import Overview from "../../components/Admin/Overview"
import { useNavigate } from "react-router-dom"

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Utility function to get a cookie by name
  const getCookie = (name: string): string => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "Admin"
    return "Admin"
  }

  // Retrieve admin name from cookies
  const username = getCookie("admin_name")

  const clearCookiesAndSession = () => {
    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
    // Clear session storage
    sessionStorage.clear()
    // Clear local storage (optional, depending on your use case)
    localStorage.clear()
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      clearCookiesAndSession()
      navigate("/")
    }
  }

  const renderTopNav = () => (
    <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <div className="relative px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 rounded-xl text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-black/20 to-black/30 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
                  <ShieldUser className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>

              <div className="hidden sm:block">
                <h1 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">Admin Dashboard</h1>
                <p className="text-white/80 text-sm lg:text-base font-medium">Student Progress & Points Management</p>
              </div>
            </div>
          </div>



          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-xl text-sm lg:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Logout</span>
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
          ></div>

          {/* Sidebar */}
          <div className="lg:hidden fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-yellow-500 to-amber-600 z-50 shadow-2xl">
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShieldUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                    <p className="text-white/80 text-sm">Management System</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-3">
                {[
                  { id: "overview", label: "Overview", icon: BarChart3 },
                  { id: "students", label: "Students", icon: Users },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                      activeView === item.id
                        ? "bg-white text-yellow-600 shadow-lg transform scale-105"
                        : "text-white hover:bg-white/20 hover:scale-105"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeView === item.id ? "bg-yellow-100" : "bg-white/20"}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-lg">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white/80 text-sm text-center">Admin Dashboard v2.0</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderOverview = () => {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, rgba(217, 119, 6, 0.1) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        {/* Content Container */}
        <div className="relative">
          {/* Header Section */}
          <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome back, {username}!</h2>
                    <p className="text-gray-600 text-lg">Here's what's happening with your Users today.</p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2 rounded-xl font-semibold shadow-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>System Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Content */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <Overview />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {renderTopNav()}
      <div className="flex-grow">{activeView === "overview" && renderOverview()}</div>
    </div>
  )
}

export default AdminDashboard 