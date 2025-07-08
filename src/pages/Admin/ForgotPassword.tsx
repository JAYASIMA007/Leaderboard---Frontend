import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginbg from "../../assets/loginbg.svg";
import emailIcon from "../../assets/mail.svg";
import resetmail from "../../assets/resetmail.svg";
import { ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email input, 2: Check email

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/admin/send-reset-link/', {
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
      const response = await fetch('https://leaderboard-backend-4uxl.onrender.com/api/send-reset-link/', {
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
    <div className="min-h-screen flex items-center justify-center relative">
      <img 
        src={loginbg || "/placeholder.svg"} 
        alt="Login background" 
        className="absolute inset-0 w-full h-full object-cover -z-5" 
      />
      
      <div className="bg-white rounded-lg border border-gray-300 w-full max-w-md px-10 pt-16 pb-52">
        {step === 1 && (
          <>
            <div className="flex items-center mb-28">
              <button onClick={() => navigate("/admin")} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-8">
              <p className="text-yellow-500 font-medium mb-2">Login</p>
              <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-gray-500 text-sm">Please enter your email to send a password reset mail</p>
            </div>

            <form onSubmit={handleSendLink}>
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your mail ID"
                    className="w-full border border-gray-200 rounded-md py-2 px-4 pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <img src={emailIcon || "/placeholder.svg"} alt="Email" className="h-5 w-5" />
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 mt-1 ml-2">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src={resetmail || "/placeholder.svg"} alt="Check email" className="h-24 w-24" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Check your email to reset your password</h1>

            <p className="text-gray-500 text-sm mb-8">We have sent a password recovery instructions to your email</p>

            <button
              onClick={() => navigate("/admin")}
              className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors mb-4"
            >
              Back to Login
            </button>

            <p className="text-sm text-gray-500">
              Didn't receive the mail?{" "}
              <button
                onClick={handleResendLink}
                disabled={isLoading}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Click to resend
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
