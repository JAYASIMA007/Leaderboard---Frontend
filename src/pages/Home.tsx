"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Users, Crown, ArrowRight, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface ApiResponse {
  message: string
}

interface AdminRole {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  features: string[]
  onClick: () => void
}

const Home: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://leaderboard-backend-4uxl.onrender.com/api/home/");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setMessage(data.message);
      } catch (err) {
        console.error("Error fetching backend:", err);
        setError("Failed to connect to the server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const adminRoles: AdminRole[] = [
    {
      id: "admin",
      title: "Admin",
      description: "Manage overall system administration and user permissions.",
      icon: <Shield className="w-8 h-8" />,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      features: ["User Management", "System Settings", "Reports"],
      onClick: () => navigate("/adminlogin"),
    },
    {
      id: "Student",
      title: "User",
      description: "View leaderboard and personal analytics.",
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      features: ["Leaderboard", "User Oversight", "Analytics"],
      onClick: () => navigate("/studentlogin"),
    },
    {
      id: "superadmin",
      title: "Superadmin",
      description: "Access all superadmin controls, settings, and system configuration.",
      icon: <Crown className="w-8 h-8" />,
      color: "from-gray-600 to-gray-700",
      bgColor: "bg-gray-50",
      features: ["System Configuration", "Global Settings", "Security"],
      onClick: () => navigate("/superadminlogin"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-12 w-96 mx-auto mb-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-64 mx-auto bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-lg shadow-lg p-6">
                <div className="h-8 w-8 bg-gray-200 rounded-full mb-4 animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Professional gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/50 via-white/30 to-purple-100/50" />

      {/* Enhanced grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99,102,241,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Overall Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your roles and permissions</p>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative min-h-screen pt-15">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Welcome section */}
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Monitor, Manage, and Evaluate Efficiently
            </h2>
            <p className="text-gray-600">
              Select your administrative role to access the portal
            </p>
          </motion.div>

          {/* Role selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {adminRoles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 ${role.bgColor} rounded-2xl transform transition-transform duration-300 group-hover:scale-[1.02] opacity-25`} />
                <button
                  onClick={role.onClick}
                  className="relative w-full h-full p-8 rounded-2xl backdrop-blur-[12px] backdrop-saturate-[180%] bg-white/10 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:bg-white/20 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center text-2xl text-white mb-6 transform transition-transform duration-300 group-hover:scale-110`}>
                    {role.icon}
                  </div>

                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {role.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 h-12">
                      {role.description}
                    </p>

                    <ul className="space-y-3 mb-6">
                      {role.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <ArrowRight className="text-xs flex-shrink-0" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${role.color} bg-clip-text text-transparent transform transition-all duration-300 group-hover:translate-x-1`}>
                      Access Dashboard
                      <ArrowRight className="text-xs" />
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
