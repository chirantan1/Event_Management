// frontend/src/pages/AdminEvents.jsx
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaSpinner } from "react-icons/fa";
import {
  getEvents,
  deleteEvent,
  createEvent,
  updateEvent,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      console.log("Events response:", response.data);
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      setUpdating(true);
      await deleteEvent(selectedEvent._id);
      setShowDeleteModal(false);
      await fetchEvents();
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(error.response?.data?.error || "Failed to delete event");
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent({ ...event });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    try {
      setUpdating(true);
      await updateEvent(editingEvent._id, editingEvent);
      setShowEditModal(false);
      await fetchEvents();
      alert("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      alert(error.response?.data?.error || "Failed to update event");
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    setEditingEvent({
      ...editingEvent,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Manage Events</h1>
          <p className="text-muted">Create, edit and manage all events</p>
        </div>
        <Link to="/create-event" className="btn btn-primary">
          <FaPlus className="me-1" /> Create New Event
        </Link>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Bookings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length > 0 ? (
                  events.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <strong>{event.title}</strong>
                        <br />
                        <small className="text-muted">
                          {event.description?.substring(0, 50)}...
                        </small>
                      </td>
                      <td>
                        {event.date || "TBA"}
                        <br />
                        <small>{event.time || "TBA"}</small>
                      </td>
                      <td>{event.location || "TBA"}</td>
                      <td>
                        <strong>₹{event.price?.toLocaleString() || 0}</strong>
                      </td>
                      <td>{event.capacity || 0}</td>
                      <td>
                        <span className="badge bg-info">
                          {event.bookings || 0}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${event.isActive !== false ? "success" : "danger"}`}
                        >
                          {event.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <Link
                            to={`/events/${event._id}`}
                            className="btn btn-outline-info"
                            target="_blank"
                            title="View Event"
                          >
                            <FaEye />
                          </Link>
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => handleEdit(event)}
                            title="Edit Event"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Event"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <p className="text-muted mb-0">No events found</p>
                      <Link to="/create-event" className="btn btn-primary mt-3">
                        Create Your First Event
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete "
                  <strong>{selectedEvent?.title}</strong>"?
                </p>
                <p className="text-danger">
                  ⚠️ This action cannot be undone. All bookings for this event
                  will be cancelled.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={updating}
                >
                  {updating ? <FaSpinner className="spin" /> : <FaTrash />}{" "}
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Event</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={editingEvent.title || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      name="category"
                      className="form-control"
                      value={editingEvent.category || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={editingEvent.date || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      name="time"
                      className="form-control"
                      value={editingEvent.time || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      value={editingEvent.location || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      value={editingEvent.price || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      className="form-control"
                      value={editingEvent.capacity || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      value={editingEvent.description || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateEvent}
                  disabled={updating}
                >
                  {updating ? <FaSpinner className="spin" /> : <FaEdit />} Save
                  Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .modal.show {
          display: block;
          z-index: 1050;
        }
      `}</style>
    </div>
  );
}

export default AdminEvents;
