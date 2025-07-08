
"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { UserPlus, Calendar, LogOut, User, List, Trophy } from "lucide-react"

interface ActionButton {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  const actionButtons: ActionButton[] = [
    {
      id: "createadmin",
      title: "Create Admin",
      description: "Add new administrators to the system",
      icon: <UserPlus className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: "from-blue-500 to-blue-600",
      onClick: () => {
        navigate("/superadmin/createadmin")
      },
    },
    {
      id: "createevent",
      title: "Create Event",
      description: "Schedule and manage new events",
      icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: "from-green-500 to-green-600",
      onClick: () => {
        navigate("/superadmin/create-event")
      },
    },
    {
      id: "eventlisting",
      title: "Event Listing",
      description: "View and manage all scheduled events",
      icon: <List className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: "from-indigo-500 to-indigo-600",
      onClick: () => {
        navigate("/superadmin/eventlisting")
      },
    },
    {
      id: "eventsleaderboard",
      title: "Events Leaderboard",
      description: "View competition rankings and scores",
      icon: <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: "from-yellow-500 to-yellow-600",
      onClick: () => {
        navigate("/superadmin/leaderboard")
      },
    },
  ]

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border-b border-purple-200/50 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center w-full sm:w-auto">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4 transform hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-purple-600 opacity-30 animate-pulse"></div>
                <User className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight truncate">
                  Super Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium truncate">
                  Manage your administrative tasks with ease
                </p>
              </div>
            </div>
            <div className="flex items-center w-full sm:w-auto justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center px-3 sm:px-4 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50/80 bg-white/80 rounded-lg text-xs sm:text-sm md:text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Welcome Back!</h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Choose an action below to manage your administrative tasks
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {actionButtons.map((button) => (
            <div
              key={button.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 overflow-hidden bg-white rounded-xl w-full"
              onClick={button.onClick}
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${button.color} p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/10 rounded-full -mr-8 sm:-mr-10 lg:-mr-12 -mt-8 sm:-mt-10 lg:-mt-12" />
                <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 rounded-full -ml-6 sm:-ml-8 lg:-ml-10 -mb-6 sm:-mb-8 lg:-mb-10" />
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4">{button.icon}</div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">{button.title}</h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 sm:p-5 lg:p-6 text-center">
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 lg:mb-6 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center">
                  {button.description}
                </p>
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors duration-300 group-hover:bg-slate-900 text-sm sm:text-base">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
