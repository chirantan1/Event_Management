// frontend/src/pages/Booking.jsx
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaStar,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaClock,
  FaUsers,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaComment,
  FaCheckCircle,
  FaArrowLeft,
  FaWhatsapp,
  FaCreditCard,
  FaShieldAlt,
  FaHeadset,
  FaSpinner,
  FaTicketAlt,
} from "react-icons/fa";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "birthday",
    guestCount: "",
    specialRequests: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const serviceData = location.state?.service;
    if (serviceData) {
      setService(serviceData);
      setLoading(false);
    } else {
      const storedService = sessionStorage.getItem("selectedService");
      if (storedService && storedService !== "undefined") {
        try {
          const parsedService = JSON.parse(storedService);
          if (parsedService && parsedService._id) {
            setService(parsedService);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing stored service:", e);
        }
      }
      setError(
        "No service selected. Please choose a service from the events page.",
      );
      setTimeout(() => navigate("/events"), 3000);
      setLoading(false);
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotalAmount = () => {
    let total = service?.basePrice || 0;
    if (service?.pricePerPerson > 0 && formData.guestCount) {
      total += service.pricePerPerson * parseInt(formData.guestCount);
    }
    return total;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to continue");
        sessionStorage.setItem(
          "pendingBooking",
          JSON.stringify({
            service,
            formData,
            totalAmount: calculateTotalAmount(),
          }),
        );
        setTimeout(() => navigate("/login"), 2000);
        setSubmitting(false);
        return;
      }

      const bookingData = {
        serviceId: service._id,
        serviceName: service.businessName,
        serviceType: service.serviceType,
        providerName: service.providerName,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        eventDate: formData.eventDate,
        eventType: formData.eventType,
        guestCount: parseInt(formData.guestCount),
        specialRequests: formData.specialRequests,
        basePrice: service.basePrice,
        pricePerPerson: service.pricePerPerson || 0,
        totalAmount: calculateTotalAmount(),
      };

      const response = await axios.post(
        `${API_URL}/bookings/create`,
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
        sessionStorage.removeItem("selectedService");
        sessionStorage.removeItem("pendingBooking");
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

  const handleProceedToPayment = () => {
    navigate("/payment", {
      state: {
        bookingId: bookingId,
        amount: calculateTotalAmount(),
        serviceName: service?.businessName,
        customerName: formData.name,
        customerEmail: formData.email,
      },
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255,255,255,0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        ></div>
        <p style={{ color: "white", marginLeft: "20px" }}>
          Loading service details...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "48px",
            textAlign: "center",
            maxWidth: "450px",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
          <h2
            style={{ fontSize: "24px", color: "#1a202c", marginBottom: "12px" }}
          >
            {error}
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Redirecting you to the events page...
          </p>
          <Link
            to="/events"
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              padding: "12px 30px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Go to Events Now
          </Link>
        </div>
      </div>
    );
  }

  if (bookingSubmitted) {
    return (
      <>
        <div className="booking-success-container-custom">
          <div className="success-card-custom">
            {/* Success Animation */}
            <div className="success-icon-custom">
              <div className="success-circle-custom">
                <FaCheckCircle />
              </div>
            </div>

            <h1 className="success-title-custom">Booking Confirmed!</h1>
            <p className="success-message-custom">
              Your booking request has been sent successfully
            </p>

            {/* Booking ID Card */}
            <div className="booking-id-card-custom">
              <FaTicketAlt className="id-icon-custom" />
              <div>
                <span className="id-label-custom">Booking Reference ID</span>
                <strong className="id-number-custom">
                  {bookingId?.slice(-8)}
                </strong>
              </div>
            </div>

            {/* Service Provider Info */}
            <div className="provider-section-custom">
              <img
                src={
                  service?.images?.[0] ||
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=100"
                }
                alt={service?.businessName}
                className="provider-image-custom"
              />
              <div>
                <h3 className="provider-name-custom">
                  {service?.businessName}
                </h3>
                <p className="provider-desc-custom">{service?.providerName}</p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="summary-section-custom">
              <h3 className="summary-title-custom">Booking Summary</h3>
              <div className="summary-list-custom">
                <div className="summary-item-custom">
                  <span>Event Date</span>
                  <strong>
                    {new Date(formData.eventDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                <div className="summary-item-custom">
                  <span>Event Type</span>
                  <strong>
                    {formData.eventType.charAt(0).toUpperCase() +
                      formData.eventType.slice(1)}
                  </strong>
                </div>
                <div className="summary-item-custom">
                  <span>Number of Guests</span>
                  <strong>{formData.guestCount} people</strong>
                </div>
                <div className="summary-item-custom">
                  <span>Location</span>
                  <strong>{service?.city}</strong>
                </div>
                <div className="summary-item-custom total-item-custom">
                  <span>Total Amount</span>
                  <strong>₹{formatPrice(calculateTotalAmount())}</strong>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="payment-section-custom">
              <h4>💳 Payment Required</h4>
              <div className="payment-details-custom">
                <div className="payment-box-custom">
                  <span>Advance Payment (30%)</span>
                  <strong>₹{formatPrice(calculateTotalAmount() * 0.3)}</strong>
                </div>
                <div className="payment-box-custom">
                  <span>Balance to be paid</span>
                  <strong>₹{formatPrice(calculateTotalAmount() * 0.7)}</strong>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="next-steps-custom">
              <h4>📋 What happens next?</h4>
              <ul>
                <li>✓ Complete payment to confirm your booking</li>
                <li>✓ You'll receive a confirmation email with details</li>
                <li>
                  ✓ The service provider will contact you within{" "}
                  {service?.responseTime || "24 hours"}
                </li>
                <li>✓ Balance payment can be made on the event day</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons-custom">
              <Link to="/events" className="browse-btn-custom">
                Browse More Services
              </Link>
              <button
                onClick={handleProceedToPayment}
                className="payment-btn-custom"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        </div>

        <style>{`
          /* Success Confirmation Page Styles */
          .booking-success-container-custom {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 60px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          }

          .success-card-custom {
            max-width: 650px;
            width: 100%;
            background: #ffffff;
            border-radius: 40px;
            padding: 50px 45px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
            animation: fadeInUp 0.6s ease-out;
            margin: 0 auto;
            box-sizing: border-box;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .success-icon-custom {
            text-align: center;
            margin-bottom: 25px;
          }

          .success-circle-custom {
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.5s ease;
          }

          .success-circle-custom svg {
            font-size: 55px;
            color: white;
          }

          .success-title-custom {
            font-size: 32px;
            font-weight: 800;
            text-align: center;
            color: #1a202c;
            margin: 0 0 12px 0;
          }

          .success-message-custom {
            text-align: center;
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 35px;
          }

          .booking-id-card-custom {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 20px;
            padding: 18px 22px;
            display: flex;
            align-items: center;
            gap: 18px;
            margin-bottom: 25px;
            border: 1px solid #e2e8f0;
          }

          .id-icon-custom {
            font-size: 38px;
            color: #4f46e5;
          }

          .id-label-custom {
            display: block;
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
          }

          .id-number-custom {
            font-size: 22px;
            font-weight: 800;
            color: #1a202c;
            letter-spacing: 1px;
          }

          .provider-section-custom {
            display: flex;
            align-items: center;
            gap: 18px;
            padding: 18px;
            background: #f8fafc;
            border-radius: 20px;
            margin-bottom: 30px;
          }

          .provider-image-custom {
            width: 65px;
            height: 65px;
            border-radius: 16px;
            object-fit: cover;
          }

          .provider-name-custom {
            font-size: 18px;
            font-weight: 800;
            color: #1a202c;
            margin: 0 0 6px 0;
          }

          .provider-desc-custom {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
          }

          .summary-section-custom {
            margin-bottom: 28px;
          }

          .summary-title-custom {
            font-size: 18px;
            font-weight: 800;
            color: #1a202c;
            margin: 0 0 18px 0;
          }

          .summary-list-custom {
            background: #f8fafc;
            border-radius: 20px;
            padding: 5px 20px;
          }

          .summary-item-custom {
            display: flex;
            justify-content: space-between;
            padding: 14px 0;
            border-bottom: 1px solid #e2e8f0;
          }

          .summary-item-custom:last-child {
            border-bottom: none;
          }

          .summary-item-custom span {
            color: #6b7280;
            font-size: 14px;
          }

          .summary-item-custom strong {
            color: #1a202c;
            font-size: 15px;
            font-weight: 600;
          }

          .total-item-custom {
            border-top: 2px solid #e2e8f0;
            margin-top: 5px;
            padding-top: 18px;
          }

          .total-item-custom strong {
            font-size: 20px;
            color: #059669;
            font-weight: 800;
          }

          .payment-section-custom {
            background: #fef3c7;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 25px;
          }

          .payment-section-custom h4 {
            font-size: 15px;
            font-weight: 800;
            color: #92400e;
            margin: 0 0 15px 0;
          }

          .payment-details-custom {
            display: flex;
            gap: 15px;
          }

          .payment-box-custom {
            flex: 1;
            background: white;
            padding: 14px;
            border-radius: 14px;
            text-align: center;
          }

          .payment-box-custom span {
            display: block;
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 6px;
          }

          .payment-box-custom strong {
            font-size: 18px;
            color: #059669;
            font-weight: 800;
          }

          .next-steps-custom {
            background: #eff6ff;
            border-radius: 20px;
            padding: 22px;
            margin-bottom: 35px;
          }

          .next-steps-custom h4 {
            font-size: 15px;
            font-weight: 800;
            color: #1e40af;
            margin: 0 0 14px 0;
          }

          .next-steps-custom ul {
            margin: 0;
            padding-left: 22px;
          }

          .next-steps-custom li {
            font-size: 13px;
            color: #1e3a8a;
            margin-bottom: 10px;
          }

          .action-buttons-custom {
            display: flex;
            gap: 16px;
          }

          .browse-btn-custom {
            flex: 1;
            padding: 14px 20px;
            background: #f1f5f9;
            color: #334155;
            text-decoration: none;
            text-align: center;
            border-radius: 16px;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.3s ease;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            display: inline-block;
          }

          .browse-btn-custom:hover {
            background: #e2e8f0;
            transform: translateY(-2px);
          }

          .payment-btn-custom {
            flex: 1;
            padding: 14px 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .payment-btn-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
          }

          /* Responsive */
          @media (max-width: 768px) {
            .success-card-custom {
              padding: 30px 25px;
            }
            .success-title-custom {
              font-size: 24px;
            }
            .payment-details-custom {
              flex-direction: column;
              gap: 12px;
            }
            .action-buttons-custom {
              flex-direction: column;
            }
            .summary-item-custom {
              flex-direction: column;
              gap: 6px;
            }
          }

          @media (max-width: 480px) {
            .success-card-custom {
              padding: 25px 20px;
            }
            .booking-id-card-custom {
              flex-direction: column;
              text-align: center;
            }
            .provider-section-custom {
              flex-direction: column;
              text-align: center;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <div className="booking-page-main">
      <div className="booking-container-main">
        <Link to="/events" className="back-link-main">
          <FaArrowLeft /> Back to Services
        </Link>

        <div className="booking-header-main">
          <h1>Complete Your Booking</h1>
          <p>Fill in the details to request this service</p>
        </div>

        {error && <div className="error-message-main">{error}</div>}

        <div className="booking-grid-main">
          <div className="service-details-card-main">
            <div className="service-image-main">
              <img
                src={
                  service?.images?.[0] ||
                  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400"
                }
                alt={service?.businessName}
              />
              {service?.featured && (
                <span className="featured-badge-main">Featured</span>
              )}
            </div>
            <div className="service-info-main">
              <h2 className="service-name-main">{service?.businessName}</h2>
              <p className="service-provider-main">
                by {service?.providerName}
              </p>
              <div className="service-rating-main">
                <FaStar className="star-icon-main" />
                <span className="rating-value-main">
                  {service?.averageRating}
                </span>
                <span className="rating-count-main">
                  ({service?.totalReviews} reviews)
                </span>
              </div>
              <p className="service-description-main">{service?.description}</p>
              <div className="service-features-main">
                <div className="feature-main">
                  <FaMapMarkerAlt className="feature-icon-main" />
                  <div>
                    <strong>Location</strong>
                    <span>
                      {service?.city} - {service?.area}
                    </span>
                  </div>
                </div>
                <div className="feature-main">
                  <FaUsers className="feature-icon-main" />
                  <div>
                    <strong>Max Capacity</strong>
                    <span>{service?.maxCapacity} guests</span>
                  </div>
                </div>
                <div className="feature-main">
                  <FaClock className="feature-icon-main" />
                  <div>
                    <strong>Response Time</strong>
                    <span>{service?.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="booking-form-card-main">
            <h2>Booking Details</h2>
            <p className="form-subtitle-main">
              Please fill in your information
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group-main">
                <label>
                  <FaUser className="input-icon-main" /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-row-main">
                <div className="form-group-main">
                  <label>
                    <FaEnvelope className="input-icon-main" /> Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="form-group-main">
                  <label>
                    <FaPhone className="input-icon-main" /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div className="form-row-main">
                <div className="form-group-main">
                  <label>
                    <FaCalendarAlt className="input-icon-main" /> Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-group-main">
                  <label>Event Type *</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="birthday">Birthday Party</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="baby-shower">Baby Shower</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group-main">
                <label>
                  <FaUsers className="input-icon-main" /> Number of Guests *
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max={service?.maxCapacity}
                  placeholder="Enter number of guests"
                />
                {service?.maxCapacity && (
                  <small>Maximum capacity: {service.maxCapacity} guests</small>
                )}
              </div>
              <div className="form-group-main">
                <label>
                  <FaComment className="input-icon-main" /> Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any specific requirements or questions..."
                />
              </div>
              <div className="price-calculator-main">
                <h4>Price Summary</h4>
                <div className="price-breakdown-main">
                  <div className="breakdown-item-main">
                    <span>Base Price:</span>
                    <span>₹{formatPrice(service?.basePrice)}</span>
                  </div>
                  {service?.pricePerPerson > 0 && formData.guestCount && (
                    <div className="breakdown-item-main">
                      <span>Per Person ({formData.guestCount} guests):</span>
                      <span>
                        ₹
                        {formatPrice(
                          service.pricePerPerson *
                            parseInt(formData.guestCount),
                        )}
                      </span>
                    </div>
                  )}
                  <div className="breakdown-item-main total-item-main">
                    <span>Total Amount:</span>
                    <strong>₹{formatPrice(calculateTotalAmount())}</strong>
                  </div>
                </div>
                <p className="price-note-main">
                  * Pay 30% advance to confirm your booking
                </p>
              </div>
              <div className="form-actions-main">
                <Link to="/events" className="cancel-btn-main">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="submit-btn-main"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-main" /> Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="trust-section-main">
          <div className="trust-item-main">
            <FaShieldAlt />
            <div>
              <strong>Verified Vendors</strong>
              <span>All vendors verified</span>
            </div>
          </div>
          <div className="trust-item-main">
            <FaWhatsapp />
            <div>
              <strong>24/7 Support</strong>
              <span>Connect anytime</span>
            </div>
          </div>
          <div className="trust-item-main">
            <FaCreditCard />
            <div>
              <strong>Secure Payment</strong>
              <span>100% secure</span>
            </div>
          </div>
          <div className="trust-item-main">
            <FaHeadset />
            <div>
              <strong>Best Price</strong>
              <span>Competitive pricing</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .booking-page-main {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 0;
        }
        .booking-container-main { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
        .back-link-main { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 12px; text-decoration: none; color: white; margin-bottom: 24px; }
        .booking-header-main { text-align: center; margin-bottom: 40px; }
        .booking-header-main h1 { font-size: 42px; font-weight: 800; color: white; margin: 0 0 12px; }
        .booking-header-main p { font-size: 18px; color: rgba(255,255,255,0.9); }
        .error-message-main { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
        .booking-grid-main { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 48px; }
        
        .service-details-card-main { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); position: sticky; top: 20px; }
        .service-image-main { position: relative; height: 280px; }
        .service-image-main img { width: 100%; height: 100%; object-fit: cover; }
        .featured-badge-main { position: absolute; top: 16px; right: 16px; background: #fbbf24; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .service-info-main { padding: 28px; }
        .service-name-main { font-size: 24px; font-weight: 800; margin: 0 0 8px; }
        .service-provider-main { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
        .service-rating-main { display: flex; align-items: center; gap: 8px; background: #f7fafc; padding: 8px 16px; border-radius: 30px; width: fit-content; margin-bottom: 20px; }
        .star-icon-main { color: #fbbf24; }
        .service-description-main { font-size: 14px; color: #4a5568; line-height: 1.6; margin-bottom: 24px; }
        .service-features-main { display: flex; flex-direction: column; gap: 16px; }
        .feature-main { display: flex; align-items: center; gap: 12px; padding: 10px; background: #f7fafc; border-radius: 12px; }
        .feature-icon-main { font-size: 18px; color: #4f46e5; }
        
        .booking-form-card-main { background: white; border-radius: 24px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .booking-form-card-main h2 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
        .form-subtitle-main { color: #6b7280; margin-bottom: 28px; }
        .form-group-main { margin-bottom: 20px; }
        .form-group-main label { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 8px; }
        .input-icon-main { color: #4f46e5; }
        .form-group-main input, .form-group-main textarea, .form-group-main select { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 14px; }
        .form-group-main input:focus, .form-group-main textarea:focus, .form-group-main select:focus { outline: none; border-color: #4f46e5; }
        .form-row-main { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .price-calculator-main { background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; border-radius: 20px; margin: 24px 0; color: white; }
        .price-calculator-main h4 { margin-bottom: 16px; }
        .breakdown-item-main { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-item-main { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 12px; margin-top: 8px; font-weight: 700; }
        .price-note-main { font-size: 12px; opacity: 0.9; margin-top: 12px; }
        .form-actions-main { display: flex; gap: 16px; margin-top: 24px; }
        .cancel-btn-main { flex: 1; padding: 14px; background: #f1f5f9; text-align: center; text-decoration: none; border-radius: 12px; color: #334155; font-weight: 600; }
        .submit-btn-main { flex: 2; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .submit-btn-main:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner-main { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .trust-section-main { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; background: rgba(255,255,255,0.1); padding: 32px; border-radius: 24px; backdrop-filter: blur(10px); color: white; margin-top: 48px; }
        .trust-item-main { display: flex; align-items: center; gap: 14px; }
        .trust-item-main svg { font-size: 28px; }

        @media (max-width: 1024px) {
          .booking-grid-main { grid-template-columns: 1fr; }
          .service-details-card-main { position: static; }
          .trust-section-main { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .booking-container-main { padding: 0 16px; }
          .booking-header-main h1 { font-size: 28px; }
          .form-row-main { grid-template-columns: 1fr; }
          .trust-section-main { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default Booking;
