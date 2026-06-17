// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  FaTicketAlt,
  FaCalendarCheck,
  FaUser,
  FaRupeeSign,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0,
  });
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your bookings");
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Dashboard API Response:", response.data);

      let bookingsData = [];
      if (response.data && response.data.success && response.data.bookings) {
        bookingsData = response.data.bookings;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.data && response.data.data) {
        bookingsData = response.data.data;
      } else {
        bookingsData = [];
      }

      setBookings(bookingsData);

      // Calculate stats
      const totalBookings = bookingsData.length;
      const confirmedBookings = bookingsData.filter(
        (b) => b.status === "confirmed",
      ).length;
      const pendingBookings = bookingsData.filter(
        (b) => b.status === "pending",
      ).length;
      const totalSpent = bookingsData
        .filter((b) => b.paymentStatus === "completed")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalSpent,
      });

      setError("");
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(
        error.response?.data?.error ||
          "Failed to load your bookings. Please try again later.",
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="badge confirmed">
            <FaCheckCircle /> Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="badge pending">
            <FaClock /> Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="badge cancelled">
            <FaTimesCircle /> Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="badge completed">
            <FaCheckCircle /> Completed
          </span>
        );
      default:
        return <span className="badge pending">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="payment-badge paid">Paid</span>;
      case "pending":
        return <span className="payment-badge pending-payment">Pending</span>;
      case "failed":
        return <span className="payment-badge failed">Failed</span>;
      default:
        return <span className="payment-badge pending-payment">{status}</span>;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const handlePayNow = (booking) => {
    navigate("/payment", {
      state: {
        bookingId: booking._id,
        amount: booking.totalAmount,
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
      },
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, {user?.name || "User"}!</p>
        </div>

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={fetchBookings}>Retry</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <FaTicketAlt />
            </div>
            <div className="stat-info">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>{stats.confirmedBookings}</h3>
              <p>Confirmed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">
              <FaClock />
            </div>
            <div className="stat-info">
              <h3>{stats.pendingBookings}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">
              <FaRupeeSign />
            </div>
            <div className="stat-info">
              <h3>₹{formatPrice(stats.totalSpent)}</h3>
              <p>Total Spent</p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h3>{user?.name || "User"}</h3>
              <p>{user?.email || "No email"}</p>
              <small>
                Member since:{" "}
                {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
              </small>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bookings-section">
          <div className="section-header">
            <h2>My Bookings</h2>
            <Link to="/events" className="browse-btn">
              + Book New Service
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No Bookings Yet</h3>
              <p>
                You haven't made any bookings yet. Browse our services and book
                your first event!
              </p>
              <Link to="/events" className="btn-primary">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div className="booking-card" key={booking._id}>
                  <div className="booking-header-row">
                    <div className="booking-service">
                      <h3>{booking.serviceName}</h3>
                      <p className="provider">by {booking.providerName}</p>
                    </div>
                    <div className="booking-badges">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>{formatDate(booking.eventDate)}</span>
                    </div>
                    <div className="detail-item">
                      <FaUsers />
                      <span>{booking.guestCount} guests</span>
                    </div>
                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <span>{booking.city || "Location not specified"}</span>
                    </div>
                    <div className="detail-item">
                      <FaRupeeSign />
                      <span>Total: ₹{formatPrice(booking.totalAmount)}</span>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="special-requests">
                      <strong>Special Requests:</strong>
                      <p>{booking.specialRequests}</p>
                    </div>
                  )}

                  <div className="booking-footer">
                    <div className="booking-meta">
                      <small>Booked on: {formatDate(booking.createdAt)}</small>
                      <small>Booking ID: {booking._id?.slice(-8)}</small>
                    </div>
                    {booking.paymentStatus === "pending" &&
                      booking.status !== "cancelled" && (
                        <button
                          onClick={() => handlePayNow(booking)}
                          className="pay-now-btn"
                        >
                          Pay Now <FaArrowRight />
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 40px 0;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .dashboard-header h1 {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px 0;
        }

        .dashboard-header p {
          font-size: 16px;
          color: #4a5568;
        }

        .error-alert {
          background: #fed7d7;
          color: #c53030;
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-alert button {
          background: #c53030;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-icon.blue {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .stat-icon.green {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .stat-icon.orange {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .stat-icon.purple {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .stat-info h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1a202c;
        }

        .stat-info p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .profile-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-avatar {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
        }

        .profile-info h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          color: #1a202c;
        }

        .profile-info p {
          margin: 0 0 4px 0;
          color: #718096;
        }

        .profile-info small {
          color: #a0aec0;
          font-size: 12px;
        }

        .bookings-section {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .browse-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .browse-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 24px;
          color: #1a202c;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          color: #718096;
          margin-bottom: 24px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 30px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .booking-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .booking-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .booking-service h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1a202c;
        }

        .provider {
          font-size: 13px;
          color: #718096;
          margin: 0;
        }

        .booking-badges {
          display: flex;
          gap: 10px;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .badge.confirmed {
          background: #d1fae5;
          color: #065f46;
        }

        .badge.pending {
          background: #fed7aa;
          color: #92400e;
        }

        .badge.cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge.completed {
          background: #dbeafe;
          color: #1e40af;
        }

        .payment-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .payment-badge.paid {
          background: #d1fae5;
          color: #065f46;
        }

        .payment-badge.pending-payment {
          background: #fed7aa;
          color: #92400e;
        }

        .payment-badge.failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .booking-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 16px;
          padding: 12px 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4a5568;
        }

        .detail-item svg {
          color: #667eea;
        }

        .special-requests {
          margin-bottom: 16px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 10px;
        }

        .special-requests strong {
          font-size: 12px;
          color: #718096;
          display: block;
          margin-bottom: 6px;
        }

        .special-requests p {
          font-size: 13px;
          color: #4a5568;
          margin: 0;
        }

        .booking-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .booking-meta {
          display: flex;
          gap: 16px;
        }

        .booking-meta small {
          font-size: 11px;
          color: #a0aec0;
        }

        .pay-now-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 8px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          border: none;
        }

        .pay-now-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
        }

        .dashboard-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .booking-header-row {
            flex-direction: column;
          }

          .booking-details {
            flex-direction: column;
            gap: 10px;
          }

          .booking-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .booking-meta {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
