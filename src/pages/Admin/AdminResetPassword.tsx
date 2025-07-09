import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import mail from "../../assets/mail.svg";
import { ArrowLeft, Check, X, Eye, EyeOff } from "lucide-react";

const AdminResetPassword: React.FC = () => {
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
  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasMixedCase, setHasMixedCase] = useState(false);
  const [hasNumberOrSymbol, setHasNumberOrSymbol] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setError("Invalid password reset link.");
        setIsTokenValidating(false);
        return;
      }

      try {
        setIsTokenValidating(true);
        const response = await axios.get("https://leaderboard-backend-4uxl.onrender.com/api/superadmin/validate-setup-token/", {
          params: { token, email, type: "admin" },
        });

        if (response.status === 200) {
          setIsTokenValid(true);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || "Something went wrong.";
        if (errorMessage.includes("expired")) {
          setError("Invitation link has expired. Please request a new one.");
        } else if (errorMessage.includes("used")) {
          setError("Invitation link has already been used.");
        } else if (errorMessage.includes("not found")) {
          setError("Page not found. Invalid invitation link.");
        } else {
          setError("Invalid or expired invitation link.");
        }
      } finally {
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  // Validate password as user types
  const validatePassword = (password: string) => {
    if (password) {
      setIsTyping(true);
    }

    setHasMinLength(password.length >= 8);
    setHasMixedCase(/[a-z]/.test(password) && /[A-Z]/.test(password));
    setHasNumberOrSymbol(/[0-9]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password));
    setPasswordsMatch(password === confirmPassword);
    calculatePasswordStrength(password);
  };

  // Calculate password strength
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

  // Validate confirm password
  const validateConfirmPassword = (confirmPwd: string) => {
    setPasswordsMatch(newPassword === confirmPwd);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      const response = await axios.post("https://leaderboard-backend-4uxl.onrender.com/api/admin/reset-password/", {
        token,
        email,
        new_password: newPassword,
      });

      if (response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/adminlogin");
        }, 3000);
      } else {
        setError(response.data.message || "Reset failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
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

  // Show loading state while validating token
  if (isTokenValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show error message for invalid/expired/used token
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-300 w-full max-w-lg px-10 pt-14 pb-40 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-red-500 text-sm mb-8">{error}</p>
          <button
            onClick={() => navigate("/adminlogin")}
            className="w-full bg-[#fc0] text-black py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <div className="bg-white rounded-lg border border-gray-300 w-full max-w-lg px-6 sm:px-10 pt-8 sm:pt-14 pb-20 sm:pb-40">
        {!isSuccess ? (
          <>
            <div className="flex items-center mb-8 sm:mb-16">
              <button onClick={() => navigate("/adminlogin")} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <p className="text-[#fc0] font-medium mb-2 text-sm sm:text-base">Admin</p>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Set New Password</h1>
              <p className="text-gray-500 text-sm px-2">Enter your new password to update your admin password</p>
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

              {isTyping && (
                <div className="mb-6 rounded-md">
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
                        <span className={hasMixedCase ? "text-green-500" : "text-red-500"}>
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
                          Password strength:{" "}
                          <span
                            className={passwordStrength === "strong" ? "text-green-500" : "text-red-500"}
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
                    className="w-full border border-gray-200 rounded-md py-2 px-4"
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
                    {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid() || !passwordsMatch}
                className={`w-full py-2 rounded-md transition-colors ${
                  isPasswordValid() && passwordsMatch
                    ? "bg-[#fc0] text-black hover:bg-yellow-600"
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
              <img src={mail || "/placeholder.svg"} alt="Success" className="h-24 w-24" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Password Reset Successful!</h1>

            <p className="text-gray-500 text-sm mb-8">Your admin password has been changed successfully</p>

            <button
              onClick={() => navigate("/adminlogin")}
              className="w-full bg-[#fc0] text-black py-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResetPassword;