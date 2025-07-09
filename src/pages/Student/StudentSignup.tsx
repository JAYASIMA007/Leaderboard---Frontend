import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaUser, FaIdCard } from 'react-icons/fa';
import { Check, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'react-router-dom';

//img imports
import snsLogo from '../../assets/Logo.svg';
import loginScattered11 from "../../assets/LoginImg1.png";
import loginScattered22 from "../../assets/LoginImg2.png";
import loginScattered33 from "../../assets/LoginImg3.png";
import mail from '../../assets/mail.svg';

const StudentSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    department: '',
    password: '',
    confirmPassword: '',
    token: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [step, setStep] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasMixedCase, setHasMixedCase] = useState(false);
  const [hasNumberOrSymbol, setHasNumberOrSymbol] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.54.119.187:8000';

  const images = [loginScattered11, loginScattered22, loginScattered33];

  useEffect(() => {
    // Extract token and email from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    
    setFormData(prev => ({
      ...prev,
      token,
      email
    }));

    // Validate token on component mount
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setErrorMessage('No token provided');
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/student/check-student-signup-token/`,
          {
            params: { token },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setTokenValid(true);
          setFormData(prev => ({
            ...prev,
            email: response.data.email || email
          }));
        }
      } catch (error: unknown) {
        setTokenValid(false);
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.error || 'Invalid or expired token'
          );
          toast.error(error.response?.data?.error || 'Invalid token');
        } else {
          setErrorMessage('An unexpected error occurred during token validation');
          toast.error('Token validation failed');
        }
      }
    };

    validateToken();

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
  }, [isTransitioning, images.length, location.search]);

  const validatePassword = (password: string) => {
    if (password) {
      setIsTyping(true);
    }

    setHasMinLength(password.length >= 8);
    setHasMixedCase(/[a-z]/.test(password) && /[A-Z]/.test(password));
    setHasNumberOrSymbol(/[0-9]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password));
    setPasswordsMatch(password === formData.confirmPassword);
    calculatePasswordStrength(password);
  };

  const calculatePasswordStrength = (password: string) => {
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    setPasswordStrength(strength < 3 ? "weak" : "strong");
  };

  const validateConfirmPassword = (confirmPwd: string) => {
    setPasswordsMatch(formData.password === confirmPwd);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      validatePassword(value);
    }

    if (name === 'confirmPassword') {
      validateConfirmPassword(value);
    }
  };

  const isPasswordValid = () => {
    return hasMinLength && hasMixedCase && hasNumberOrSymbol;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.student_id || !formData.department || !formData.password) {
      setErrorMessage('All fields are required');
      setLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      setErrorMessage('Please ensure your password meets all requirements');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/student/signup/`,
        {
          name: formData.name,
          email: formData.email,
          student_id: formData.student_id,
          department: formData.department,
          password: formData.password,
          token: formData.token
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setStep(2);
        toast.success('Registration successful! You can now login.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || 'An error occurred during registration.'
        );
        toast.error(error.response?.data?.error || 'Registration failed.');
      } else {
        setErrorMessage('An unexpected error occurred.');
        toast.error('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignup(e as unknown as React.FormEvent);
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailFromURL = searchParams.get('email');
    if (emailFromURL) {
      setFormData((prev) => ({
        ...prev,
        email: emailFromURL
      }));
    }
  }, [searchParams]);

  if (tokenValid === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#111933]">Validating token...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111933] mb-4">Page Not Found</h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            The signup link is invalid or has expired. Please contact the administrator to request a new invitation.
          </p>
          <button
            onClick={() => navigate("/studentlogin")}
            className="bg-[#fc0] text-[#111933] font-semibold py-2 px-4 rounded-lg hover:shadow-md transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <div className="relative bg-white shadow-lg rounded-2xl flex flex-col lg:flex-row max-w-6xl w-full overflow-hidden">
        {step === 1 && (
          <>
            <form
              onSubmit={handleSignup}
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
                  User Registration
                </h1>
                <h1 className="text-2xl sm:text-3xl font-medium text-center mb-2 text-[#111933]">
                  Create Your Account
                </h1>
                <p className="text-sm sm:text-md text-center text-[#8e8e8e] mb-6 sm:mb-8 px-2">
                  Please fill in your details to create a User account
                </p>

                <div className="relative mb-4 w-full">
                  <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                    <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                </div>

                <div className="relative mb-4 w-full">
                  <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                    <img alt='mail' src={mail} className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="flex-1 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none text-sm placeholder-gray-400 ml-2"
                      placeholder="test@example.com"
                    />
                  </div>
                </div>

                <div className="relative mb-4 w-full">
                  <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                    <FaIdCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                      placeholder="User ID"
                      required
                    />
                  </div>
                </div>

                <div className="relative mb-4 w-full">
                  <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                    <FaIdCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                      placeholder="Department"
                      required
                    />
                  </div>
                </div>

                <div className="relative mb-1 w-full">
                  <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                      placeholder="Password"
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
                </div>

                {isTyping && (
                  <div className="mb-4 w-full rounded-md">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center text-xs">
                        {hasMinLength ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasMinLength ? "text-green-500" : "text-red-500"}>
                          Minimum of 8 characters
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {hasMixedCase ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasMixedCase ? "text-green-500" : "text-red-500"}>
                          One uppercase and one lowercase
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {hasNumberOrSymbol ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasNumberOrSymbol ? "text-green-500" : "text-red-500"}>
                          One number or symbol
                        </span>
                      </div>
                      {passwordStrength && (
                        <div className="text-sm text-gray-500">
                          Password strength:{" "}
                          <span
                            className={`${passwordStrength === "strong" ? "text-green-500" : "text-red-500"
                              }`}
                          >
                            {passwordStrength}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative mb-1 w-full">
                  <div className="flex items-center border border-[#c6c6c6] rounded-lg p-3 shadow-sm">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="flex-1 focus:outline-none text-sm placeholder-gray-400 ml-2"
                      placeholder="Confirm Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <FaEye className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="flex items-center mt-1 text-xs">
                      {passwordsMatch ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={passwordsMatch ? "text-green-500" : "text-red-500"}>
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                      </span>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-500 mb-4 text-center">{errorMessage}</p>
                )}

                <div className="flex flex-col items-center w-full">
                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid() || !passwordsMatch}
                    className={`w-full font-semibold py-2 rounded-lg shadow hover:shadow-md transition-all mt-5 ${isPasswordValid() && passwordsMatch && !loading
                      ? "bg-[#fc0] text-black"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Already have an account?{" "}
                    <Link to="/studentlogin" className="text-[#fc0] hover:underline font-medium">
                      Login here
                    </Link>
                  </p>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    By signing up you are accepting all terms and conditions laid by SNS institutions
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
          </>
        )}

        {step === 2 && (
          <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 md:p-12 lg:p-20">
            <div className="w-full max-w-md flex flex-col items-center text-center">
              <img
                src={snsLogo}
                className="w-auto mb-8 h-12 sm:h-16"
                alt="SNS Institutions Logo"
              />

              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-12 w-12 text-green-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2 text-[#111933]">
                Registration Successful!
              </h1>

              <p className="text-gray-500 text-sm mb-8">
                Your account has been created successfully. You can now login with your credentials.
              </p>

              <button
                onClick={() => navigate("/studentlogin")}
                className="w-full bg-[#fc0] font-semibold text-[#111933] py-2 rounded-lg hover:shadow-md transition-colors mb-4"
              >
                Go to Login
              </button>

              <p className="text-sm text-gray-500">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setStep(1)}
                  className="text-[#fc0] hover:underline font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSignup;