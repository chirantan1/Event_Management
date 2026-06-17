// frontend/src/pages/ForgotPassword.jsx
import { useState } from "react";
import { forgotPassword } from "../services/api";
import OTPVerification from "../components/OTPVerification";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Key,
} from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  // Advanced email validation
  const validateEmail = (email) => {
    if (!email) {
      return "Email address is required";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    // Check for common disposable email domains
    const disposableDomains = [
      "tempmail.com",
      "temp-mail.org",
      "guerrillamail.com",
      "mailinator.com",
      "yopmail.com",
      "throwawaymail.com",
    ];
    const domain = email.split("@")[1];
    if (disposableDomains.includes(domain)) {
      return "Please use a permanent email address";
    }

    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      const validationError = validateEmail(value);
      setEmailError(validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateEmail(email);
    setEmailError(validationError);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setTouched(true);

    // Validate email
    const validationError = validateEmail(email);
    setEmailError(validationError);

    if (validationError) {
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      console.log("Forgot password response:", response.data);

      if (response.data.success) {
        setMessage("OTP sent successfully! Redirecting to verification...");
        setTimeout(() => {
          setStep("otp");
        }, 2000);
      } else {
        // Handle specific error cases
        const errorMsg = response.data.error || "Failed to send OTP";
        setError(errorMsg);

        // Specific error handling
        if (errorMsg.includes("not registered")) {
          setError(
            "This email is not registered with us. Please sign up first.",
          );
        } else if (errorMsg.includes("rate limit")) {
          setError(
            "Too many attempts. Please wait a few minutes before trying again.",
          );
        } else if (errorMsg.includes("invalid")) {
          setError("Invalid request. Please check your email and try again.");
        }
      }
    } catch (err) {
      console.error("Forgot password error:", err);

      // Network error handling
      if (err.code === "ERR_NETWORK") {
        setError(
          "Unable to connect to server. Please check your internet connection.",
        );
      } else if (err.response?.status === 429) {
        setError(
          "Too many requests. Please wait a moment before trying again.",
        );
      } else if (err.response?.status === 404) {
        setError("Email not found. Please check your email address.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later or contact support.");
      } else {
        setError(
          err.response?.data?.error ||
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = (resetToken) => {
    navigate(`/reset-password?token=${resetToken}`);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-xl border-0 rounded-4 overflow-hidden">
              <div className="card-body p-5">
                {step === "email" ? (
                  <>
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                        <Key size={32} className="text-primary" />
                      </div>
                      <h2 className="fw-bold mb-2">Forgot Password?</h2>
                      <p className="text-muted" style={{ fontSize: "0.95rem" }}>
                        No worries! Enter your email and we'll send you a
                        verification code.
                      </p>
                    </div>

                    {/* Error Display with Animation */}
                    {error && (
                      <div
                        className="alert alert-danger border-0 rounded-3 mb-4 d-flex align-items-start"
                        role="alert"
                      >
                        <AlertCircle
                          size={20}
                          className="flex-shrink-0 mt-1 me-2"
                        />
                        <div>
                          <strong className="d-block mb-1">Error</strong>
                          <span style={{ fontSize: "0.95rem" }}>{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {message && (
                      <div
                        className="alert alert-success border-0 rounded-3 mb-4 d-flex align-items-start"
                        role="alert"
                      >
                        <CheckCircle
                          size={20}
                          className="flex-shrink-0 mt-1 me-2"
                        />
                        <div>
                          <strong className="d-block mb-1">Success</strong>
                          <span style={{ fontSize: "0.95rem" }}>{message}</span>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSendOTP} noValidate>
                      {/* Email Input */}
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          Email Address
                        </label>
                        <div className="position-relative">
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <Mail size={18} className="text-muted" />
                            </span>
                            <input
                              type="email"
                              className={`form-control form-control-lg border-start-0 ${
                                touched && emailError
                                  ? "is-invalid"
                                  : touched && !emailError && email
                                    ? "is-valid"
                                    : ""
                              }`}
                              placeholder="Enter your registered email"
                              value={email}
                              onChange={handleEmailChange}
                              onBlur={handleBlur}
                              required
                              disabled={loading}
                            />
                          </div>
                          {touched && emailError && (
                            <div className="invalid-feedback d-block mt-1">
                              {emailError}
                            </div>
                          )}
                          {touched && !emailError && email && (
                            <div className="valid-feedback d-block mt-1">
                              Valid email address
                            </div>
                          )}
                        </div>
                        <small className="text-muted mt-2 d-block">
                          We'll send a 6-digit OTP to this email
                        </small>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 mb-3"
                        disabled={loading || (touched && !!emailError)}
                        style={{
                          borderRadius: "10px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading ? (
                          <>
                            <Loader2
                              size={20}
                              className="spinner-border spinner-border-sm me-2"
                            />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <Mail size={20} className="me-2" />
                            Send Verification Code
                          </>
                        )}
                      </button>

                      {/* Back to Login */}
                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-1"
                          onClick={() => navigate("/login")}
                          style={{ fontSize: "0.95rem" }}
                        >
                          <ArrowLeft size={16} />
                          Back to Login
                        </button>
                      </div>

                      {/* Trust Indicators */}
                      <div className="mt-4 pt-3 border-top text-center">
                        <div className="d-flex justify-content-center gap-4">
                          <small className="text-muted d-flex align-items-center gap-1">
                            <Shield size={14} />
                            Secure
                          </small>
                          <small className="text-muted d-flex align-items-center gap-1">
                            <CheckCircle size={14} />
                            24/7 Support
                          </small>
                        </div>
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

            {/* Footer Note */}
            <div className="text-center mt-4">
              <small className="text-white-50">
                Need help?{" "}
                <a
                  href="/support"
                  className="text-white text-decoration-underline"
                >
                  Contact Support
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for enhanced styling */}
      <style jsx>{`
        .shadow-xl {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .input-group-text {
          background-color: #f8f9fa;
          border-radius: 10px 0 0 10px;
        }

        .form-control {
          border-radius: 0 10px 10px 0;
          padding: 0.75rem 1rem;
        }

        .form-control.is-valid {
          border-color: #198754;
        }

        .form-control.is-invalid {
          border-color: #dc3545;
        }

        .alert {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-link {
          color: #667eea;
        }

        .btn-link:hover {
          color: #764ba2;
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;
