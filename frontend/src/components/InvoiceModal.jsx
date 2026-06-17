// frontend/src/components/InvoiceModal.jsx
import { useEffect, useState } from "react";
import { FaDownload, FaPrint, FaTimes } from "react-icons/fa";

function InvoiceModal({ booking, onClose }) {
  const [loading, setLoading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/admin/bookings/${booking._id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const html = await response.text();
      const win = window.open();
      win.document.write(html);
      win.document.close();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Invoice - {booking.serviceName}</h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="invoice-content p-4">
              <div className="text-center mb-4">
                <h1>INVOICE</h1>
                <p>Event Management Platform</p>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <strong>Invoice Number:</strong> INV-{booking._id?.slice(-8)}
                  <br />
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                  <br />
                  <strong>Customer:</strong> {booking.customerName}
                  <br />
                  <strong>Email:</strong> {booking.customerEmail}
                  <br />
                  <strong>Phone:</strong> {booking.customerPhone}
                </div>
                <div className="col-md-6 text-md-end">
                  <strong>Service:</strong> {booking.serviceName}
                  <br />
                  <strong>Provider:</strong> {booking.providerName}
                  <br />
                  <strong>Event Date:</strong>{" "}
                  {new Date(booking.eventDate).toLocaleDateString()}
                  <br />
                  <strong>Event Type:</strong> {booking.eventType}
                  <br />
                  <strong>Guests:</strong> {booking.guestCount}
                </div>
              </div>

              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {booking.serviceName} - {booking.eventType} (
                      {booking.guestCount} guests)
                    </td>
                    <td className="text-end">
                      ₹{booking.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <strong>Total Amount</strong>
                    </td>
                    <td className="text-end">
                      <strong>₹{booking.totalAmount?.toLocaleString()}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Advance Paid (30%)</td>
                    <td className="text-end">
                      ₹
                      {(
                        booking.advanceAmount || booking.totalAmount * 0.3
                      )?.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td>Balance Due</td>
                    <td className="text-end">
                      ₹
                      {(
                        booking.balanceAmount || booking.totalAmount * 0.7
                      )?.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="text-center mt-4 text-muted">
                <small>Thank you for choosing our services!</small>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              <FaTimes /> Close
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <FaPrint /> Print
            </button>
            <button
              className="btn btn-success"
              onClick={handleDownload}
              disabled={loading}
            >
              <FaDownload /> {loading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;
