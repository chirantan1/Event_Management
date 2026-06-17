// frontend/src/components/EventCard.jsx
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTicketAlt,
  FaRupeeSign,
} from "react-icons/fa";

function EventCard({ event }) {
  // Safely access event properties
  const title = event?.title || "Untitled Event";
  const description = event?.description || "No description available";
  const date = event?.date || "Date TBD";
  const time = event?.time || "Time TBD";
  const location = event?.location || "Location TBD";
  const price = event?.price || 0;
  const category = event?.category || "General";
  const eventId = event?._id;
  const availableSeats = event?.stats?.availableSeats || event?.capacity || 100;

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title text-primary fw-bold">{title}</h5>
            <span className="badge bg-secondary">{category}</span>
          </div>
          <p className="card-text text-muted small">
            {description.length > 100
              ? `${description.substring(0, 100)}...`
              : description}
          </p>
          <hr />
          <div className="mb-2">
            <FaCalendarAlt className="text-primary me-2" />
            <strong>Date:</strong> {date} at {time}
          </div>
          <div className="mb-2">
            <FaMapMarkerAlt className="text-danger me-2" />
            <strong>Location:</strong> {location}
          </div>
          <div className="mb-3">
            <FaRupeeSign className="text-success me-2" />
            <strong>Price:</strong> ₹{price.toLocaleString()}
          </div>
          <div className="mb-3">
            <FaTicketAlt className="text-info me-2" />
            <strong>Available Seats:</strong> {availableSeats}
          </div>
          <Link
            to={`/event-booking/${eventId}`}
            state={{ event }}
            className="btn btn-primary w-100"
          >
            Book Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
