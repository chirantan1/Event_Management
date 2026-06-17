// frontend/src/components/OTPVerification.jsx
import { useState, useEffect } from "react";
import { verifyOTP, resendOTP } from "../services/api";

function OTPVerification({ email, onSuccess, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  // FIXED: Auto-submit when OTP reaches 6 digits
  useEffect(() => {
    if (otp.length === 6 && !loading && !error) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await verifyOTP(email, otp);
      console.log("Verify response:", response.data);

      if (response.data.success) {
        setMessage("OTP verified successfully!");
        setTimeout(() => {
          onSuccess(response.data.resetToken);
        }, 1500);
      } else {
        setError(response.data.error || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resendOTP(email);
      console.log("Resend response:", response.data);

      if (response.data.success) {
        setMessage("New OTP sent successfully!");
        setTimer(60);
        setCanResend(false);
        if (response.data.debugOTP) {
          console.log("Debug OTP:", response.data.debugOTP);
        }
      } else {
        setError(response.data.error || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification">
      <div className="text-center mb-4">
        <h3>Verify Your Email</h3>
        <p className="text-muted">
          We've sent a 6-digit verification code to
          <br />
          <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {message && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="fas fa-check-circle me-2"></i>
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      <div className="mb-4">
        <label className="form-label fw-bold">Enter OTP</label>
        <input
          type="text"
          className="form-control form-control-lg text-center"
          style={{
            fontSize: "2rem",
            letterSpacing: "10px",
            fontFamily: "monospace",
          }}
          placeholder="000000"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
            setOtp(value);
            if (error) setError("");
          }}
          maxLength="6"
          autoFocus
        />
        <small className="text-muted">
          Enter the 6-digit code sent to your email
        </small>
      </div>

      <button
        className="btn btn-primary btn-lg w-100 mb-3"
        onClick={handleVerify}
        disabled={loading || otp.length !== 6}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </button>

      <div className="text-center">
        {canResend ? (
          <button
            className="btn btn-link"
            onClick={handleResend}
            disabled={loading}
          >
            Resend OTP
          </button>
        ) : (
          <span className="text-muted">Resend OTP in {timer} seconds</span>
        )}
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-link text-muted" onClick={onBack}>
          ← Back to Forgot Password
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="alert alert-info mt-3 small">
          <strong>Debug Info:</strong>
          <br />
          Email: {email}
          <br />
          Check server console for OTP
        </div>
      )}
    </div>
  );
}

export default OTPVerification;
