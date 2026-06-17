// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import {
  getAdminDashboardStats,
  getAllAdminBookings,
  updateAdminBookingStatus,
  sendInvoiceEmail,
  downloadInvoicePDF,
  getAllAdminUsers,
  updateUserRole,
  deleteUser,
} from "../services/api";
import {
  FaCalendarAlt,
  FaUsers,
  FaBookmark,
  FaDollarSign,
  FaTicketAlt,
  FaChartLine,
  FaSpinner,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaEnvelope,
  FaFilePdf,
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaInfoCircle,
  FaDownload,
  FaTrash,
  FaStore,
  FaShieldAlt,
  FaCrown,
  FaUserPlus,
  FaBookOpen,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalEvents: 0,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [updatingUser, setUpdatingUser] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterAndSearchBookings();
  }, [allBookings, filterStatus, searchTerm]);

  const fetchAllData = async () => {
    await Promise.all([fetchStats(), fetchAllBookings(), fetchUsers()]);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboardStats();
      if (response.data && response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      setBookingLoading(true);
      const response = await getAllAdminBookings({
        page: currentPage,
        limit: 10,
      });
      if (response.data && response.data.success) {
        setAllBookings(response.data.bookings || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await getAllAdminUsers();
      if (response.data && response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const filterAndSearchBookings = () => {
    let filtered = [...allBookings];
    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.customerName?.toLowerCase().includes(term) ||
          booking.customerEmail?.toLowerCase().includes(term) ||
          booking.serviceName?.toLowerCase().includes(term),
      );
    }
    setFilteredBookings(filtered);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Change booking status to ${newStatus}?`)) return;
    try {
      setUpdating(true);
      await updateAdminBookingStatus(bookingId, newStatus);
      alert(`Booking ${newStatus} successfully!`);
      fetchAllData();
    } catch (error) {
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
      alert("Failed to send invoice");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      setUpdating(true);
      const response = await downloadInvoicePDF(bookingId);
      if (response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice_${bookingId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        alert("Invoice downloaded!");
      }
    } catch (error) {
      alert("Failed to download invoice");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    try {
      setUpdatingUser(true);
      await updateUserRole(userId, newRole);
      alert(`User role updated to ${newRole}!`);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update user role");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"?`)) return;
    try {
      setUpdatingUser(true);
      await deleteUser(userId);
      alert(`User "${userName}" deleted!`);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete user");
    } finally {
      setUpdatingUser(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { class: "badge-warning", icon: <FaClock />, text: "Pending" },
      confirmed: {
        class: "badge-success",
        icon: <FaCheckCircle />,
        text: "Confirmed",
      },
      completed: { class: "badge-info", icon: <FaCheck />, text: "Completed" },
      cancelled: {
        class: "badge-danger",
        icon: <FaTimesCircle />,
        text: "Cancelled",
      },
    };
    const c = config[status] || { class: "badge-secondary", text: status };
    return (
      <span className={`badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { class: "badge-danger", icon: <FaShieldAlt />, text: "Admin" },
      vendor: { class: "badge-success", icon: <FaStore />, text: "Vendor" },
      user: { class: "badge-info", icon: <FaUser />, text: "User" },
    };
    const c = config[role] || { class: "badge-secondary", text: role };
    return (
      <span className={`badge ${c.class}`}>
        {c.icon} {c.text}
      </span>
    );
  };

  const filteredUsers = users.filter((user) => {
    if (userRoleFilter !== "all" && user.role !== userRoleFilter) return false;
    if (userSearchTerm) {
      const term = userSearchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card" style={{ background: color }}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );

  if (loading) return <div className="loader">Loading Dashboard...</div>;
  if (error)
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchAllData}>Retry</button>
      </div>
    );

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-brand">
          <div className="brand-icon">📊</div>
          <div>
            <h1>Admin Dashboard</h1>
            <small>Control Panel</small>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={fetchAllData}>
            <FaSpinner /> Refresh
          </button>
          <div className="profile-avatar">A</div>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={FaCalendarAlt}
          color="#667eea"
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
          icon={FaDollarSign}
          color="#11998e"
        />
        <StatCard
          title="Users"
          value={stats.totalUsers}
          icon={FaUsers}
          color="#f093fb"
        />
        <StatCard
          title="Services"
          value={stats.totalEvents}
          icon={FaTicketAlt}
          color="#4facfe"
        />
      </div>

      {/* Status Cards */}
      <div className="status-grid">
        <div
          className="status-card pending"
          onClick={() => {
            setFilterStatus("pending");
            setActiveTab("bookings");
          }}
        >
          <FaClock /> <span>Pending</span>{" "}
          <strong>{stats.pendingBookings}</strong>
        </div>
        <div
          className="status-card confirmed"
          onClick={() => {
            setFilterStatus("confirmed");
            setActiveTab("bookings");
          }}
        >
          <FaCheckCircle /> <span>Confirmed</span>{" "}
          <strong>{stats.confirmedBookings}</strong>
        </div>
        <div
          className="status-card completed"
          onClick={() => {
            setFilterStatus("completed");
            setActiveTab("bookings");
          }}
        >
          <FaCheck /> <span>Completed</span>{" "}
          <strong>{stats.completedBookings || 0}</strong>
        </div>
        <div
          className="status-card cancelled"
          onClick={() => {
            setFilterStatus("cancelled");
            setActiveTab("bookings");
          }}
        >
          <FaTimesCircle /> <span>Cancelled</span>{" "}
          <strong>{stats.cancelledBookings}</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          <FaBookmark /> Bookings
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          <FaUsers /> Users
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-grid">
            <div className="card">
              <h3>
                <FaClock /> Recent Activity
              </h3>
              <div className="activity-list">
                {stats.recentBookings?.slice(0, 5).map((b, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-avatar">
                      {b.customerName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="activity-title">{b.customerName}</div>
                      <div className="activity-desc">{b.serviceName}</div>
                    </div>
                    <div className="activity-time">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {!stats.recentBookings?.length && <p>No recent activity</p>}
              </div>
            </div>
            <div className="card">
              <h3>
                <FaCrown /> Quick Actions
              </h3>
              <div className="actions-grid">
                <button onClick={() => setActiveTab("bookings")}>
                  <FaBookOpen /> Manage Bookings
                </button>
                <button onClick={() => setActiveTab("users")}>
                  <FaUserPlus /> Manage Users
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            <div className="section-header">
              <h3>
                <FaBookmark /> All Bookings
              </h3>
              <div className="filters">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")}>✕</button>
                  )}
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              {bookingLoading ? (
                <div className="loader-small">Loading...</div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="desktop-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length > 0 ? (
                          filteredBookings.map((b) => (
                            <tr key={b._id}>
                              <td>
                                <div className="customer-info">
                                  <div className="customer-avatar">
                                    {b.customerName?.charAt(0) || "U"}
                                  </div>
                                  <div>
                                    <div className="customer-name">
                                      {b.customerName}
                                    </div>
                                    <div className="customer-email">
                                      {b.customerEmail}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="service-name">
                                  {b.serviceName}
                                </div>
                                <div className="service-provider">
                                  {b.providerName}
                                </div>
                              </td>
                              <td>
                                {new Date(b.eventDate).toLocaleDateString()}
                              </td>
                              <td>₹{b.totalAmount?.toLocaleString()}</td>
                              <td>{getStatusBadge(b.status)}</td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setShowModal(true);
                                    }}
                                    title="View"
                                  >
                                    <FaEye />
                                  </button>
                                  {b.status === "pending" && (
                                    <>
                                      <button
                                        className="accept"
                                        onClick={() =>
                                          handleUpdateStatus(b._id, "confirmed")
                                        }
                                      >
                                        <FaCheck />
                                      </button>
                                      <button
                                        className="reject"
                                        onClick={() =>
                                          handleUpdateStatus(b._id, "cancelled")
                                        }
                                      >
                                        <FaTimes />
                                      </button>
                                    </>
                                  )}
                                  {b.status === "confirmed" && (
                                    <>
                                      <button
                                        className="email"
                                        onClick={() => handleSendInvoice(b._id)}
                                      >
                                        <FaEnvelope />
                                      </button>
                                      <button
                                        className="download"
                                        onClick={() =>
                                          handleDownloadInvoice(b._id)
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
                        ) : (
                          <tr>
                            <td colSpan="6" className="empty-state">
                              No bookings found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="mobile-cards">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => (
                        <div key={b._id} className="booking-card">
                          <div className="booking-card-header">
                            <div className="customer-info">
                              <div className="customer-avatar">
                                {b.customerName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <div className="customer-name">
                                  {b.customerName}
                                </div>
                                <div className="customer-email">
                                  {b.customerEmail}
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(b.status)}
                          </div>
                          <div className="booking-card-body">
                            <div>
                              <span>Service:</span> {b.serviceName}
                            </div>
                            <div>
                              <span>Provider:</span> {b.providerName}
                            </div>
                            <div>
                              <span>Date:</span>{" "}
                              {new Date(b.eventDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span>Amount:</span> ₹
                              {b.totalAmount?.toLocaleString()}
                            </div>
                          </div>
                          <div className="booking-card-actions">
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setShowModal(true);
                              }}
                            >
                              <FaEye /> View
                            </button>
                            {b.status === "pending" && (
                              <>
                                <button
                                  className="accept"
                                  onClick={() =>
                                    handleUpdateStatus(b._id, "confirmed")
                                  }
                                >
                                  <FaCheck /> Accept
                                </button>
                                <button
                                  className="reject"
                                  onClick={() =>
                                    handleUpdateStatus(b._id, "cancelled")
                                  }
                                >
                                  <FaTimes /> Reject
                                </button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <>
                                <button
                                  className="email"
                                  onClick={() => handleSendInvoice(b._id)}
                                >
                                  <FaEnvelope /> Send
                                </button>
                                <button
                                  className="download"
                                  onClick={() => handleDownloadInvoice(b._id)}
                                >
                                  <FaFilePdf /> PDF
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">No bookings found</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    fetchAllBookings();
                  }}
                >
                  <FaChevronLeft /> Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    fetchAllBookings();
                  }}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div className="section-header">
              <h3>
                <FaUsers /> User Management
              </h3>
              <div className="filters">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                  {userSearchTerm && (
                    <button onClick={() => setUserSearchTerm("")}>✕</button>
                  )}
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              {usersLoading ? (
                <div className="loader-small">Loading...</div>
              ) : (
                <>
                  <div className="desktop-table">
                    <table>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                            <tr key={u._id}>
                              <td>
                                <div className="customer-info">
                                  <div
                                    className="customer-avatar"
                                    style={{ background: "#667eea" }}
                                  >
                                    {u.name?.charAt(0) || "U"}
                                  </div>
                                  <div className="customer-name">{u.name}</div>
                                </div>
                              </td>
                              <td>{u.email}</td>
                              <td>{getRoleBadge(u.role)}</td>
                              <td>
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setShowUserModal(true);
                                    }}
                                  >
                                    <FaEye />
                                  </button>
                                  <div className="role-dropdown">
                                    <button className="role">
                                      <FaShieldAlt />
                                    </button>
                                    <div className="role-dropdown-menu">
                                      <button
                                        onClick={() =>
                                          handleUpdateUserRole(u._id, "user")
                                        }
                                      >
                                        <FaUser /> User
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleUpdateUserRole(u._id, "vendor")
                                        }
                                      >
                                        <FaStore /> Vendor
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleUpdateUserRole(u._id, "admin")
                                        }
                                      >
                                        <FaShieldAlt /> Admin
                                      </button>
                                    </div>
                                  </div>
                                  {u.role !== "admin" && (
                                    <button
                                      className="delete"
                                      onClick={() =>
                                        handleDeleteUser(u._id, u.name)
                                      }
                                    >
                                      <FaTrash />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="empty-state">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mobile-cards">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <div key={u._id} className="user-card">
                          <div className="user-card-header">
                            <div className="customer-info">
                              <div
                                className="customer-avatar"
                                style={{ background: "#667eea" }}
                              >
                                {u.name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <div className="customer-name">{u.name}</div>
                                <div className="customer-email">{u.email}</div>
                              </div>
                            </div>
                            {getRoleBadge(u.role)}
                          </div>
                          <div className="user-card-body">
                            <div>
                              <span>Joined:</span>{" "}
                              {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="user-card-actions">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowUserModal(true);
                              }}
                            >
                              <FaEye /> View
                            </button>
                            <div className="role-dropdown">
                              <button className="role">
                                <FaShieldAlt /> Role
                              </button>
                              <div className="role-dropdown-menu">
                                <button
                                  onClick={() =>
                                    handleUpdateUserRole(u._id, "user")
                                  }
                                >
                                  <FaUser /> User
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateUserRole(u._id, "vendor")
                                  }
                                >
                                  <FaStore /> Vendor
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateUserRole(u._id, "admin")
                                  }
                                >
                                  <FaShieldAlt /> Admin
                                </button>
                              </div>
                            </div>
                            {u.role !== "admin" && (
                              <button
                                className="delete"
                                onClick={() => handleDeleteUser(u._id, u.name)}
                              >
                                <FaTrash /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">No users found</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaInfoCircle /> Booking Details
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div>
                  <strong>Customer:</strong> {selectedBooking.customerName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedBooking.customerEmail}
                </div>
                <div>
                  <strong>Service:</strong> {selectedBooking.serviceName}
                </div>
                <div>
                  <strong>Provider:</strong> {selectedBooking.providerName}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedBooking.eventDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <strong>Total:</strong> ₹
                  {selectedBooking.totalAmount?.toLocaleString()}
                </div>
                <div>
                  <strong>Paid:</strong> ₹
                  {selectedBooking.advanceAmount?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)}>Close</button>
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    className="btn-success"
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, "confirmed");
                      setShowModal(false);
                    }}
                  >
                    <FaCheck /> Accept
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, "cancelled");
                      setShowModal(false);
                    }}
                  >
                    <FaTimes /> Reject
                  </button>
                </>
              )}
              {selectedBooking.status === "confirmed" && (
                <>
                  <button
                    className="btn-primary"
                    onClick={() => handleSendInvoice(selectedBooking._id)}
                  >
                    <FaEnvelope /> Send Invoice
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleDownloadInvoice(selectedBooking._id)}
                  >
                    <FaDownload /> PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaUser /> User Profile
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{selectedUser.name}</h2>
                  <p>{selectedUser.email}</p>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>
              <div className="profile-details">
                <div>
                  <strong>User ID:</strong> {selectedUser._id}
                </div>
                <div>
                  <strong>Joined:</strong>{" "}
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowUserModal(false)}>Close</button>
              {selectedUser.role !== "admin" && (
                <button
                  className="btn-danger"
                  onClick={() => {
                    handleDeleteUser(selectedUser._id, selectedUser.name);
                    setShowUserModal(false);
                  }}
                >
                  <FaTrash /> Delete User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-dashboard { padding: 16px; background: #f0f2f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        
        /* Header */
        .admin-header { background: white; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); flex-wrap: wrap; gap: 12px; }
        .header-brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; }
        .header-brand h1 { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .header-brand small { font-size: 12px; color: #6c757d; }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .header-actions button { padding: 8px 16px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; }
        .profile-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }

        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .stat-card { border-radius: 12px; padding: 16px 20px; color: white; display: flex; justify-content: space-between; align-items: center; }
        .stat-icon { background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px; font-size: 20px; }
        .stat-info { text-align: right; }
        .stat-title { font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 24px; font-weight: 700; }

        /* Status Cards */
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .status-card { background: white; border-radius: 10px; padding: 14px 18px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-left: 4px solid; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .status-card.pending { border-left-color: #ffc107; }
        .status-card.confirmed { border-left-color: #28a745; }
        .status-card.completed { border-left-color: #17a2b8; }
        .status-card.cancelled { border-left-color: #dc3545; }
        .status-card span { font-size: 14px; color: #6c757d; flex: 1; }
        .status-card strong { font-size: 20px; color: #1a1a2e; }

        /* Tabs */
        .tabs { display: flex; gap: 4px; background: white; border-radius: 10px; padding: 4px; margin-bottom: 20px; overflow-x: auto; }
        .tabs button { padding: 10px 20px; border: none; background: transparent; border-radius: 8px; font-size: 14px; font-weight: 500; color: #6c757d; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .tabs button.active { background: #667eea; color: white; }

        /* Cards */
        .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .card h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #1a1a2e; }

        /* Overview */
        .overview-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .activity-list { display: flex; flex-direction: column; gap: 8px; }
        .activity-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; }
        .activity-item:hover { background: #f8f9fa; }
        .activity-avatar { width: 32px; height: 32px; border-radius: 50%; background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .activity-title { font-weight: 500; font-size: 14px; }
        .activity-desc { font-size: 12px; color: #6c757d; }
        .activity-time { font-size: 11px; color: #adb5bd; margin-left: auto; }
        .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .actions-grid button { padding: 12px; border: 1px solid #e9ecef; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500; }

        /* Section Header */
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .section-header h3 { font-size: 18px; font-weight: 600; color: #1a1a2e; }
        .filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .search-box { display: flex; align-items: center; background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 0 10px; }
        .search-box input { border: none; padding: 8px; font-size: 14px; outline: none; min-width: 150px; }
        .search-box button { background: none; border: none; cursor: pointer; padding: 4px; }
        .filters select { padding: 8px 12px; border: 1px solid #e9ecef; border-radius: 8px; background: white; }

        /* Table */
        .table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #f8f9fa; }
        th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6c757d; border-bottom: 1px solid #e9ecef; }
        td { padding: 12px 16px; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
        tbody tr:hover { background: #f8f9ff; }

        .customer-info { display: flex; align-items: center; gap: 10px; }
        .customer-avatar { width: 32px; height: 32px; border-radius: 50%; background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; }
        .customer-name { font-weight: 500; }
        .customer-email { font-size: 12px; color: #6c757d; }
        .service-name { font-weight: 500; }
        .service-provider { font-size: 12px; color: #6c757d; }

        /* Badges */
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-info { background: #d1ecf1; color: #0c5460; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-secondary { background: #e9ecef; color: #495057; }

        /* Action Buttons */
        .action-buttons { display: flex; gap: 4px; flex-wrap: wrap; }
        .action-buttons button { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; background: #e9ecef; color: #495057; }
        .action-buttons button:hover { opacity: 0.8; }
        .action-buttons .accept { background: #d4edda; color: #28a745; }
        .action-buttons .reject { background: #f8d7da; color: #dc3545; }
        .action-buttons .email { background: #cce5ff; color: #0066cc; }
        .action-buttons .download { background: #d4edda; color: #28a745; }
        .action-buttons .delete { background: #f8d7da; color: #dc3545; }
        .action-buttons .role { background: #fff3cd; color: #856404; }

        /* Role Dropdown */
        .role-dropdown { position: relative; display: inline-block; }
        .role-dropdown-menu { display: none; position: absolute; right: 0; top: 100%; background: white; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; z-index: 10; padding: 4px 0; }
        .role-dropdown:hover .role-dropdown-menu { display: block; }
        .role-dropdown-menu button { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: none; width: 100%; cursor: pointer; font-size: 13px; }
        .role-dropdown-menu button:hover { background: #f8f9fa; }

        /* Mobile Cards */
        .mobile-cards { display: none; padding: 16px; }
        .booking-card, .user-card { background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #e9ecef; }
        .booking-card-header, .user-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .booking-card-body, .user-card-body { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
        .booking-card-body div, .user-card-body div { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f5; font-size: 14px; }
        .booking-card-body div:last-child { border-bottom: none; }
        .booking-card-body span, .user-card-body span { color: #6c757d; font-weight: 500; }
        .booking-card-actions, .user-card-actions { display: flex; gap: 6px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid #f1f3f5; }
        .booking-card-actions button, .user-card-actions button { padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px; background: #e9ecef; }
        .booking-card-actions .accept { background: #d4edda; color: #28a745; }
        .booking-card-actions .reject { background: #f8d7da; color: #dc3545; }
        .booking-card-actions .email { background: #cce5ff; color: #0066cc; }
        .booking-card-actions .download { background: #d4edda; color: #28a745; }
        .user-card-actions .delete { background: #f8d7da; color: #dc3545; }
        .user-card-actions .role { background: #fff3cd; color: #856404; }

        /* Empty State */
        .empty-state { text-align: center; padding: 30px; color: #6c757d; }

        /* Pagination */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 16px; }
        .pagination button { padding: 6px 14px; border: 1px solid #e9ecef; border-radius: 6px; background: white; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Modal */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
        .modal-content { background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e9ecef; }
        .modal-header h3 { display: flex; align-items: center; gap: 8px; font-size: 18px; }
        .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; }
        .modal-body { padding: 20px; }
        .modal-footer { padding: 12px 20px; border-top: 1px solid #e9ecef; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
        .modal-footer button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; background: #e9ecef; }
        .modal-footer .btn-success { background: #28a745; color: white; }
        .modal-footer .btn-danger { background: #dc3545; color: white; }
        .modal-footer .btn-primary { background: #667eea; color: white; }
        .modal-footer .btn-secondary { background: #e9ecef; }

        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .detail-grid div { padding: 6px 0; border-bottom: 1px solid #f1f3f5; font-size: 14px; }

        .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .profile-avatar-large { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; flex-shrink: 0; }
        .profile-header h2 { margin: 0; font-size: 20px; }
        .profile-header p { margin: 4px 0; color: #6c757d; }
        .profile-details { display: grid; gap: 8px; }
        .profile-details div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f3f5; font-size: 14px; }

        /* Loaders */
        .loader { display: flex; justify-content: center; align-items: center; min-height: 60vh; font-size: 18px; color: #6c757d; }
        .loader-small { padding: 30px; text-align: center; color: #6c757d; }
        .error-container { text-align: center; padding: 40px; }
        .error-container button { margin-top: 12px; padding: 10px 24px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; }

        /* Responsive */
        @media (max-width: 992px) {
          .overview-grid { grid-template-columns: 1fr; }
          .detail-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .admin-dashboard { padding: 12px; }
          .admin-header { flex-direction: column; align-items: stretch; }
          .header-actions { justify-content: space-between; }
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .status-grid { grid-template-columns: 1fr 1fr; }
          .desktop-table { display: none; }
          .mobile-cards { display: block; }
          .section-header { flex-direction: column; align-items: stretch; }
          .filters { flex-direction: column; }
          .search-box input { min-width: auto; }
          .actions-grid { grid-template-columns: 1fr; }
          .tabs button span { display: none; }
          .modal-content { margin: 12px; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .status-grid { grid-template-columns: 1fr; }
          .header-brand h1 { font-size: 16px; }
          .stat-value { font-size: 20px; }
          .booking-card-actions button, .user-card-actions button { font-size: 11px; padding: 4px 10px; }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
