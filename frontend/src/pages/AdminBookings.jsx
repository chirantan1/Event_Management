// frontend/src/pages/AdminBookings.jsx
import { useEffect, useState } from "react";
import {
  FaEye,
  FaTimes,
  FaCheck,
  FaEnvelope,
  FaFilePdf,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import {
  getAllAdminBookings,
  updateAdminBookingStatus,
  sendInvoiceEmail,
  downloadInvoicePDF,
} from "../services/api";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filter, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        "Fetching bookings with filter:",
        filter,
        "search:",
        searchTerm,
      );

      const response = await getAllAdminBookings({
        status: filter,
        search: searchTerm,
      });
      console.log("API Response:", response);

      if (response && response.data) {
        if (response.data.success) {
          setBookings(response.data.bookings || []);
        } else {
          setError(response.data.error || "Failed to fetch bookings");
        }
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to load bookings",
      );
      if (error.response?.status === 403) {
        setError(
          "Admin access required. You don't have permission to view all bookings.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to change this booking status to ${newStatus}?`,
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      await updateAdminBookingStatus(bookingId, newStatus);
      alert(`Booking ${newStatus} successfully!`);
      fetchBookings();
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.error || "Failed to update booking status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendInvoice = async (bookingId) => {
    try {
      setUpdating(true);
      await sendInvoiceEmail(bookingId);
      alert("Invoice sent successfully!");
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert(error.response?.data?.error || "Failed to send invoice");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      setUpdating(true);
      const response = await downloadInvoicePDF(bookingId);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "warning",
      confirmed: "success",
      completed: "info",
      cancelled: "danger",
    };
    return (
      <span className={`badge bg-${colors[status] || "secondary"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Error Loading Bookings</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchBookings}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Bookings</h1>
        <button
          className="btn btn-primary"
          onClick={fetchBookings}
          disabled={loading}
        >
          <FaSpinner className={`me-1 ${loading ? "spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="btn-group">
                <button
                  className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={`btn ${filter === "pending" ? "btn-warning" : "btn-outline-warning"}`}
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </button>
                <button
                  className={`btn ${filter === "confirmed" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setFilter("confirmed")}
                >
                  Confirmed
                </button>
                <button
                  className={`btn ${filter === "cancelled" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => setFilter("cancelled")}
                >
                  Cancelled
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by user or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <strong>{booking.user?.name}</strong>
                        <br />
                        <small>{booking.user?.email}</small>
                      </td>
                      <td>
                        <strong>{booking.event?.title}</strong>
                        <br />
                        <small>{booking.event?.date}</small>
                      </td>
                      <td>{booking.quantity}</td>
                      <td>₹{booking.totalPrice}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowModal(true);
                            }}
                          >
                            <FaEye />
                          </button>
                          {booking.status === "pending" && (
                            <>
                              <button
                                className="btn btn-outline-success"
                                onClick={() =>
                                  handleUpdateStatus(booking._id, "confirmed")
                                }
                              >
                                <FaCheck />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  handleUpdateStatus(booking._id, "cancelled")
                                }
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleSendInvoice(booking._id)}
                              >
                                <FaEnvelope />
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  handleDownloadInvoice(booking._id)
                                }
                              >
                                <FaFilePdf />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for booking details */}
      {showModal && selectedBooking && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>Booking Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Customer:</strong> {selectedBooking.user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedBooking.user?.email}
                </p>
                <p>
                  <strong>Event:</strong> {selectedBooking.event?.title}
                </p>
                <p>
                  <strong>Date:</strong> {selectedBooking.event?.date}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedBooking.quantity}
                </p>
                <p>
                  <strong>Total:</strong> ₹{selectedBooking.totalPrice}
                </p>
                <p>
                  <strong>Status:</strong> {selectedBooking.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .modal.show { display: block; }
      `}</style>
    </div>
  );
}

export default AdminBookings;
