import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Crown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AdminRole {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  onClick: () => void;
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  const adminRoles: AdminRole[] = [
    {
      id: "superadmin",
      title: "Superadmin",
      description: "Full control of system configuration and global settings.",
      icon: <Crown className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-slate-700 to-gray-800",
      features: ["System Configuration", "Global Settings", "Security"],
      onClick: () => navigate("/superadminlogin"),
    },
    {
      id: "admin",
      title: "Admin",
      description: "Manage users, permissions, and administrative tasks.",
      icon: <Shield className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-yellow-500 to-amber-600",
      features: ["User Management", "System Settings", "Reports"],
      onClick: () => navigate("/adminlogin"),
    },
    {
      id: "user",
      title: "User",
      description: "View leaderboard, stats, and user analytics.",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-blue-600 to-indigo-600",
      features: ["Leaderboard", "User Oversight", "Analytics"],
      onClick: () => navigate("/studentlogin"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-white to-[#eaf0f8] flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Access</h1>
            <p className="text-sm text-gray-500">Choose your role to get started</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Welcome to the Admin Portal
            </h2>
            <p className="text-gray-600 mt-3 text-base sm:text-lg">
              Select the role that best fits your responsibility
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminRoles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="rounded-2xl shadow-md hover:shadow-lg transition duration-300 bg-white border border-gray-200 hover:border-gray-300 p-6">
                  <button
                    onClick={role.onClick}
                    className="w-full h-full text-left space-y-4"
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${role.color}`}>
                      {role.icon}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {role.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {role.description}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="text-sm text-gray-700 space-y-2 mt-4">
                      {role.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 text-sm text-blue-600 font-medium inline-flex items-center hover:underline">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;