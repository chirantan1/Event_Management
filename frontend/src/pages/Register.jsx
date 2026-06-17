import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
  FaArrowLeft,
} from "react-icons/fa";
import backgroundImage from "../assets/login-bg.jpg";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    setError("");
    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      const successMessage = document.createElement("div");
      successMessage.className = "glass-success-popup";
      successMessage.innerHTML = `
        <div class="glass-success-content">
          <div class="glass-success-icon">✓</div>
          <h3>Registration Successful!</h3>
          <p>Welcome to EventHub! Please login to continue.</p>
        </div>
      `;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        successMessage.remove();
        navigate("/login");
      }, 2000);
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="glass-register-container">
      <div
        className="glass-bg-image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="glass-overlay"></div>
      <div className="glass-bubble glass-bubble-1"></div>
      <div className="glass-bubble glass-bubble-2"></div>
      <div className="glass-bubble glass-bubble-3"></div>
      <div className="glass-bubble glass-bubble-4"></div>
      <div className="glass-line glass-line-1"></div>
      <div className="glass-line glass-line-2"></div>

      <div className="glass-register-wrapper">
        <div className="glass-register-card">
          <div className="glass-shine"></div>
          <div className="glass-corner glass-corner-tl"></div>
          <div className="glass-corner glass-corner-tr"></div>
          <div className="glass-corner glass-corner-bl"></div>
          <div className="glass-corner glass-corner-br"></div>

          <Link to="/" className="glass-back-btn">
            <FaArrowLeft /> Back to Home
          </Link>

          <div className="glass-register-header">
            <div className="glass-logo">🎉</div>
            <h1 className="glass-title">Create Account</h1>
            <p className="glass-subtitle">
              Join EventHub and discover amazing events
            </p>
          </div>

          {error && (
            <div className="glass-alert glass-alert-error">
              <span className="glass-alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass-form">
            <div className="glass-input-group">
              <label className="glass-label">
                <FaUser className="glass-label-icon" /> Full Name
              </label>
              <div className="glass-input-wrapper">
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="glass-input-focus"></div>
              </div>
              <span className="glass-input-hint">
                Your real name for verification
              </span>
            </div>

            <div className="glass-input-group">
              <label className="glass-label">
                <FaEnvelope className="glass-label-icon" /> Email Address
              </label>
              <div className="glass-input-wrapper">
                <input
                  type="email"
                  className="glass-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="glass-input-focus"></div>
              </div>
              <span className="glass-input-hint">
                We'll never share your email
              </span>
            </div>

            <div className="glass-input-group">
              <label className="glass-label">
                <FaLock className="glass-label-icon" /> Password
              </label>
              <div className="glass-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="glass-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="glass-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="glass-input-focus"></div>
              </div>
              <div className="glass-password-strength">
                <div
                  className={`glass-strength-bar ${password.length >= 6 ? "active" : ""}`}
                ></div>
                <div
                  className={`glass-strength-bar ${password.length >= 8 ? "active" : ""}`}
                ></div>
                <div
                  className={`glass-strength-bar ${password.match(/[!@#$%^&*]/) ? "active" : ""}`}
                ></div>
              </div>
              <span className="glass-input-hint">
                Minimum 6 characters with at least 1 number or symbol
              </span>
            </div>

            <div className="glass-input-group">
              <label className="glass-label">
                <FaLock className="glass-label-icon" /> Confirm Password
              </label>
              <div className="glass-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="glass-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="glass-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="glass-input-focus"></div>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="glass-input-error">
                  Passwords do not match
                </span>
              )}
              {confirmPassword &&
                password === confirmPassword &&
                password.length > 0 && (
                  <span className="glass-input-success">✓ Passwords match</span>
                )}
            </div>

            <div className="glass-terms">
              <label className="glass-checkbox">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="glass-checkmark"></span>
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="glass-terms-link">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="glass-terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="glass-register-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="glass-spinner"></span> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="glass-divider">
              <span>or</span>
            </div>

            <div className="glass-social-buttons">
              <button
                type="button"
                className="glass-social-btn glass-google-btn"
                onClick={loginWithGoogle}
              >
                <FaGoogle /> Continue with Google
              </button>
              <button
                type="button"
                className="glass-social-btn glass-github-btn"
                onClick={loginWithGithub}
              >
                <FaGithub /> Continue with GitHub
              </button>
            </div>

            <p className="glass-login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .glass-register-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }
        .glass-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(10px) brightness(0.6);
          transform: scale(1.1);
          z-index: 0;
        }
        .glass-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.5) 0%,
            rgba(0, 0, 0, 0.3) 100%
          );
          z-index: 1;
        }
        .glass-bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          backdrop-filter: blur(10px);
          z-index: 1;
          animation: float 25s infinite ease-in-out;
        }
        .glass-bubble-1 {
          width: 350px;
          height: 350px;
          top: -100px;
          right: -100px;
        }
        .glass-bubble-2 {
          width: 250px;
          height: 250px;
          bottom: -80px;
          left: -80px;
          animation-delay: 7s;
        }
        .glass-bubble-3 {
          width: 180px;
          height: 180px;
          top: 40%;
          left: 10%;
          animation-delay: 3s;
        }
        .glass-bubble-4 {
          width: 120px;
          height: 120px;
          bottom: 20%;
          right: 15%;
          animation-delay: 12s;
        }
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -40px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }
        .glass-line {
          position: absolute;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          height: 1px;
          width: 100%;
          z-index: 1;
        }
        .glass-line-1 {
          top: 20%;
          animation: slideLine 15s infinite linear;
        }
        .glass-line-2 {
          bottom: 25%;
          animation: slideLine 12s infinite linear reverse;
        }
        @keyframes slideLine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .glass-register-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 560px;
          margin: 20px;
        }
        .glass-register-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 40px;
          padding: 48px 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          transition:
            transform 0.4s ease,
            box-shadow 0.4s ease;
        }
        .glass-register-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 35px 65px rgba(0, 0, 0, 0.4);
        }
        .glass-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent
          );
          animation: shine 12s infinite;
        }
        @keyframes shine {
          0% {
            left: -100%;
          }
          20%,
          100% {
            left: 100%;
          }
        }
        .glass-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        .glass-corner-tl {
          top: 20px;
          left: 20px;
          border-right: none;
          border-bottom: none;
          border-radius: 20px 0 0 0;
        }
        .glass-corner-tr {
          top: 20px;
          right: 20px;
          border-left: none;
          border-bottom: none;
          border-radius: 0 20px 0 0;
        }
        .glass-corner-bl {
          bottom: 20px;
          left: 20px;
          border-right: none;
          border-top: none;
          border-radius: 0 0 0 20px;
        }
        .glass-corner-br {
          bottom: 20px;
          right: 20px;
          border-left: none;
          border-top: none;
          border-radius: 0 0 20px 0;
        }
        .glass-back-btn {
          position: absolute;
          top: 30px;
          left: 30px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          z-index: 10;
        }
        .glass-back-btn:hover {
          color: #fff;
          transform: translateX(-5px);
        }
        .glass-register-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .glass-logo {
          font-size: 48px;
          margin-bottom: 16px;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .glass-title {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.8));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
        .glass-alert {
          padding: 14px 18px;
          border-radius: 16px;
          margin-bottom: 24px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          animation: slideIn 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .glass-alert-error {
          background: rgba(220, 53, 69, 0.9);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
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
        .glass-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .glass-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .glass-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .glass-input-wrapper {
          position: relative;
        }
        .glass-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: #fff;
          font-size: 15px;
          transition: all 0.3s ease;
          outline: none;
        }
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .glass-input-focus {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        .glass-input:focus ~ .glass-input-focus {
          width: 100%;
          left: 0;
        }
        .glass-password-toggle {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 18px;
        }
        .glass-password-strength {
          display: flex;
          gap: 6px;
          margin-top: 6px;
        }
        .glass-strength-bar {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          transition: all 0.3s ease;
        }
        .glass-strength-bar.active {
          background: linear-gradient(90deg, #28a745, #20c997);
        }
        .glass-input-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }
        .glass-input-error {
          font-size: 11px;
          color: #dc3545;
        }
        .glass-input-success {
          font-size: 11px;
          color: #28a745;
        }
        .glass-terms {
          margin: 8px 0;
        }
        .glass-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          cursor: pointer;
          position: relative;
        }
        .glass-checkbox input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }
        .glass-checkmark {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          display: inline-block;
          position: relative;
          transition: all 0.3s ease;
        }
        .glass-checkbox input:checked ~ .glass-checkmark {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
        }
        .glass-checkbox input:checked ~ .glass-checkmark::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
        }
        .glass-terms-link {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
        }
        .glass-terms-link:hover {
          text-decoration: underline;
        }
        .glass-register-btn {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: #fff;
          padding: 14px;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .glass-register-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s ease;
        }
        .glass-register-btn:hover::before {
          left: 100%;
        }
        .glass-register-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(40, 167, 69, 0.4);
        }
        .glass-register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .glass-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .glass-divider {
          position: relative;
          text-align: center;
          margin: 20px 0;
        }
        .glass-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
        }
        .glass-divider span {
          position: relative;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          padding: 0 15px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
        .glass-social-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .glass-social-btn {
          flex: 1;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .glass-social-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .glass-google-btn:hover {
          border-color: #db4437;
          box-shadow: 0 5px 15px rgba(219, 68, 55, 0.3);
        }
        .glass-github-btn:hover {
          border-color: #333;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .glass-login-link {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }
        .glass-login-link a {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
        }
        .glass-login-link a:hover {
          text-decoration: underline;
        }
        .glass-success-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        .glass-success-content {
          background: linear-gradient(135deg, #28a745, #20c997);
          padding: 40px;
          border-radius: 30px;
          text-align: center;
          color: white;
          animation: scaleIn 0.3s ease;
        }
        .glass-success-icon {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #28a745;
          margin: 0 auto 20px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (max-width: 768px) {
          .glass-register-card {
            padding: 40px 24px;
          }
          .glass-title {
            font-size: 28px;
          }
          .glass-bubble-1,
          .glass-bubble-2 {
            width: 200px;
            height: 200px;
          }
          .glass-social-buttons {
            flex-direction: column;
          }
          .glass-corner {
            width: 40px;
            height: 40px;
          }
        }
        @media (max-width: 480px) {
          .glass-register-card {
            padding: 32px 20px;
          }
          .glass-title {
            font-size: 24px;
          }
          .glass-back-btn {
            top: 20px;
            left: 20px;
            font-size: 12px;
          }
          .glass-corner {
            width: 25px;
            height: 25px;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;
