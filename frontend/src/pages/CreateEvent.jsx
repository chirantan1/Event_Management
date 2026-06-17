import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../services/api";
import { FaSave, FaTimes } from "react-icons/fa";

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    capacity: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEvent(formData);
      alert("Event created successfully!");
      navigate("/events");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Create New Event</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    placeholder="Venue name and address"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Price ($) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Capacity *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Concert">Concert</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <FaSave className="me-1" />
                    {loading ? "Creating..." : "Create Event"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/events")}
                  >
                    <FaTimes className="me-1" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
