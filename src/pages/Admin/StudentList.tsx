import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"
import { User, Building2, Hash, Mail, Loader2, AlertCircle, Users, GraduationCap, Search, Filter, Download, Star, Award } from 'lucide-react'

interface Student {
  _id: string
  name?: string | null
  student_id?: string | null
  department?: string | null
  email?: string | null
  year?: number | null
}

const StudentList: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"registered" | "non-logged-in">("registered")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = Cookies.get("admin_token")
        if (!token) {
          throw new Error("JWT token not found in cookies")
        }
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/get_students_details/${event_id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
        setStudents(response.data.students)
        setLoading(false)
      } catch (error: any) {
        console.error("Error fetching students:", error.response?.data || error.message)
        setError(error.response?.data?.error || error.message)
        setLoading(false)
      }
    }

    if (event_id) {
      fetchStudents()
    }
  }, [event_id])

  // Split students into complete and non-logged-in users
  const completeStudents = students.filter(
    (student) =>
      student.name != null &&
      student.student_id != null &&
      student.department != null &&
      student.email != null
  )

  const nonLoggedInUsers = students.filter(
    (student) =>
      student.email != null &&
      (student.name == null || student.student_id == null || student.department == null)
  )

  // Get unique departments from complete students
  const departments = Array.from(new Set(completeStudents.map((student) => student.department)))

  // Filter complete students
  const filteredCompleteStudents = completeStudents.filter((student) => {
    const name = student.name?.toLowerCase() || ""
    const id = student.student_id?.toLowerCase() || ""
    const email = student.email?.toLowerCase() || ""
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      id.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === "all" || student.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  // Filter non-logged-in users
  const filteredNonLoggedInUsers = nonLoggedInUsers.filter((student) => {
    const email = student.email?.toLowerCase() || ""
    return email.includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-yellow-200 rounded-full animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin text-yellow-600 absolute top-4 left-4" />
          </div>
          <p className="text-gray-700 font-semibold mt-6 text-lg">Loading Users...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex justify-center items-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-6 shadow-2xl">
              <GraduationCap className="h-10 w-10 text-black" />
            </div>
            <h1 className="text-3xl h-20 sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Members Directory
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl mb-6 max-w-2xl mx-auto">
              Comprehensive overview of event participants and their academic details
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-yellow-400">
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-semibold">{filteredCompleteStudents.length} Members</span>
              </div>
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Building2 className="h-5 w-5 mr-2" />
                <span className="font-semibold">{departments.length} Departments</span>
              </div>
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Award className="h-5 w-5 mr-2" />
                <span className="font-semibold">{filteredNonLoggedInUsers.length} Non-Logged-In Members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="relative container mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, register number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all bg-white/50"
                aria-label="Search students by name, register number, or email"
              />
            </div>
            <div className="relative w-full lg:w-auto">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full lg:w-65 pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all bg-white/50 appearance-none"
                aria-label="Filter students by department"
              >
                <option value="all">All Departments</option>
                {departments
                  .filter((dept): dept is string => dept !== null && dept !== undefined)
                  .map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="relative container mx-auto px-4 sm:px-6 mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("registered")}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              activeTab === "registered"
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
          >
            Assigned Members
          </button>
          {nonLoggedInUsers.length > 0 && (
            <button
              onClick={() => setActiveTab("non-logged-in")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                activeTab === "non-logged-in"
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                  : "bg-white/90 text-gray-700 hover:bg-white"
              }`}
            >
              Non-Logged-In Members
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="relative container mx-auto px-4 sm:px-6 pb-16">
        {activeTab === "registered" ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Assigned Members</h3>
            </div>
            {filteredCompleteStudents.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full mb-8 shadow-lg">
                  <Users className="h-12 w-12 text-yellow-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No Assigned Members Found</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {searchTerm || selectedDepartment !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "No users with complete details have registered for this event yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompleteStudents.map((student, index) => (
                  <div
                    key={student._id}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-yellow-300/50 transform hover:-translate-y-2"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    {/* Card Header */}
                    <div className="relative bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-6 text-black overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12"></div>
                      <div className="relative flex items-center">
                        <div className="w-14 h-14 bg-black/20 rounded-full flex items-center justify-center shadow-lg">
                          <User className="h-7 w-7 text-black" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h2 className="text-xl font-bold truncate">{student.name}</h2>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-black/70 mr-1" />
                            <p className="text-black/80 text-sm font-medium">User</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center group-hover:text-yellow-600 transition-colors duration-300">
                          <div className="w-11 h-11 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                            <Hash className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Register No.</p>
                            <p className="text-gray-900 font-bold text-sm">{student.student_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center group-hover:text-yellow-600 transition-colors duration-300">
                          <div className="w-11 h-11 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Department</p>
                            <p className="text-gray-900 font-bold text-sm">{student.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center group-hover:text-yellow-600 transition-colors duration-300">
                          <div className="w-11 h-11 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                            <Mail className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</p>
                            <p className="text-gray-900 font-bold text-sm truncate">{student.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Non-Logged-In Members</h3>
            </div>
            {filteredNonLoggedInUsers.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full mb-8 shadow-lg">
                  <Mail className="h-12 w-12 text-yellow-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No Non-Logged-In Members Found</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {searchTerm ? "Try adjusting your search criteria" : "No non-logged-in members with only email details found"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNonLoggedInUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-yellow-300/50 transform hover:-translate-y-2"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    <div className="relative bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-6 text-black overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12"></div>
                      <div className="relative flex items-center">
                        <div className="w-14 h-14 bg-black/20 rounded-full flex items-center justify-center shadow-lg">
                          <Mail className="h-7 w-7 text-black" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h2 className="text-xl font-bold truncate">Email</h2>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-black/70 mr-1" />
                            <p className="text-black/80 text-sm font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default StudentList