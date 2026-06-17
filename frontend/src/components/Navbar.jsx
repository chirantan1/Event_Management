// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaHome,
  FaEnvelope,
  FaSignOutAlt,
  FaPlus,
  FaTachometerAlt,
  FaUsers,
  FaTicketAlt,
  FaShieldAlt,
} from "react-icons/fa";

function Navbar() {
  const { user, logout, isAuthenticated, isAdmin: contextIsAdmin } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check multiple sources for admin status
    const checkAdminStatus = () => {
      // First check from context
      if (contextIsAdmin) {
        console.log("Admin confirmed via context");
        setIsAdmin(true);
        return;
      }

      // Check from context user object
      if (user) {
        const isUserAdmin = user?.role === "admin" || user?.isAdmin === true;
        if (isUserAdmin) {
          console.log("Admin confirmed via user object");
          setIsAdmin(true);
          return;
        }
      }

      // Check directly from localStorage as backup
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const isStoredAdmin =
            parsedUser?.role === "admin" || parsedUser?.isAdmin === true;
          if (isStoredAdmin) {
            console.log("Admin confirmed via localStorage");
            setIsAdmin(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking localStorage:", error);
      }

      console.log("User is not admin");
      setIsAdmin(false);
    };

    checkAdminStatus();
  }, [user, contextIsAdmin]);

  // Debug logging
  useEffect(() => {
    console.log("=== Navbar Debug ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("contextIsAdmin:", contextIsAdmin);
    console.log("local isAdmin state:", isAdmin);
    console.log("User object:", user);
    console.log("User role:", user?.role);
    console.log("User isAdmin field:", user?.isAdmin);

    // Check localStorage directly
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      console.log("Stored user from localStorage:", parsed);
      console.log("Stored user role:", parsed?.role);
    }
  }, [user, isAuthenticated, contextIsAdmin, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg pro-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand pro-brand" to="/">
          EventHub
        </Link>

        <button
          className="navbar-toggler pro-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link pro-nav-link" to="/">
                <FaHome className="nav-icon" /> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link pro-nav-link" to="/events">
                <FaCalendarAlt className="nav-icon" /> Events
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link pro-nav-link" to="/contact">
                <FaEnvelope className="nav-icon" /> Contact
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item divider-vertical d-none d-lg-block"></li>

                {/* User Dashboard */}
                <li className="nav-item">
                  <Link className="nav-link pro-nav-link" to="/dashboard">
                    <FaUser className="nav-icon" /> Dashboard
                  </Link>
                </li>

                {/* Admin Panel - Shows for admin users only */}
                {isAdmin && (
                  <li className="nav-item">
                    <Link
                      className="nav-link pro-nav-link admin-link"
                      to="/admin"
                    >
                      <FaShieldAlt className="nav-icon text-warning" /> Admin
                      Panel
                    </Link>
                  </li>
                )}

                {/* Create Event Button - Shows for admin users only */}
                {isAdmin && (
                  <li className="nav-item">
                    <Link
                      className="btn pro-btn-create ms-2"
                      to="/create-event"
                    >
                      <FaPlus className="btn-icon" /> Create Event
                    </Link>
                  </li>
                )}

                {/* User Info & Logout */}
                <li className="nav-item d-flex align-items-center ms-lg-3 mt-3 mt-lg-0">
                  <div className="user-greeting">
                    <span className="greeting-text">Hello,</span>
                    <span className="user-name">
                      {user?.name?.split(" ")[0] ||
                        user?.email?.split("@")[0] ||
                        "User"}
                    </span>
                  </div>
                  <button
                    className="btn pro-btn-danger ms-3"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="btn-icon" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <div className="auth-buttons ms-lg-4 mt-3 mt-lg-0">
                <Link className="btn pro-btn-outline me-2" to="/login">
                  Login
                </Link>
                <Link className="btn pro-btn-primary" to="/register">
                  Register
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>

      <style>{`
        /* Core Navbar - Glassmorphism Effect */
        .pro-navbar {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Brand Styling */
        .pro-brand {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-icon {
          font-size: 1.6rem;
          -webkit-text-fill-color: initial;
        }

        /* Navigation Links */
        .pro-nav-link {
          color: #cbd5e1 !important;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 8px 16px !important;
          margin: 0 2px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .nav-icon {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .pro-nav-link:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .pro-nav-link:hover .nav-icon {
          transform: translateY(-2px);
        }

        .admin-link {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .admin-link:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.4);
        }

        /* Vertical Divider */
        .divider-vertical {
          width: 1px;
          height: 30px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent);
          margin: 0 10px;
        }

        /* Create Event Button */
        .pro-btn-create {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white !important;
          border: none;
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-left: 8px;
        }

        .pro-btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
        }

        /* Auth Buttons */
        .pro-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          border: none;
          padding: 8px 24px;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .pro-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .pro-btn-outline {
          background: transparent;
          color: #cbd5e1 !important;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 24px;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .pro-btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          color: white !important;
        }

        /* Logout Button */
        .pro-btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171 !important;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .pro-btn-danger:hover {
          background: #ef4444;
          color: white !important;
          border-color: #ef4444;
          transform: translateY(-1px);
        }

        .btn-icon {
          font-size: 0.9rem;
        }

        /* User Greeting */
        .user-greeting {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          background: rgba(255, 255, 255, 0.05);
          padding: 5px 14px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .greeting-text {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .user-name {
          font-size: 0.9rem;
          color: #38bdf8;
          font-weight: 700;
        }

        /* Mobile Toggler */
        .pro-toggler {
          border: none;
          padding: 8px;
        }

        .pro-toggler:focus {
          box-shadow: none;
          outline: none;
        }

        .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
        }

        /* Responsive Fixes */
        @media (max-width: 991px) {
          .pro-navbar {
            background: rgba(15, 23, 42, 0.98);
          }
          
          .pro-nav-link {
            padding: 12px 16px !important;
            justify-content: center;
          }
          
          .divider-vertical {
            display: none;
          }
          
          .auth-buttons {
            display: flex;
            justify-content: center;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          
          .user-greeting {
            margin-bottom: 10px;
            text-align: center;
          }
          
          .pro-btn-create {
            margin: 10px 0;
            justify-content: center;
          }
          
          .pro-btn-danger {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
