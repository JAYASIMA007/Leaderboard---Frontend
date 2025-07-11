import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

import snsLogo from '../../assets/logo.svg';
import loginScattered11 from "../../assets/LoginImg1.png";
import loginScattered22 from "../../assets/LoginImg2.png";
import loginScattered33 from "../../assets/LoginImg3.png";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigate = useNavigate();
  const images = [loginScattered11, loginScattered22, loginScattered33];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setCurrentImageIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
      }
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [isTransitioning, images.length]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post("http://localhost:8000/api/admin/signin/", {
        email,
        password,
      });

      const { jwt, email: returnedEmail } = response.data;
      const admin_id = response.data.admin_id || response.data._id || ""; // adjust based on backend response
      const name = response.data.name || "Admin"; // fallback

      Cookies.set("admin_email", returnedEmail);
      Cookies.set("admin_id", admin_id);
      Cookies.set("admin_name", name);
      Cookies.set("admin_token", jwt); // optional if you're securing routes

      console.log("Cookies Set:", returnedEmail, admin_id, name);

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);

    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: "Login failed. Please try again later." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "email") {
      setEmail(value);
      if (errors.email) {
        const { email, ...rest } = errors;
        setErrors(rest);
      }
    } else {
      setPassword(value);
      if (errors.password) {
        const { password, ...rest } = errors;
        setErrors(rest);
      }
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Login Successful!</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-4">Redirecting to admin dashboard...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="relative bg-white shadow-lg rounded-2xl flex flex-col lg:flex-row max-w-6xl lg:w-full overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 md:p-12 lg:p-20">
          <div className="w-full max-w-md flex flex-col items-center">
            <img src={snsLogo} className="w-auto mb-3 h-12 sm:h-16" alt="SNS Institutions Logo" />
            <h1 className="text-sm sm:text-md font-medium text-center mb-2 text-[#fc0]">Admin Login</h1>
            <h1 className="text-2xl sm:text-3xl font-medium text-center mb-2 text-[#111933]">Welcome Admin!</h1>
            <p className="text-sm sm:text-md text-center text-[#8e8e8e] mb-6 sm:mb-8 px-2">
              Please enter your admin credentials to access the dashboard
            </p>

            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center w-full">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="relative mb-4 w-full">
              <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="admin@sns.edu"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                  required
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative mb-1 w-full">
              <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <Eye className="h-4 w-4 sm:h-5 sm:w-5" /> : <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end mt-1 w-full">
              <button
                type="button"
                className="text-sm hover:underline"
                onClick={() => navigate("/admin/forgot-password")}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex flex-col items-center w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fc0] font-semibold py-3 rounded-lg shadow hover:shadow-md transition-all mt-5"
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center px-2">
                By clicking login you are accepting to all terms and conditions laid by SNS institutions
              </p>
            </div>
          </div>
        </form>

        <div className="hidden lg:flex flex-1 justify-center items-center flex-col p-8">
          <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-lg">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className="absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out"
                style={{
                  opacity: currentImageIndex === index ? 1 : 0,
                  transform: `scale(${currentImageIndex === index ? 1 : 1.05})`,
                  zIndex: currentImageIndex === index ? 1 : 0
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;