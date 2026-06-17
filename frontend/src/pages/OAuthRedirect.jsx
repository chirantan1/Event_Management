// frontend/src/pages/OAuthRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

function OAuthRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Processing login...");

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    console.log("🔍 OAuth Redirect Component Mounted");
    console.log("📝 URL:", location.pathname + location.search);
    console.log("📝 Has token:", !!token);
    console.log("📝 Has user:", !!userParam);
    console.log("📝 Error param:", errorParam);

    if (errorParam) {
      console.error("❌ OAuth Error:", errorParam);
      setError(errorParam.replace(/_/g, " "));
      setTimeout(() => {
        navigate("/login?error=" + encodeURIComponent(errorParam));
      }, 3000);
      return;
    }

    if (!token || !userParam) {
      console.error("❌ Missing token or user data");
      setError("Missing authentication data from server");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      return;
    }

    try {
      // Parse user data
      let user;
      const decodedUser = decodeURIComponent(userParam);

      try {
        user = JSON.parse(decodedUser);
      } catch (parseError) {
        console.error("❌ Failed to parse user data:", parseError);
        // Try to extract using regex as fallback
        const emailMatch = decodedUser.match(/email["': ]+([^"'\s,}]+)/i);
        const nameMatch = decodedUser.match(/name["': ]+([^"'\s,}]+)/i);
        const idMatch = decodedUser.match(/id["': ]+([^"'\s,}]+)/i);

        user = {
          id: idMatch?.[1] || Date.now().toString(),
          email: emailMatch?.[1] || "",
          name: nameMatch?.[1] || "User",
          role: "user",
        };
      }

      console.log("✅ User data:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      if (!user.id || !user.email) {
        throw new Error("Missing required user information");
      }

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role || "user");

      console.log("💾 Data saved to localStorage");

      // Determine redirect based on role
      let redirectPath = "/dashboard";
      if (user.role === "admin") {
        redirectPath = "/admin";
        setStatus("Welcome Admin! Redirecting to dashboard...");
      } else if (user.role === "vendor") {
        redirectPath = "/vendor/dashboard";
        setStatus("Welcome Vendor! Redirecting to dashboard...");
      } else {
        redirectPath = "/dashboard";
        setStatus("Welcome back! Redirecting to dashboard...");
      }

      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (err) {
      console.error("❌ Error processing OAuth:", err);
      setError(err.message || "Failed to process login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        navigate("/login?error=auth_processing_failed");
      }, 3000);
    }
  }, [searchParams, navigate, location]);

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "40px",
      textAlign: "center",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      maxWidth: "400px",
      width: "90%",
    },
    spinner: {
      width: "50px",
      height: "50px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #667eea",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "20px auto",
    },
    successIcon: {
      width: "60px",
      height: "60px",
      backgroundColor: "#28a745",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      fontSize: "30px",
      color: "white",
    },
    errorIcon: {
      width: "60px",
      height: "60px",
      backgroundColor: "#dc3545",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      fontSize: "30px",
      color: "white",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "10px",
      color: "#333",
    },
    message: {
      color: "#666",
      marginBottom: "15px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {error ? (
          <>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.title}>Authentication Failed</h2>
            <p style={styles.message}>{error}</p>
            <p>Redirecting to login page...</p>
          </>
        ) : (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Authentication Successful!</h2>
            <p style={styles.message}>{status}</p>
            <div style={styles.spinner}></div>
          </>
        )}
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default OAuthRedirect;
