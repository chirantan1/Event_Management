// frontend/src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../services/api";

function ResetPassword() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      setResetToken(token);
      console.log("Reset token found:", token.substring(0, 20) + "...");
    } else {
      setError("No reset token found. Please request a new password reset.");
    }
  }, [location]);

  // FIXED: Added redirect countdown
  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate("/login", {
              state: { message: "Password reset successful! Please login." },
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await resetPassword(
        resetToken,
        formData.newPassword,
        formData.confirmPassword,
      );

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body text-center p-5">
                <div className="text-success mb-3">
                  <i
                    className="fas fa-check-circle"
                    style={{ fontSize: "64px" }}
                  ></i>
                </div>
                <h3>Password Reset Successful!</h3>
                <p>
                  Redirecting to login page in {redirectCountdown} seconds...
                </p>
                <div className="spinner-border text-primary mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2>Reset Password</h2>
                <p className="text-muted">Enter your new password</p>
              </div>

              {error && <div className="alert alert-danger mb-4">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    required
                  />
                  <small className="text-muted">Minimum 6 characters</small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={loading || !resetToken}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
