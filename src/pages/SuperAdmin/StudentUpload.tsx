"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Upload, ArrowLeft, AlertCircle, CheckCircle, FileText, Download, X } from "lucide-react"

interface Student {
    name: string
    roll_no: string
    department: string
    year: string
    email: string
    admin_id: string;
}

interface UploadResult {
    message: string
    skipped: Array<{
        index: number
        reason: string
    }>
    email_failures: Array<{
        index: number
        email: string
        reason: string
    }>
    total_received: number
    uploaded: number
    skipped_count: number
    email_failure_count: number
}

const StudentUpload: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([])
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [result, setResult] = useState<UploadResult | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
            setError("Please select a CSV file")
            return
        }

        setFile(selectedFile)
        setError("")
        parseCSV(selectedFile)
    }

    const parseCSV = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string
                const lines = text.split("\n").filter((line) => line.trim())

                // Skip header row
                const dataLines = lines.slice(1)

                const parsedStudents: Student[] = dataLines
                    .map((line) => {
                        const [name, roll_no, department, year, email, admin_id] = line
                            .split(",")
                            .map((field) => field.trim().replace(/"/g, ""))
                        return { name, roll_no, department, year, email, admin_id }
                    })
                    .filter((student) => student.name || student.roll_no || student.email)

                setStudents(parsedStudents)
            } catch (err) {
                setError("Error parsing CSV file. Please check the format.")
            }
        }
        reader.readAsText(file)
    }

    const downloadTemplate = () => {
        const csvContent =
            "name,roll_no,department,year,email,admin_id\nJohn Doe,21CS001,CSE,III,john@example.com\nJane Smith,21IT002,IT,II,jane@example.com"
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "student_upload_template.csv"
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (students.length === 0) {
            setError("Please upload a CSV file with student data")
            return
        }

        const validStudents = students.filter(
            (s) => s.name.trim() && s.roll_no.trim() && s.department.trim() && s.year.trim() && s.email.trim() && s.admin_id.trim()
        );


        if (validStudents.length === 0) {
            setError("No valid student records found in the uploaded file")
            return
        }

        setLoading(true)
        setError("")
        setResult(null)

        try {
            const response = await axios.post("https://leaderboard-backend-4uxl.onrender.com/api/bulk_upload/", {
                students: validStudents,
            })

            setResult(response.data)

            // Clear form on success
            if (response.data.uploaded > 0) {
                setStudents([])
                setFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to upload students")
        } finally {
            setLoading(false)
        }
    }

    const resetUpload = () => {
        setFile(null)
        setStudents([])
        setResult(null)
        setError("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-5">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate("/superadmin/dashboard")}
                            className="flex items-center text-gray-600 hover:text-gray-900 mr-6 px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Student Bulk Upload
                                </h1>
                                <p className="text-sm text-gray-600">Upload multiple students from CSV file</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto p-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
                        <h2 className="text-xl font-semibold mb-2">CSV File Upload</h2>
                        <p className="text-emerald-100">
                            Upload a CSV file containing student information to add multiple students at once
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-center shadow-sm">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-red-800 font-medium">Error</p>
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Result Display */}
                        {result && (
                            <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
                                <div className="flex items-center mb-4">
                                    <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                                    <h3 className="text-lg font-semibold text-emerald-800">Upload Complete!</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-4 bg-white/60 rounded-lg">
                                        <div className="text-3xl font-bold text-emerald-600">{result.uploaded}</div>
                                        <div className="text-sm text-emerald-700 font-medium">Successfully Uploaded</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/60 rounded-lg">
                                        <div className="text-3xl font-bold text-amber-600">{result.skipped_count}</div>
                                        <div className="text-sm text-amber-700 font-medium">Skipped Records</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/60 rounded-lg">
                                        <div className="text-3xl font-bold text-blue-600">{result.total_received}</div>
                                        <div className="text-sm text-blue-700 font-medium">Total Processed</div>
                                    </div>
                                </div>
                                {result.skipped.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Skipped Records Details:
                                        </h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto bg-amber-50 p-3 rounded-lg">
                                            {result.skipped.map((skip, index) => (
                                                <div
                                                    key={index}
                                                    className="text-sm text-amber-800 bg-white/50 p-2 rounded border-l-4 border-amber-400"
                                                >
                                                    <strong>Row {skip.index}:</strong> {skip.reason}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={resetUpload}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-all duration-200"
                                    >
                                        Upload Another File
                                    </button>
                                    <button
                                        onClick={() => navigate("/superadmin/dashboard")}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}

                        {!result && (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Template Download Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                                                <FileText className="w-5 h-5 mr-2" />
                                                Download CSV Template
                                            </h3>
                                            <p className="text-blue-700 text-sm">
                                                Download the template file with the correct format:{" "}
                                                <strong>name, roll_no, department, year, email ,admin_id</strong>
                                            </p>
                                            <p className="text-blue-600 text-xs mt-1">
                                                Make sure your CSV file follows this exact column order for successful upload.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={downloadTemplate}
                                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Template
                                        </button>
                                    </div>
                                </div>

                                {/* File Upload Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Upload CSV File</h3>

                                    {/* File Drop Zone */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${dragActive
                                            ? "border-emerald-500 bg-emerald-50"
                                            : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50"
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                                <Upload className="w-10 h-10 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-semibold text-gray-900 mb-2">
                                                    {file ? file.name : "Drop your CSV file here"}
                                                </p>
                                                <p className="text-gray-600 mb-4">
                                                    {file ? "File selected successfully" : "or click to browse and select a file"}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                                >
                                                    {file ? "Change File" : "Select CSV File"}
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-500 space-y-1">
                                                <p>
                                                    <strong>Supported format:</strong> CSV files only
                                                </p>
                                                <p>
                                                    <strong>Required columns:</strong> name, roll_no, department, year, email ,  admin_id
                                                </p>
                                                <p>
                                                    <strong>Max file size:</strong> 10MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Info Display */}
                                    {file && (
                                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                            <div className="flex items-center">
                                                <FileText className="w-6 h-6 text-emerald-600 mr-3" />
                                                <div>
                                                    <p className="font-semibold text-emerald-800">{file.name}</p>
                                                    <p className="text-sm text-emerald-600">
                                                        {students.length > 0 ? `${students.length} students detected` : "Processing file..."}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={resetUpload}
                                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all duration-200"
                                                title="Remove file"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/superadmin/dashboard")}
                                        className="flex-1 py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !file || students.length === 0}
                                        className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 font-semibold disabled:opacity-50 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                Uploading Students...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 mr-3" />
                                                Upload {students.length} Students
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentUpload
