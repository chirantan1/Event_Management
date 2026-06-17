// frontend/src/services/api.js
import axios from 'axios';

// FIXED: Better environment variable handling with trim
const API_URL = (import.meta.env.VITE_API_URL?.trim() || 'https://event-management-froo.onrender.com/api');

console.log('🔗 API URL:', API_URL);
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('📦 Raw VITE_API_URL:', JSON.stringify(import.meta.env.VITE_API_URL));

// ==================== MAIN API (with auth) ====================
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ==================== PUBLIC API (no auth) ====================
const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add token (only for main api)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('email_verified');
      localStorage.removeItem('reset_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (userData) => api.post('/auth/login', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
export const changePassword = (data) => api.put('/auth/change-password', data);

// ✅ FIXED: Password Reset APIs - use publicApi (no auth token)
export const forgotPassword = async (email) => {
  try {
    console.log('📧 Sending forgot password request for:', email);
    const response = await publicApi.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    console.error("❌ Error in forgot password:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    console.log('🔐 Verifying OTP for:', email);
    const response = await publicApi.post('/auth/verify-otp', { email, otp });
    if (response.data.success && response.data.resetToken) {
      localStorage.setItem('reset_token', response.data.resetToken);
    }
    return response;
  } catch (error) {
    console.error("❌ Error verifying OTP:", error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (resetToken, newPassword, confirmPassword) => {
  try {
    console.log('🔄 Resetting password');
    const response = await publicApi.post('/auth/reset-password', {
      resetToken: resetToken,
      newPassword: newPassword,
      confirmPassword: confirmPassword
    });
    if (response.data.success) {
      localStorage.removeItem('reset_token');
    }
    return response;
  } catch (error) {
    console.error("❌ Error resetting password:", error.response?.data || error.message);
    throw error;
  }
};

export const resendOTP = async (email) => {
  try {
    console.log('📧 Resending OTP for:', email);
    const response = await publicApi.post('/auth/resend-otp', { email });
    return response;
  } catch (error) {
    console.error("❌ Error resending OTP:", error.response?.data || error.message);
    throw error;
  }
};

// ==================== EMAIL VERIFICATION APIs ====================
export const sendEmailOTP = async (email) => {
  try {
    const response = await api.post('/auth/send-verification-otp', { email });
    return response;
  } catch (error) {
    console.error("Error sending verification OTP:", error);
    throw error;
  }
};

export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-email-otp', { email, otp });
    if (response.data.success) {
      localStorage.setItem('email_verified', 'true');
    }
    return response;
  } catch (error) {
    console.error("Error verifying email OTP:", error);
    throw error;
  }
};

export const checkEmailVerification = () => {
  return localStorage.getItem('email_verified') === 'true';
};

export const resendEmailOTP = async (email) => {
  try {
    const response = await api.post('/auth/resend-email-otp', { email });
    return response;
  } catch (error) {
    console.error("Error resending email OTP:", error);
    throw error;
  }
};

// ==================== EVENT APIs ====================
export const getEvents = () => api.get('/events');
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (eventData) => api.post('/events', eventData);
export const updateEvent = (id, eventData) => api.put(`/events/${id}`, eventData);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const getUpcomingEvents = () => api.get('/events/upcoming');
export const getEventsByCategory = (category) => api.get(`/events/category/${category}`);

// ==================== BOOKING APIs ====================
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getUserBookings = () => api.get('/bookings/my-bookings');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const updatePaymentStatus = (id, paymentData) => api.put(`/bookings/${id}/payment`, paymentData);

// ==================== ADMIN APIs ====================

export const getAdminDashboardStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const getAllAdminBookings = async (params = {}) => {
  try {
    const { status = 'all', search = '', page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams();
    
    if (status && status !== 'all') queryParams.append('status', status);
    if (search) queryParams.append('search', search);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    
    const url = `/admin/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error("Error in getAllAdminBookings:", error);
    throw error;
  }
};

export const updateAdminBookingStatus = async (id, status, adminNotes = '') => {
  try {
    const response = await api.put(`/admin/bookings/${id}/status`, { status, adminNotes });
    return response;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

export const sendInvoiceEmail = async (id) => {
  try {
    const response = await api.post(`/admin/bookings/${id}/send-invoice`);
    return response;
  } catch (error) {
    console.error("Error sending invoice:", error);
    throw error;
  }
};

export const downloadInvoicePDF = async (id) => {
  try {
    const response = await api.get(`/admin/bookings/${id}/invoice`, {
      responseType: 'blob',
      timeout: 30000
    });
    
    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('text/html')) {
      const text = await response.data.text();
      return { success: true, type: 'html', content: text };
    } else if (contentType.includes('application/pdf')) {
      return { success: true, type: 'pdf', blob: response.data };
    } else {
      return { success: true, type: 'blob', blob: response.data };
    }
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
};

export const viewInvoice = (id) => {
  const token = localStorage.getItem('token');
  if (token) {
    window.open(`${API_URL}/admin/bookings/${id}/invoice?token=${token}`, '_blank');
  } else {
    alert('Please login again to view invoice');
  }
};

export const getAdminBookingById = async (id) => {
  try {
    const response = await api.get(`/admin/bookings/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
};

export const acceptAdminBooking = async (id, adminNotes = '') => {
  try {
    const response = await api.post(`/admin/bookings/${id}/accept`, { adminNotes });
    return response;
  } catch (error) {
    console.error("Error accepting booking:", error);
    throw error;
  }
};

export const rejectAdminBooking = async (id, reason = '') => {
  try {
    const response = await api.post(`/admin/bookings/${id}/reject`, { reason });
    return response;
  } catch (error) {
    console.error("Error rejecting booking:", error);
    throw error;
  }
};

// ==================== USER MANAGEMENT APIs (Admin) ====================

export const getAllAdminUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// ==================== ALIASES ====================
export const getAllUsers = getAllAdminUsers;
export const getAdminStats = getAdminDashboardStats;
export const getAllBookings = getAllAdminBookings;
export const updateBookingStatus = updateAdminBookingStatus;
export const sendInvoice = sendInvoiceEmail;
export const downloadInvoice = downloadInvoicePDF;

// ==================== SERVICE APIs ====================
export const getServices = () => api.get('/services');
export const getServiceById = (id) => api.get(`/services/${id}`);
export const createService = (serviceData) => api.post('/services', serviceData);
export const updateService = (id, serviceData) => api.put(`/services/${id}`, serviceData);
export const deleteService = (id) => api.delete(`/services/${id}`);

// ==================== VENDOR APIs ====================
export const getVendorServices = () => api.get('/vendor/services');
export const createVendorService = (serviceData) => api.post('/vendor/services', serviceData);
export const updateVendorService = (id, serviceData) => api.put(`/vendor/services/${id}`, serviceData);
export const deleteVendorService = (id) => api.delete(`/vendor/services/${id}`);
export const getVendorBookings = () => api.get('/vendor/bookings');
export const updateVendorBookingStatus = (id, status) => api.put(`/vendor/bookings/${id}/status`, { status });

// ==================== EMAIL TEMPLATE APIs ====================
export const getEmailTemplates = async () => {
  try {
    const response = await api.get('/admin/email-templates');
    return response;
  } catch (error) {
    console.error("Error fetching email templates:", error);
    throw error;
  }
};

export const updateEmailTemplate = async (templateName, data) => {
  try {
    const response = await api.put(`/admin/email-templates/${templateName}`, data);
    return response;
  } catch (error) {
    console.error("Error updating email template:", error);
    throw error;
  }
};

export const testEmailTemplate = async (templateName, testEmail) => {
  try {
    const response = await api.post('/admin/email-templates/test', { templateName, testEmail });
    return response;
  } catch (error) {
    console.error("Error testing email template:", error);
    throw error;
  }
};

// ==================== BULK EMAIL APIs ====================
export const sendBulkEmail = async (data) => {
  try {
    const response = await api.post('/admin/emails/bulk', data);
    return response;
  } catch (error) {
    console.error("Error sending bulk email:", error);
    throw error;
  }
};

export const getEmailLogs = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/emails/logs${query ? `?${query}` : ''}`);
    return response;
  } catch (error) {
    console.error("Error fetching email logs:", error);
    throw error;
  }
};

export default api;