// frontend/src/pages/AdminUsers.jsx
import { useEffect, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaUser,
  FaUserShield,
  FaSpinner,
} from "react-icons/fa";
import { getAllAdminUsers, updateUserRole, deleteUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAdminUsers();
      console.log("Users response:", response.data);

      if (response.data && response.data.success) {
        setUsers(response.data.users);
      } else {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`,
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      await updateUserRole(userId, newRole);
      alert(`User role updated to ${newRole} successfully!`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating role:", error);
      alert(error.response?.data?.error || "Failed to update user role");
    } finally {
      setUpdating(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    // Don't allow deleting yourself
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    try {
      setUpdating(true);
      await deleteUser(userId);
      alert("User deleted successfully!");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.error || "Failed to delete user");
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="badge bg-danger">
          <FaUserShield className="me-1" /> Admin
        </span>
      );
    }
    return (
      <span className="badge bg-secondary">
        <FaUser className="me-1" /> User
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
          <p className="mt-3">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Error Loading Users</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Manage Users</h1>
          <p className="text-muted">View and manage all registered users</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchUsers}
          disabled={loading}
        >
          <FaSpinner className={`me-1 ${loading ? "spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <p className="text-muted mb-0">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{user.name}</strong>
                        {user._id === currentUser?.id && (
                          <span className="badge bg-info ms-2">You</span>
                        )}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || "N/A"}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {editingUser === user._id ? (
                            <>
                              <select
                                className="form-select form-select-sm"
                                defaultValue={user.role}
                                style={{ width: "120px" }}
                                onChange={(e) =>
                                  handleUpdateRole(user._id, e.target.value)
                                }
                                disabled={updating}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => setEditingUser(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => setEditingUser(user._id)}
                                title="Edit Role"
                                disabled={user._id === currentUser?.id}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  handleDeleteUser(user._id, user.name)
                                }
                                title="Delete User"
                                disabled={
                                  user._id === currentUser?.id || updating
                                }
                              >
                                <FaTrash />
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

      {/* Stats Summary */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6>Total Users</h6>
              <h3>{users.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6>Admin Users</h6>
              <h3>{users.filter((u) => u.role === "admin").length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h6>Regular Users</h6>
              <h3>{users.filter((u) => u.role === "user").length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6>New This Month</h6>
              <h3>
                {
                  users.filter(
                    (u) =>
                      new Date(u.createdAt).getMonth() ===
                      new Date().getMonth(),
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .table-responsive {
          overflow-x: auto;
        }
        
        .btn-group-sm .btn,
        .btn-group-sm select {
          margin: 0 2px;
        }
        
        .form-select-sm {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default AdminUsers;
