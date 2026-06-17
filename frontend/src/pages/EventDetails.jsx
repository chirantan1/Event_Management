import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, createBooking } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTicketAlt,
  FaUser,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEventById(id);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      alert("Please login to book this event");
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    try {
      await createBooking({ eventId: id, quantity: quantity || 1 });
      alert("Booking confirmed successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    const maxCap = event.capacity || 10; // Default capacity fallback

    if (isNaN(val)) {
      setQuantity(""); // Allow user to clear the input
    } else {
      setQuantity(Math.min(maxCap, Math.max(1, val)));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <div className="error-icon">😕</div>
        <h2>Event not found</h2>
        <p>The event you are looking for doesn't exist or has been removed.</p>
        <button className="btn-primary" onClick={() => navigate("/events")}>
          <FaArrowLeft style={{ marginRight: "8px" }} /> Back to Events
        </button>
      </div>
    );
  }

  const price = event.price || 0;
  const maxCapacity = event.capacity || 10;
  const totalPrice = price * (quantity || 1);

  return (
    <div className="event-details-page">
      {/* Hero Banner Area */}
      <div className="event-banner">
        <div className="banner-overlay"></div>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="container">
        <div className="content-grid">
          {/* Main Content Column */}
          <div className="main-content">
            <div className="title-section">
              <span className="category-badge">
                {event.category || "General Event"}
              </span>
              <h1 className="event-title">{event.title}</h1>
            </div>

            <div className="info-cards">
              <div className="info-card">
                <div className="icon-wrapper blue">
                  <FaCalendarAlt />
                </div>
                <div className="info-text">
                  <h6>Date & Time</h6>
                  <p>{event.date || "Date TBA"}</p>
                  <p className="sub-text">
                    <FaClock className="inline-icon" />{" "}
                    {event.time || "Time TBA"}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="icon-wrapper red">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-text">
                  <h6>Location</h6>
                  <p>{event.location || "Location TBA"}</p>
                  <a href="#" className="map-link">
                    View on Map
                  </a>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3>
                <FaInfoCircle className="section-icon" /> About This Event
              </h3>
              <p className="description-text">
                {event.description || "No description provided for this event."}
              </p>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="sidebar">
            <div className="booking-card sticky-top">
              <div className="price-header">
                <h3>
                  {price === 0 ? (
                    "Free"
                  ) : (
                    <>
                      <FaDollarSign />
                      {price}
                    </>
                  )}
                </h3>
                <span>per ticket</span>
              </div>

              <div className="divider"></div>

              <div className="quantity-section">
                <label>
                  <FaTicketAlt className="inline-icon" /> Quantity
                </label>
                <input
                  type="number"
                  className="quantity-input"
                  min="1"
                  max={maxCapacity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={() => !quantity && setQuantity(1)} // Reset if left blank
                />
                <small>Maximum {maxCapacity} tickets available</small>
              </div>

              <div className="divider"></div>

              <div className="total-section">
                <span>Total Amount:</span>
                <span className="total-price">
                  {totalPrice === 0 ? "Free" : `$${totalPrice}`}
                </span>
              </div>

              <button
                className={`book-btn ${bookingLoading ? "loading" : ""}`}
                onClick={handleBooking}
                disabled={bookingLoading || quantity < 1}
              >
                {bookingLoading ? "Processing..." : "Book Tickets Now"}
              </button>

              <div className="secure-badge">
                <FaUser className="inline-icon" />
                <small>Secure booking guaranteed</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .event-details-page {
          min-height: 100vh;
          background: #f4f7f6;
          padding-bottom: 60px;
        }

        .event-banner {
          height: 250px;
          background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          position: relative;
          display: flex;
          align-items: flex-start;
          padding: 30px;
        }

        .banner-overlay {
          position: absolute;
          inset: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.05)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320Z"/></svg>')
            repeat-x bottom;
          background-size: cover;
        }

        .back-btn {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-3px);
        }

        .container {
          max-width: 1200px;
          margin: -80px auto 0;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 30px;
          align-items: start;
        }

        /* Main Content Styles */
        .main-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .category-badge {
          display: inline-block;
          background: #e1f0fa;
          color: #3498db;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .event-title {
          font-size: 36px;
          color: #2c3e50;
          margin: 0 0 30px;
          font-weight: 800;
          line-height: 1.2;
        }

        .info-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 15px;
          border: 1px solid #eee;
        }

        .icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .icon-wrapper.blue {
          background: #e1f0fa;
          color: #3498db;
        }

        .icon-wrapper.red {
          background: #fae1e1;
          color: #e74c3c;
        }

        .info-text h6 {
          margin: 0 0 5px;
          color: #7f8c8d;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-text p {
          margin: 0 0 5px;
          color: #2c3e50;
          font-weight: 600;
          font-size: 16px;
        }

        .info-text .sub-text {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 400;
        }

        .map-link {
          color: #3498db;
          font-size: 14px;
          text-decoration: none;
          font-weight: 500;
        }

        .map-link:hover {
          text-decoration: underline;
        }

        .description-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2c3e50;
          font-size: 22px;
          margin-bottom: 15px;
        }

        .section-icon {
          color: #3498db;
        }

        .description-text {
          color: #555;
          line-height: 1.8;
          font-size: 16px;
        }

        /* Sidebar Styles */
        .sticky-top {
          position: sticky;
          top: 30px;
        }

        .booking-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #eee;
        }

        .price-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .price-header h3 {
          font-size: 42px;
          color: #2c3e50;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .price-header span {
          color: #7f8c8d;
          font-size: 14px;
        }

        .divider {
          height: 1px;
          background: #eee;
          margin: 25px 0;
        }

        .quantity-section label {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 15px;
        }

        .inline-icon {
          margin-right: 8px;
          color: #7f8c8d;
        }

        .quantity-input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #eee;
          border-radius: 10px;
          font-size: 16px;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }

        .quantity-input:focus {
          outline: none;
          border-color: #3498db;
        }

        .quantity-section small {
          display: block;
          margin-top: 8px;
          color: #95a5a6;
          font-size: 13px;
        }

        .total-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }

        .total-price {
          font-size: 24px;
          color: #3498db;
        }

        .book-btn {
          width: 100%;
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
        }

        .book-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
        }

        .book-btn:disabled {
          background: #bdc3c7;
          box-shadow: none;
          cursor: not-allowed;
        }

        .secure-badge {
          text-align: center;
          margin-top: 15px;
          color: #7f8c8d;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Status States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        .error-container {
          text-align: center;
          padding: 80px 20px;
        }

        .error-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .btn-primary {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .sticky-top {
            position: static;
          }
          .container {
            margin-top: -50px;
          }
        }

        @media (max-width: 768px) {
          .event-title {
            font-size: 28px;
          }
          .info-cards {
            grid-template-columns: 1fr;
          }
          .main-content {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
}

export default EventDetails;
