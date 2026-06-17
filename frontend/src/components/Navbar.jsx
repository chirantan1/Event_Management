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
  FaShieldAlt,
  FaBolt,
  FaSearch,
  FaBell,
  FaCrown,
} from "react-icons/fa";

function Navbar() {
  const { user, logout, isAuthenticated, isAdmin: contextIsAdmin } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = () => {
      if (contextIsAdmin) {
        setIsAdmin(true);
        return;
      }

      if (user) {
        const isUserAdmin = user?.role === "admin" || user?.isAdmin === true;
        if (isUserAdmin) {
          setIsAdmin(true);
          return;
        }
      }

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const isStoredAdmin =
            parsedUser?.role === "admin" || parsedUser?.isAdmin === true;
          if (isStoredAdmin) {
            setIsAdmin(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking localStorage:", error);
      }

      setIsAdmin(false);
    };

    checkAdminStatus();
  }, [user, contextIsAdmin]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg pro-navbar ${scrolled ? "scrolled" : ""}`}
      >
        <div className="container">
          {/* Brand */}
          <Link
            className="navbar-brand pro-brand"
            to="/"
            onClick={handleNavLinkClick}
          >
            <div className="brand-icon-wrapper">
              <FaBolt className="brand-icon" />
            </div>
            <span className="brand-text">EventHub</span>
          </Link>

          {/* Toggler */}
          <button
            className={`navbar-toggler pro-toggler ${mobileMenuOpen ? "active" : ""}`}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="toggler-line"></span>
            <span className="toggler-line"></span>
            <span className="toggler-line"></span>
          </button>

          {/* Navbar Content */}
          <div
            className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`}
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto align-items-center">
              {/* Navigation Links */}
              <li className="nav-item">
                <Link
                  className="nav-link pro-nav-link"
                  to="/"
                  onClick={handleNavLinkClick}
                >
                  <FaHome className="nav-icon" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link pro-nav-link"
                  to="/events"
                  onClick={handleNavLinkClick}
                >
                  <FaCalendarAlt className="nav-icon" />
                  <span>Events</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link pro-nav-link"
                  to="/contact"
                  onClick={handleNavLinkClick}
                >
                  <FaEnvelope className="nav-icon" />
                  <span>Contact</span>
                </Link>
              </li>

              {isAuthenticated ? (
                <>
                  <li className="nav-item divider-wrapper">
                    <span className="nav-divider"></span>
                  </li>

                  {/* Search - Desktop */}
                  <li className="nav-item desktop-search">
                    <div className="search-wrapper">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="search-input"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.target.value) {
                            navigate(`/events?search=${e.target.value}`);
                            handleNavLinkClick();
                          }
                        }}
                      />
                    </div>
                  </li>

                  {/* Notifications */}
                  <li className="nav-item">
                    <button className="nav-icon-btn" aria-label="Notifications">
                      <FaBell />
                      <span className="notification-badge">3</span>
                    </button>
                  </li>

                  {/* Admin Panel */}
                  {isAdmin && (
                    <>
                      <li className="nav-item">
                        <Link
                          className="nav-link pro-nav-link admin-link"
                          to="/admin"
                          onClick={handleNavLinkClick}
                        >
                          <FaShieldAlt className="nav-icon" />
                          <span>Admin</span>
                          <FaCrown className="crown-icon" />
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="btn btn-create-event"
                          to="/create-event"
                          onClick={handleNavLinkClick}
                        >
                          <FaPlus className="btn-icon" />
                          <span>Create</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* User Section */}
                  <li className="nav-item user-section">
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-avatar-wrapper">
                          <div className="user-avatar">
                            {user?.name?.charAt(0) ||
                              user?.email?.charAt(0) ||
                              "U"}
                          </div>
                          {isAdmin && <div className="admin-dot"></div>}
                        </div>
                        <div className="user-details">
                          <span className="user-name">
                            {user?.name?.split(" ")[0] ||
                              user?.email?.split("@")[0] ||
                              "User"}
                          </span>
                          <span className="user-role">
                            {isAdmin ? "Administrator" : "Member"}
                          </span>
                        </div>
                      </div>
                      <div className="user-actions">
                        <Link
                          to="/dashboard"
                          className="btn btn-dashboard"
                          onClick={handleNavLinkClick}
                        >
                          <FaUser className="btn-icon" />
                          <span>Dashboard</span>
                        </Link>
                        <button
                          className="btn btn-logout"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="btn-icon" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item divider-wrapper">
                    <span className="nav-divider"></span>
                  </li>
                  <li className="nav-item auth-section">
                    <Link
                      className="btn btn-login"
                      to="/login"
                      onClick={handleNavLinkClick}
                    >
                      Sign In
                    </Link>
                    <Link
                      className="btn btn-register"
                      to="/register"
                      onClick={handleNavLinkClick}
                    >
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <style>{`
        /* ===== BASE NAVBAR ===== */
        .pro-navbar {
          background: rgba(10, 14, 30, 0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: sticky;
          top: 0;
          z-index: 1050;
          box-shadow: 0 1px 20px rgba(0, 0, 0, 0.3);
        }

        .pro-navbar.scrolled {
          background: rgba(10, 14, 30, 0.98);
          padding: 8px 0;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        /* ===== BRAND ===== */
        .pro-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-icon-wrapper {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: transform 0.3s ease;
        }

        .pro-brand:hover .brand-icon-wrapper {
          transform: rotate(-10deg) scale(1.05);
        }

        .brand-icon {
          color: white;
          font-size: 1.2rem;
        }

        .brand-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        /* ===== NAV LINKS ===== */
        .pro-nav-link {
          color: rgba(255, 255, 255, 0.7) !important;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 8px 16px !important;
          margin: 0 2px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
        }

        .pro-nav-link .nav-icon {
          font-size: 0.95rem;
          transition: transform 0.3s ease;
        }

        .pro-nav-link:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-1px);
        }

        .pro-nav-link:hover .nav-icon {
          transform: translateY(-2px) scale(1.1);
        }

        /* Active link */
        .pro-nav-link.active {
          color: #ffffff !important;
          background: rgba(102, 126, 234, 0.15);
        }

        /* Admin Link */
        .admin-link {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.15);
          position: relative;
          padding-right: 32px !important;
        }

        .admin-link:hover {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .crown-icon {
          color: #fbbf24;
          font-size: 0.8rem;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateY(-50%) scale(0.9); }
        }

        /* ===== DIVIDER ===== */
        .divider-wrapper {
          padding: 0 8px;
        }

        .nav-divider {
          display: block;
          width: 1px;
          height: 30px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent);
        }

        /* ===== SEARCH ===== */
        .desktop-search {
          padding: 0 8px;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
          pointer-events: none;
        }

        .search-input {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 30px;
          padding: 7px 16px 7px 38px;
          color: white;
          font-size: 0.85rem;
          width: 180px;
          transition: all 0.3s ease;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
          width: 220px;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.1);
        }

        /* ===== ICON BUTTONS ===== */
        .nav-icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .nav-icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-1px);
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(10, 14, 30, 0.92);
        }

        /* ===== CREATE EVENT BUTTON ===== */
        .btn-create-event {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white !important;
          border: none;
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-left: 4px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .btn-create-event:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
        }

        .btn-create-event .btn-icon {
          font-size: 0.8rem;
        }

        /* ===== USER SECTION ===== */
        .user-section {
          padding: 0 4px;
        }

        .user-dropdown {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 12px 4px 4px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.3s ease;
        }

        .user-info:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .user-avatar-wrapper {
          position: relative;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .admin-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 12px;
          height: 12px;
          background: #fbbf24;
          border-radius: 50%;
          border: 2px solid rgba(10, 14, 30, 0.92);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.8); opacity: 0.6; }
        }

        .user-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .user-name {
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .user-role {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .user-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-dashboard,
        .btn-logout {
          padding: 7px 14px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        .btn-dashboard {
          background: rgba(102, 126, 234, 0.15);
          color: #818cf8 !important;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .btn-dashboard:hover {
          background: rgba(102, 126, 234, 0.25);
          transform: translateY(-1px);
        }

        .btn-logout {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171 !important;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .btn-logout .btn-icon,
        .btn-dashboard .btn-icon {
          font-size: 0.75rem;
        }

        /* ===== AUTH SECTION (Non-logged in) ===== */
        .auth-section {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 4px;
        }

        .btn-login {
          background: transparent;
          color: rgba(255, 255, 255, 0.7) !important;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .btn-login:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white !important;
          transform: translateY(-1px);
        }

        .btn-register {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          padding: 8px 24px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-register:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
          color: white !important;
        }

        /* ===== MOBILE TOGGLER ===== */
        .pro-toggler {
          border: none;
          padding: 8px;
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 40px;
          height: 40px;
          justify-content: center;
          align-items: center;
        }

        .pro-toggler .toggler-line {
          display: block;
          width: 24px;
          height: 2px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .pro-toggler.active .toggler-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .pro-toggler.active .toggler-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .pro-toggler.active .toggler-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .pro-toggler:focus {
          box-shadow: none;
          outline: none;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 991px) {
          .pro-navbar {
            padding: 10px 0;
          }

          .pro-navbar.scrolled {
            padding: 6px 0;
          }

          .navbar-collapse {
            background: rgba(10, 14, 30, 0.98);
            padding: 20px;
            border-radius: 16px;
            margin-top: 12px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(20px);
          }

          .pro-nav-link {
            padding: 12px 16px !important;
            justify-content: center;
          }

          .divider-wrapper {
            display: none;
          }

          .desktop-search {
            width: 100%;
            padding: 4px 0 12px 0;
          }

          .search-wrapper {
            width: 100%;
          }

          .search-input {
            width: 100% !important;
            padding: 10px 16px 10px 40px;
          }

          .search-input:focus {
            width: 100% !important;
          }

          .nav-icon-btn {
            margin: 8px auto;
          }

          .btn-create-event {
            margin: 8px 0;
            justify-content: center;
            width: 100%;
          }

          .user-section {
            width: 100%;
            margin-top: 8px;
          }

          .user-dropdown {
            flex-direction: column;
            width: 100%;
            gap: 8px;
          }

          .user-info {
            width: 100%;
            justify-content: center;
            padding: 8px 16px;
          }

          .user-actions {
            width: 100%;
            flex-direction: column;
            gap: 8px;
          }

          .btn-dashboard,
          .btn-logout {
            width: 100%;
            justify-content: center;
            padding: 10px;
          }

          .auth-section {
            flex-direction: column;
            width: 100%;
            gap: 10px;
            padding: 8px 0;
          }

          .btn-login,
          .btn-register {
            width: 100%;
            text-align: center;
            justify-content: center;
            padding: 12px;
          }

          .admin-link {
            padding-right: 16px !important;
          }

          .crown-icon {
            position: static;
            transform: none;
          }

          .admin-link .crown-icon {
            animation: none;
          }
        }

        @media (max-width: 576px) {
          .brand-text {
            font-size: 1.2rem;
          }

          .brand-icon-wrapper {
            width: 32px;
            height: 32px;
          }

          .brand-icon-wrapper .brand-icon {
            font-size: 1rem;
          }

          .navbar-collapse {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
