


import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Check, X, Eye, EyeOff } from "lucide-react";
import snsLogo from "../../assets/Logo.svg";

const StudentResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasMixedCase, setHasMixedCase] = useState(false);
  const [hasNumberOrSymbol, setHasNumberOrSymbol] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Validate password as user types
  const validatePassword = (password: string) => {
    // Set typing state to true when user starts typing
    if (password) {
      setIsTyping(true);
    }

    // Validate minimum length
    setHasMinLength(password.length >= 8);

    // Validate mixed case (one uppercase and one lowercase)
    setHasMixedCase(/[a-z]/.test(password) && /[A-Z]/.test(password));

    // Validate number or symbol
    setHasNumberOrSymbol(/[0-9]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password));

    // Check if passwords match
    setPasswordsMatch(password === confirmPassword);

    // Calculate password strength immediately when typing starts
    calculatePasswordStrength(password);
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    // Always show password strength when user is typing
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength < 3) setPasswordStrength("weak");
    else setPasswordStrength("strong");
  };

    

  // Validate confirm password
  const validateConfirmPassword = (confirmPwd: string) => {
    setPasswordsMatch(newPassword === confirmPwd);
  };

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid password reset link.");
    }
  }, [token, email]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Invalid password reset link.");
      return;
    }

    if (!isPasswordValid()) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("https://leaderboard-backend-4uxl.onrender.com/api/Student/reset-password/", {
        token,
        email,
        new_password: newPassword,
      });

      const data = response.data as { success?: boolean; message?: string };
      if (response.status === 200) {
        setIsSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/studentlogin");
        }, 3000);
      } else {
        setError(data.message || "Reset failed.");
      }
    } catch (er: unknown) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = () => {
    return hasMinLength && hasMixedCase && hasNumberOrSymbol;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <div className="bg-white rounded-lg border border-gray-300 w-full max-w-lg px-6 sm:px-10 pt-8 sm:pt-14 pb-20 sm:pb-40">
        {!isSuccess ? (
          <>
            <div className="flex items-center mb-8 sm:mb-16">
              <button onClick={() => navigate("/studentlogin")} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <p className="text-yellow-500 font-medium mb-2 text-sm sm:text-base">Login</p>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Set New Password</h1>
              <p className="text-gray-500 text-sm px-2">Enter your new password to update your password</p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="w-full border border-gray-200 rounded-md py-2 px-4 text-sm sm:text-base"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    required
                  />
                  <div
                    className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <Eye className="h-4 w-4 sm:h-5 sm:w-5" /> : <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                </div>
              </div>

              {/* Password requirements - only show when typing */}
              {isTyping && (
                <div className="mb-6 rounded-md ">
                  <div className="grid grid-cols-2">
                    <ul className="space-y-2">
                      <li className="flex items-center text-xs">
                        {hasMinLength ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasMinLength ? "text-green-500" : "text-red-500"}>Minimum of 8 characters</span>
                      </li>
                      <li className="flex items-center text-xs">
                        {hasMixedCase ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasMixedCase ? "text-green-500 " : "text-red-500"}>
                          One uppercase and one lowercase
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        {hasNumberOrSymbol ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={hasNumberOrSymbol ? "text-green-500" : "text-red-500"}>
                          One Number or Symbol
                        </span>
                      </li>
                    </ul>
                    <div className="flex justify-end">
                      {passwordStrength && (
                        <div className="text-sm text-gray-500">
                          Password strength :{" "}
                          <span
                            className={`${
                              passwordStrength === "strong" ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {passwordStrength}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full border border-gray-200 rounded-md py-2 px-4 text-sm sm:text-base"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validateConfirmPassword(e.target.value);
                    }}
                    required
                  />
                  <div
                    className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4 sm:h-5 sm:w-5" /> : <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid() || !passwordsMatch}
                className={`w-full py-2 rounded-md transition-colors ${
                  isPasswordValid() && passwordsMatch
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Processing..." : "Set New Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src={snsLogo} alt="Success" className="h-24 w-24" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold mb-2">Password reset Successful!</h1>

            <p className="text-gray-500 text-sm mb-8 px-2">Your password has been changed successfully</p>

            <button
              onClick={() => navigate("/studentlogin")}
              className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResetPassword;



