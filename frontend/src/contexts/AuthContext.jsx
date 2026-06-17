// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser, registerUser, getCurrentUser } from "../services/api";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get API URL from environment
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${storedToken}`;

          // Verify token with backend
          try {
            const response = await getCurrentUser();
            if (response.data) {
              const updatedUser = {
                ...parsedUser,
                ...response.data.user,
                role: response.data.user?.role || parsedUser.role,
              };
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
              localStorage.setItem("userRole", updatedUser.role);
            }
          } catch (error) {
            console.error("Token verification failed:", error);
            if (error.response?.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("userRole");
              delete axios.defaults.headers.common["Authorization"];
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // ✅ FIXED: Login function with better error handling
  const login = async (email, password) => {
    try {
      console.log("🔐 Login attempt:", { email });

      if (!email || !password) {
        return {
          success: false,
          error: "Please provide email and password",
        };
      }

      const response = await loginUser({ email, password });
      console.log("✅ Login response:", response.data);

      if (!response.data || !response.data.token || !response.data.user) {
        console.error("❌ Invalid login response:", response.data);
        return {
          success: false,
          error: "Invalid response from server",
        };
      }

      const { token, user: userData } = response.data;

      const userWithRole = {
        ...userData,
        role: userData?.role || "user",
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      localStorage.setItem("userRole", userWithRole.role);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userWithRole);

      return { success: true, user: userWithRole };
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("Error response:", error.response?.data);

      // Check if user exists but password is wrong
      if (error.response?.status === 401) {
        return {
          success: false,
          error: error.response?.data?.error || "Invalid email or password",
        };
      }

      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  };

  // ✅ FIXED: Register function with better error handling
  const register = async (name, email, password, phone = "") => {
    try {
      console.log("📝 Registration attempt:", { name, email, phone });

      // Validation
      if (!name || !email || !password) {
        return {
          success: false,
          error: "Please provide all required fields",
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };
      }

      const response = await registerUser({ name, email, password, phone });
      console.log("✅ Registration response:", response.data);

      if (!response.data || !response.data.success) {
        console.error("❌ Registration failed:", response.data);
        return {
          success: false,
          error: response.data?.error || "Registration failed",
        };
      }

      const { token, user: userData } = response.data;

      const userWithRole = {
        ...userData,
        role: userData?.role || "user",
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      localStorage.setItem("userRole", userWithRole.role);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userWithRole);

      return { success: true, user: userWithRole };
    } catch (error) {
      console.error("❌ Registration error:", error);
      console.error("Error response:", error.response?.data);

      // Handle duplicate email error
      if (
        error.response?.status === 400 &&
        error.response?.data?.error?.includes("already exists")
      ) {
        return {
          success: false,
          error: "This email is already registered. Please login instead.",
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Registration failed. Please try again.",
      };
    }
  };

  // Google Login function
  const loginWithGoogle = () => {
    console.log("🔐 Google login initiated");
    localStorage.setItem("oauth_return_url", "/dashboard");
    window.location.href = `${API_URL}/auth/google`;
  };

  // GitHub Login function
  const loginWithGithub = () => {
    console.log("🔐 GitHub login initiated");
    localStorage.setItem("oauth_return_url", "/dashboard");
    window.location.href = `${API_URL}/auth/github`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email_verified");
    localStorage.removeItem("reset_token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem("token");
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithGithub,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Make sure these are exported
export { AuthContext };
export default AuthProvider;
