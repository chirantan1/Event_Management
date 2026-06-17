// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminUsers from "./pages/AdminUsers";
import AdminBookings from "./pages/AdminBookings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthRedirect from "./pages/OAuthRedirect";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import EventBooking from "./pages/EventBooking";
// ✅ ADDED: Import Terms and Privacy pages
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth-redirect" element={<OAuthRedirect />} />
          <Route path="/event-booking/:id" element={<EventBooking />} />

          {/* ✅ ADDED: Terms and Privacy routes */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Booking Route - No auth required initially */}
          <Route path="/booking/:id" element={<Booking />} />

          {/* Payment Route */}
          <Route path="/payment" element={<Payment />} />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute adminOnly>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute adminOnly>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute adminOnly>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
