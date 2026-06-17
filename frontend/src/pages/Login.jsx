// frontend/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
} from "react-icons/fa";
import backgroundImage from "../assets/login-bg.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get API URL from environment
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    // Check for remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    // Check for error in URL params
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      setError(errorParam.replace(/_/g, " "));
    }

    // Check for success message
    if (location.state?.message) {
      console.log("Message:", location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect based on user role
      const userRole = result.user?.role || localStorage.getItem("userRole");
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    setError("");
    // Store return URL
    localStorage.setItem("oauth_return_url", "/dashboard");
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    setError("");
    // Store return URL
    localStorage.setItem("oauth_return_url", "/dashboard");
    // Redirect to GitHub OAuth
    window.location.href = `${API_URL}/auth/github`;
  };

  return (
    <div className="glass-login-container">
      <div
        className="glass-bg-image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="glass-overlay"></div>
      <div className="glass-circle glass-circle-1"></div>
      <div className="glass-circle glass-circle-2"></div>
      <div className="glass-circle glass-circle-3"></div>

      <div className="glass-login-wrapper">
        <div className="glass-login-card">
          <div className="glass-shine"></div>

          <div className="glass-login-header">
            <h1 className="glass-title">Welcome back</h1>
            <p className="glass-subtitle">Please enter your details.</p>
          </div>

          {error && (
            <div className="glass-alert glass-alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="glass-form">
            <div className="glass-input-group">
              <label className="glass-label">E-mail</label>
              <div className="glass-input-wrapper">
                <FaEnvelope className="glass-input-icon" />
                <input
                  type="email"
                  className="glass-input"
                  placeholder="Enter your e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="glass-input-group">
              <label className="glass-label">Password</label>
              <div className="glass-input-wrapper">
                <FaLock className="glass-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="glass-input"
                  placeholder="Enter your password"
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
              </div>
            </div>

            <div className="glass-options">
              <label className="glass-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="glass-forgot-link">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              className="glass-login-btn"
              disabled={loading}
            >
              {loading ? <span className="glass-spinner"></span> : "Log in"}
            </button>

            <div className="glass-divider">
              <span>or continue with</span>
            </div>

            <div className="glass-social-buttons">
              <button
                type="button"
                className="glass-social-btn glass-google-btn"
                onClick={handleGoogleLogin}
              >
                <FaGoogle /> Google
              </button>
              <button
                type="button"
                className="glass-social-btn glass-github-btn"
                onClick={handleGithubLogin}
              >
                <FaGithub /> GitHub
              </button>
            </div>

            <p className="glass-register-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .glass-login-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family:
            "Poppins",
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
          filter: blur(8px) brightness(0.7);
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
            rgba(0, 0, 0, 0.4) 0%,
            rgba(0, 0, 0, 0.2) 100%
          );
          z-index: 1;
        }
        .glass-circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 100%
          );
          filter: blur(40px);
          z-index: 1;
          animation: float 20s infinite ease-in-out;
        }
        .glass-circle-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: -100px;
          animation-delay: 0s;
        }
        .glass-circle-2 {
          width: 400px;
          height: 400px;
          bottom: 10%;
          right: -150px;
          animation-delay: 5s;
        }
        .glass-circle-3 {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
          opacity: 0.5;
        }
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .glass-login-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
          margin: 20px;
        }
        .glass-login-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border-radius: 32px;
          padding: 48px 40px;
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .glass-login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 35px 55px rgba(0, 0, 0, 0.3);
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
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shine 8s infinite;
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
        .glass-login-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .glass-title {
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .glass-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        .glass-alert {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          animation: slideIn 0.3s ease;
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
          gap: 24px;
        }
        .glass-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .glass-label {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.5px;
        }
        .glass-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .glass-input-icon {
          position: absolute;
          left: 16px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 18px;
          pointer-events: none;
        }
        .glass-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          color: #fff;
          font-size: 15px;
          transition: all 0.3s ease;
          outline: none;
        }
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }
        .glass-password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 18px;
          transition: color 0.3s ease;
        }
        .glass-password-toggle:hover {
          color: rgba(255, 255, 255, 0.9);
        }
        .glass-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 8px 0;
          flex-wrap: wrap;
          gap: 12px;
        }
        .glass-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          cursor: pointer;
        }
        .glass-checkbox input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #667eea;
        }
        .glass-forgot-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }
        .glass-forgot-link:hover {
          color: #fff;
          text-decoration: underline;
        }
        .glass-login-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 14px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .glass-login-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }
        .glass-login-btn:hover::before {
          left: 100%;
        }
        .glass-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        .glass-login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .glass-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
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
          flex-wrap: wrap;
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
          min-width: 120px;
        }
        .glass-social-btn:hover {
          background: rgba(255, 255, 255, 0.15);
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
        .glass-register-link {
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-top: 8px;
        }
        .glass-register-link a {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        .glass-register-link a:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .glass-login-card {
            padding: 32px 24px;
          }
          .glass-title {
            font-size: 28px;
          }
          .glass-circle-1,
          .glass-circle-2 {
            width: 200px;
            height: 200px;
          }
          .glass-social-buttons {
            flex-direction: column;
          }
          .glass-social-btn {
            width: 100%;
          }
        }
        @media (max-width: 480px) {
          .glass-login-card {
            padding: 28px 20px;
          }
          .glass-title {
            font-size: 24px;
          }
          .glass-options {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
