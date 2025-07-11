import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Image imports
import emailIcon from '../../assets/mail.svg';
import mail from '../../assets/mail.svg';
import snsLogo from '../../assets/logo.svg';
import loginScattered11 from '../../assets/LoginImg1.png';
import loginScattered22 from '../../assets/LoginImg2.png';
import loginScattered33 from '../../assets/LoginImg3.png';

const AdminForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(localStorage.getItem('resetEmail') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Email input, 2: Check email, 3: Reset password
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const images = [loginScattered11, loginScattered22, loginScattered33];

  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  // Log the current route for debugging
  useEffect(() => {
    console.log('Current route:', location.pathname, 'Token:', token, 'Email:', email);
  }, [location.pathname, token, email]);

  // Validate reset token on page load if present
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        console.log('Attempting to validate token:', token);
        if (!token || token === 'None' || token.trim() === '') {
          console.log('Invalid token detected:', token);
          setError('Invalid reset link. Please request a new one.');
          setStep(1);
          return;
        }
        try {
          setIsLoading(true);
          console.log('Sending request to /api/admin/validate-reset-token/');
          const response = await fetch(`https://leaderboard-backend-4uxl.onrender.com/api/admin/validate-reset-token/?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('Response status:', response.status);
          const text = await response.text();
          console.log('Response text:', text);
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Server returned invalid JSON');
          }

          if (response.status === 404) {
            console.log('Token validation failed: 404');
            setError('Invalid or expired reset link. Please request a new one.');
            setStep(1);
            return;
          } else if (!response.ok) {
            console.error('Token validation error:', data.error);
            throw new Error(data.error || 'Failed to validate token');
          }

          console.log('Token validated successfully');
          setError('');
          setStep(3);
        } catch (err) {
          console.error('Token validation failed:', err);
          setError(err instanceof Error ? err.message : 'An error occurred while validating the reset link.');
          setStep(1);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No token found in URL');
      }
    };

    validateToken();
  }, [token]);

  // Image slideshow effect
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

  // Handle sending reset link
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/admin/forgot-password/', {
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
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      // Store email in localStorage for reset password step
      localStorage.setItem('resetEmail', email);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending reset link
  const handleResendLink = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/admin/forgot-password/', {
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
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend reset link');
      }
      setSuccess('Reset link resent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one digit');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special character');
      return;
    }
    if (!token) {
      setError('Invalid reset link. Please start the reset process again.');
      setStep(1);
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/admin/reset-password-for-forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const text = await response.text();
      console.log('Reset password response:', text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successfully. Redirecting to login...');
      localStorage.removeItem('resetEmail'); // Clean up
      setTimeout(() => navigate('/adminlogin'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="relative bg-white shadow-lg rounded-2xl flex max-w-6xl lg:w-full">
        {/* Form Section */}
        <div className="flex-1 p-10 md:p-20">
          {step === 1 && (
            <>
              <div className="flex justify-center items-center mb-3">
                <img src={snsLogo} className="w-auto" alt="SNS Institutions Logo" />
              </div>

              <div className="text-center mb-8">
                <p className="text-[#fc0] font-medium mb-2">Admin</p>
                <h1 className="text-3xl font-bold mb-2 text-[#111933]">Forgot Password?</h1>
                <p className="text-gray-500 text-sm">
                  Please enter your admin email to send a password reset mail
                </p>
              </div>

              <form onSubmit={handleSendLink}>
                <div className="mb-6">
                  <div className="relative">
                    <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                      <img src={emailIcon || '/placeholder.svg'} alt="Email" className="h-5 w-5" />
                      <input
                        type="email"
                        placeholder="Enter your admin email"
                        className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
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
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="text-center">
              

              <div className="flex justify-center mb-6">
                <img src={mail || '/placeholder.svg'} alt="Check email" className="h-24 w-24" />
              </div>

              <h1 className="text-2xl font-bold mb-2 text-[#111933]">
                Check your email to reset your password
              </h1>

              <p className="text-gray-500 text-sm mb-8">
                We have sent a password recovery instructions to your admin email
              </p>

              {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={() => navigate('/admin/login')}
                className="w-full bg-[#fc0] font-semibold text-[#111933] py-2 rounded-lg hover:shadow-md transition-colors mb-4"
              >
                Back to Login
              </button>

              <p className="text-sm text-gray-500">
                Didn't receive the mail?{' '}
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

          {step === 3 && (
            <>
              <div className="flex justify-center items-center mb-3">
                <img src={snsLogo} className="w-auto" alt="SNS Institutions Logo" />
              </div>

              <div className="text-center mb-8">
                <p className="text-[#fc0] font-medium mb-2">Admin</p>
                <h1 className="text-3xl font-bold mb-2 text-[#111933]">Reset Password</h1>
                <p className="text-gray-500 text-sm">Enter your new password below</p>
              </div>

              <form onSubmit={handleResetPassword}>
                <div className="mb-6">
                  <div className="relative">
                    <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                      <input
                        type="password"
                        placeholder="New Password"
                        className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1 ml-2">{error}</p>}
                    {success && <p className="text-xs text-green-500 mt-1 ml-2">{success}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#fc0] font-semibold text-[#111933] py-2 rounded-lg hover:shadow-md transition-colors"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Image Slideshow Section */}
        <div className="flex-1 justify-center items-center flex-col p-8 overflow-hidden hidden md:flex">
          <div className="relative w-full h-full">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className="absolute w-full h-full object-contain transition-all duration-1000 ease-in-out"
                style={{
                  opacity: currentImageIndex === index ? 1 : 0,
                  transform: `scale(${currentImageIndex === index ? 1 : 0.95})`,
                  zIndex: currentImageIndex === index ? 1 : 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;