// frontend/src/pages/ForgotPassword.jsx (Updated)
import { useState } from "react";
import { forgotPassword } from "../services/api";
import OTPVerification from "../components/OTPVerification";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      console.log("Forgot password response:", response.data);

      if (response.data.success) {
        setMessage("OTP sent to your email!");
        setTimeout(() => {
          setStep("otp");
        }, 1500);
      } else {
        setError(response.data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.error || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = (resetToken) => {
    // Navigate to reset password with token
    navigate(`/reset-password?token=${resetToken}`);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-5">
              {step === "email" ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="mb-2">Forgot Password?</h2>
                    <p className="text-muted">
                      Enter your email address and we'll send you an OTP to
                      reset your password.
                    </p>
                  </div>

                  {error && (
                    <div className="alert alert-danger mb-4">{error}</div>
                  )}

                  {message && (
                    <div className="alert alert-success mb-4">{message}</div>
                  )}

                  <form onSubmit={handleSendOTP}>
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>

                    <div className="text-center mt-3">
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => navigate("/login")}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <OTPVerification
                  email={email}
                  onSuccess={handleOTPSuccess}
                  onBack={() => setStep("email")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
