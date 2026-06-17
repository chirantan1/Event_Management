// frontend/src/pages/Payment.jsx
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCreditCard,
  FaShieldAlt,
  FaLock,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, amount, serviceName, customerName, customerEmail } =
    location.state || {};
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Debug logging
  useEffect(() => {
    console.log("Payment page loaded with:", {
      bookingId,
      amount,
      serviceName,
      customerName,
    });
    if (!bookingId) {
      console.error("No bookingId provided in location state");
    }
  }, [bookingId, amount, serviceName, customerName]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const handlePayment = async () => {
    if (!bookingId) {
      setError("Booking information missing. Please go back and try again.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again to complete payment");
        navigate("/login");
        return;
      }

      console.log("Processing payment for booking:", bookingId);
      console.log("API URL:", `${API_URL}/bookings/${bookingId}/payment`);

      // Simulate payment processing (replace with actual payment gateway)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const paymentId =
        "PAY_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substr(2, 10).toUpperCase();

      console.log("Sending payment update with paymentId:", paymentId);

      // Update payment status in backend using PUT
      const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/payment`,
        {
          paymentStatus: "completed",
          paymentId: paymentId,
          amount: amount * 0.3, // Send the advance amount
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Payment response:", response.data);

      if (response.data.success) {
        setPaymentSuccess(true);
        localStorage.removeItem("lastBooking");
      } else {
        setError(response.data.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error details:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.response?.status === 404) {
        setError("Booking not found. Please check your booking and try again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to update this booking.");
      } else {
        setError(
          err.response?.data?.error ||
            "Payment processing failed. Please try again.",
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  // Rest of your component remains the same...
  if (paymentSuccess) {
    return (
      <div className="payment-success-page">
        <div className="success-container">
          <div className="success-icon">
            <FaCheckCircle />
          </div>
          <h1>Payment Successful!</h1>
          <p>
            Your booking has been confirmed. You will receive a confirmation
            email shortly.
          </p>
          <div className="success-details-card">
            <h3>Payment Details</h3>
            <div className="detail-row">
              <span>Booking ID:</span>
              <strong>{bookingId?.slice(-8)}</strong>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <strong>₹{formatPrice(amount * 0.3)}</strong>
            </div>
            <div className="detail-row">
              <span>Service:</span>
              <strong>{serviceName}</strong>
            </div>
          </div>
          <div className="success-actions">
            <Link to="/dashboard" className="btn-dashboard">
              Go to Dashboard
            </Link>
            <Link to="/events" className="btn-browse">
              Browse More Services
            </Link>
          </div>
        </div>

        <style>{`
          .payment-success-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
          }
          .success-container {
            max-width: 500px;
            background: white;
            border-radius: 30px;
            padding: 50px;
            text-align: center;
            animation: slideUp 0.5s ease;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          .success-icon svg {
            font-size: 45px;
            color: white;
          }
          .success-container h1 {
            font-size: 28px;
            font-weight: 800;
            color: #1a202c;
            margin: 0 0 12px;
          }
          .success-container p {
            color: #6b7280;
            margin-bottom: 24px;
          }
          .success-details-card {
            background: #f7fafc;
            border-radius: 16px;
            padding: 20px;
            text-align: left;
            margin-bottom: 24px;
          }
          .success-details-card h3 {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 16px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .success-actions {
            display: flex;
            gap: 16px;
          }
          .btn-dashboard, .btn-browse {
            flex: 1;
            padding: 12px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
          }
          .btn-dashboard {
            background: #4f46e5;
            color: white;
          }
          .btn-browse {
            background: #f1f5f9;
            color: #334155;
          }
          @media (max-width: 640px) {
            .success-container { padding: 32px 24px; }
            .success-actions { flex-direction: column; }
          }
        `}</style>
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="payment-error-page">
        <div className="error-container">
          <h2>Missing Booking Information</h2>
          <p>Unable to process payment. Please go back and try again.</p>
          <Link to="/dashboard" className="back-btn">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <Link to="/dashboard" className="back-link">
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <div className="payment-card">
          <div className="payment-header">
            <h1>Complete Payment</h1>
            <p>Secure payment to confirm your booking</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-row">
              <span>Booking ID</span>
              <strong>{bookingId?.slice(-8)}</strong>
            </div>
            <div className="summary-row">
              <span>Service</span>
              <strong>{serviceName}</strong>
            </div>
            <div className="summary-row">
              <span>Customer</span>
              <strong>{customerName}</strong>
            </div>
            <div className="summary-row total">
              <span>Advance Amount (30%)</span>
              <strong>₹{formatPrice(amount * 0.3)}</strong>
            </div>
            <div className="summary-row">
              <span>Balance Amount</span>
              <strong>₹{formatPrice(amount * 0.7)}</strong>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="method-card selected">
              <FaCreditCard />
              <div>
                <strong>Credit / Debit Card</strong>
                <p>Pay securely with your card</p>
              </div>
              <span className="radio selected"></span>
            </div>
          </div>

          <div className="security-note">
            <FaLock />
            <span>Your payment is secure and encrypted</span>
          </div>

          <button
            onClick={handlePayment}
            className="pay-now-button"
            disabled={processing}
          >
            {processing ? (
              <>
                <FaSpinner className="spinner" /> Processing...
              </>
            ) : (
              <>Pay ₹{formatPrice(amount * 0.3)} (Advance)</>
            )}
          </button>

          <div className="trust-badges">
            <div className="trust">
              <FaShieldAlt /> Secure Payment
            </div>
            <div className="trust">
              <FaLock /> 256-bit SSL
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .payment-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 40px 20px;
        }
        .payment-container {
          max-width: 550px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: white;
          text-decoration: none;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.2);
          padding: 10px 20px;
          border-radius: 10px;
        }
        .payment-card {
          background: white;
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
        }
        .payment-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .payment-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #1a202c;
          margin: 0 0 8px;
        }
        .payment-header p {
          color: #6b7280;
        }
        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 20px;
          text-align: center;
        }
        .booking-summary {
          background: #f7fafc;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .booking-summary h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 16px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .summary-row.total {
          border-top: 2px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 8px;
          font-size: 18px;
        }
        .summary-row.total strong {
          color: #059669;
          font-size: 22px;
        }
        .payment-methods h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 16px;
        }
        .method-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          margin-bottom: 12px;
        }
        .method-card.selected {
          border-color: #4f46e5;
          background: #f5f3ff;
        }
        .method-card svg {
          font-size: 24px;
          color: #4f46e5;
        }
        .method-card div {
          flex: 1;
        }
        .method-card strong {
          display: block;
          font-size: 14px;
        }
        .method-card p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        .radio {
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e1;
          border-radius: 50%;
        }
        .radio.selected {
          border-color: #4f46e5;
          background: #4f46e5;
          box-shadow: inset 0 0 0 4px white;
        }
        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 20px 0;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          font-size: 13px;
          color: #4a5568;
        }
        .pay-now-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .pay-now-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(16,185,129,0.3);
        }
        .pay-now-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 24px;
        }
        .trust {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }
        .payment-error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }
        .error-container {
          background: white;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .payment-card { padding: 24px; }
          .payment-header h1 { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}

export default Payment;
