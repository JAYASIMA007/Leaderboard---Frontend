
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import mail from '../../assets/mail.svg';
import password from '../../assets/password.svg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../components/Loader';

//img imports
import snsLogo from '../../assets/Logo.svg';
import loginScattered11 from "../../assets/LoginImg1.png";
import loginScattered22 from "../../assets/LoginImg2.png";
import loginScattered33 from "../../assets/LoginImg3.png";

const StudentLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/student/login/`,
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true, // Important for cookie
        }
      );

      if (response.status === 200) {
        const { name, email } = response.data;

        // Save to localStorage
        localStorage.setItem('name', name);
        localStorage.setItem('email', email);

        // Optional: pass to context or parent
        onLogin();

        // Navigate
        navigate('/student/dashboard');
        toast.success('Login successful!');
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || 'An error occurred during login.'
      );
      toast.error('Wrong username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {loading && <Loader message="Logging you in..." />}
      <ToastContainer />
      {/* <h1 className='justify-start'>SNS ASSESSMENT PORTAL</h1> */}
      <div className="relative bg-white shadow-lg rounded-2xl flex flex-col lg:flex-row max-w-6xl w-full overflow-hidden">
        {/* Form Section */}
        <form
              onSubmit={handleLogin}
              onKeyDown={handleKeyDown}
              className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 md:p-12 lg:p-20"
            >
              <div className="w-full max-w-md flex flex-col items-center">
              <img
                src={snsLogo}
                className="w-auto mb-3 h-12 sm:h-16"
                alt="SNS Institutions Logo"
              />
               <h1 className="text-sm sm:text-md font-medium text-center mb-2 text-[#fc0]">
                Login
              </h1>
              <h1 className="text-2xl sm:text-3xl font-medium text-center mb-2 text-[#111933]">
                Welcome Back!
              </h1>
              <p className="text-sm sm:text-md text-center text-[#8e8e8e] mb-6 sm:mb-8 px-2">
                Please  enter your login credentials to access your account
              </p>

              <div className="relative mb-4 w-full">
                <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                <img alt='mail' src={mail} className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                  placeholder="test@example.com"
                  required
                />
                </div>
              </div>

              <div className="relative mb-1 w-full">
                <div className="flex items-center border rounded-lg p-3 shadow-sm">
                <img alt='password' src={password} className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                  <FaEye className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                  <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
                </div>
                <div className="flex justify-end mt-1">
                <Link 
                  to="/studentforgotpassword" 
                  className="text-sm hover:underline"
                >
                  Forgot Password?
                </Link>
                </div>
              </div>

              <div className="flex flex-col items-center w-full">
                <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fc0] font-semibold py-3 rounded-lg shadow hover:shadow-md transition-all mt-5"
                >
                {loading ? "Logging in..." : "Login"}
                </button>
                
                {/* <p className="text-xs text-gray-500 mt-3 text-center">
                Don't have an account?{" "}
                <Link 
                  to="/studentsignup" 
                  className="text-[#fc0] hover:underline font-medium"
                >
                  Sign up here
                </Link>
                </p> */}
                
                <p className="text-xs text-gray-500 mt-3 text-center px-2">
                By clicking login you are accepting to all terms and conditions laid by SNS institutions
                </p>
              </div>
              </div>
            </form>

        {/* Image Slideshow Section */}
        <div className="hidden lg:flex flex-1 justify-center items-center flex-col p-8">
          <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-lg">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
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

export default StudentLogin;