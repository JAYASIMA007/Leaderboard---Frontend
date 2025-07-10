import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import emailIcon from "../../assets/mail.svg";
import mail from "../../assets/mail.svg";

// New image imports
import snsLogo from '../../assets/logo.svg';
import loginScattered11 from "../../assets/LoginImg1.png";
import loginScattered22 from "../../assets/LoginImg2.png";
import loginScattered33 from "../../assets/LoginImg3.png";

const StudentForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email input, 2: Check email
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/Student/send-reset-link/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid JSON or an error page');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      // Show the check email screen
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/Student/send-reset-link/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid JSON or an error page');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="relative bg-white shadow-lg rounded-2xl flex flex-col lg:flex-row max-w-6xl w-full p-4 sm:p-8 overflow-hidden">
        {/* Form Section */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 lg:p-20">
          {step === 1 && (
            <>
                <div className="flex justify-center items-center mb-3">
                <img
                  src={snsLogo}
                  className="w-auto h-12 sm:h-16"
                  alt="SNS Institutions Logo"
                />
                </div>

                <div className="text-center mb-6 sm:mb-8">
                <p className="text-[#fc0] font-medium mb-2 text-sm sm:text-base">Login</p>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#111933]">Forgot Password?</h1>
                <p className="text-gray-500 text-sm px-2">Please enter your email to send a password reset mail</p>
                </div>

              <form onSubmit={handleSendLink}>
                <div className="mb-6">
                  <div className="relative">
                    <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                      <img src={emailIcon || "/placeholder.svg"} alt="Email" className="h-4 w-4 sm:h-5 sm:w-5" />
                      <input
                        type="email"
                        placeholder="Enter your mail ID"
                        className="flex-1 focus:outline-none text-sm  placeholder-gray-400 ml-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1 ml-2">{error}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#fc0] font-semibold text-[#111933] py-2 rounded-lg hover:shadow-md transition-colors"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
                
               
              </form>
            </>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img
                  src={snsLogo}
                  className="w-auto mb-8"
                  alt="SNS Institutions Logo"
                />
              </div>
              
              <div className="flex justify-center mb-6">
                <img src={mail || "/placeholder.svg"} alt="Check email" className="h-24 w-24" />
              </div>

              <h1 className="text-2xl font-bold mb-2 text-[#111933]">Check your email to reset your password</h1>

              <p className="text-gray-500 text-sm mb-8">We have sent a password recovery instructions to your email</p>

              <button
                onClick={() => navigate("/studentlogin")}
                className="w-full bg-[#fc0] font-semibold text-[#111933] py-2 rounded-lg hover:shadow-md transition-colors mb-4"
              >
                Back to Login
              </button>

              <p className="text-sm text-gray-500">
                Didn't receive the mail?{" "}
                <button
                  onClick={handleResendLink}
                  disabled={isLoading}
                  className="text-[#fc0] hover:underline font-medium"
                >
                  Click to resend
                </button>
              </p>
            </div>
          )}
        </div>

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

export default StudentForgotPassword;