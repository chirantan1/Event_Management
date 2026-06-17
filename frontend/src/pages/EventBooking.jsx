// frontend/src/pages/EventBooking.jsx
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaUsers,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaComment,
  FaCheckCircle,
  FaArrowLeft,
  FaSpinner,
  FaTicketAlt,
} from "react-icons/fa";

function EventBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventDate: "",
    guestCount: 1,
    specialRequests: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const eventData = location.state?.event;
    if (eventData) {
      setEvent(eventData);
      setFormData((prev) => ({
        ...prev,
        eventDate: eventData.date || "",
        customerName:
          JSON.parse(localStorage.getItem("user") || "{}").name || "",
        customerEmail:
          JSON.parse(localStorage.getItem("user") || "{}").email || "",
        customerPhone:
          JSON.parse(localStorage.getItem("user") || "{}").phone || "",
      }));
      setLoading(false);
    } else {
      setError("No event selected. Please choose an event.");
      setTimeout(() => navigate("/events"), 3000);
      setLoading(false);
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotalAmount = () => {
    if (!event) return 0;
    return (event.price || 0) * formData.guestCount;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate required fields
    if (!formData.customerName.trim()) {
      setError("Please enter your full name");
      setSubmitting(false);
      return;
    }
    if (!formData.customerEmail.trim()) {
      setError("Please enter your email address");
      setSubmitting(false);
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError("Please enter your phone number");
      setSubmitting(false);
      return;
    }
    if (!formData.eventDate) {
      setError("Please select event date");
      setSubmitting(false);
      return;
    }
    if (!formData.guestCount || formData.guestCount < 1) {
      setError("Please enter number of guests");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to continue");
        setTimeout(() => navigate("/login"), 2000);
        setSubmitting(false);
        return;
      }

      const bookingData = {
        eventId: event._id,
        eventName: event.title,
        eventCategory: event.category,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        eventDate: formData.eventDate,
        guestCount: parseInt(formData.guestCount),
        specialRequests: formData.specialRequests,
        totalAmount: calculateTotalAmount(),
        location: event.location,
        pricePerPerson: event.price || 0,
      };

      console.log("Submitting booking data:", bookingData);

      const response = await axios.post(
        `${API_URL}/event-bookings`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setBookingId(response.data.booking._id);
        setBookingSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        setError(response.data.error || "Failed to create booking");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to create booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
        }}
      >
        <div className="spinner-border text-white" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (bookingSubmitted) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0 rounded-4 text-center p-5">
              <div className="text-success mb-4">
                <FaCheckCircle size={80} />
              </div>
              <h2 className="mb-3">Booking Confirmed! 🎉</h2>
              <p className="text-muted mb-4">
                Your booking has been successfully created.
              </p>
              <div className="alert alert-info">
                <strong>Booking ID:</strong> {bookingId?.slice(-8)}
              </div>
              <div className="mt-4">
                <Link to="/dashboard" className="btn btn-primary me-3">
                  View My Bookings
                </Link>
                <Link to="/events" className="btn btn-outline-secondary">
                  Browse More Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/events" className="btn btn-outline-secondary mb-4">
        <FaArrowLeft /> Back to Events
      </Link>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="mb-0">Book Your Tickets</h3>
            </div>
            <div className="card-body p-4">
              {/* Event Summary */}
              {event && (
                <div className="event-summary mb-4 p-3 bg-light rounded-3">
                  <h4>{event.title}</h4>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p>
                        <FaCalendarAlt className="me-2 text-primary" />{" "}
                        {event.date} at {event.time}
                      </p>
                      <p>
                        <FaMapMarkerAlt className="me-2 text-danger" />{" "}
                        {event.location}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <FaRupeeSign className="me-2 text-success" /> Price: ₹
                        {event.price?.toLocaleString()}
                      </p>
                      <p>
                        <FaTicketAlt className="me-2 text-info" /> Category:{" "}
                        {event.category}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      className="form-control"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      className="form-control"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      className="form-control"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Event Date *</label>
                    <input
                      type="date"
                      name="eventDate"
                      className="form-control"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Number of Tickets *</label>
                    <input
                      type="number"
                      name="guestCount"
                      className="form-control"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      min="1"
                      max={event?.capacity || 100}
                      required
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      className="form-control"
                      rows="3"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Any special requirements?"
                    />
                  </div>
                </div>

                <div className="total-section p-3 bg-success text-white rounded-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Total Amount:</h5>
                    <h3 className="mb-0">
                      ₹{formatPrice(calculateTotalAmount())}
                    </h3>
                  </div>
                  <small>
                    Advance payment (30%): ₹
                    {formatPrice(calculateTotalAmount() * 0.3)}
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventBooking;
