import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../services/api";
import EventCard from "../components/EventCard";
import {
  FaCalendarCheck,
  FaUsers,
  FaTicketAlt,
  FaArrowRight,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaChevronRight,
  FaPlay,
  FaQuoteLeft,
} from "react-icons/fa";

// Import local background image (place your image in assets folder)
import heroBg from "../assets/hero-bg.jpg";

function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEvents();

        let eventsData = [];
        if (response.data && response.data.events) {
          eventsData = response.data.events;
        } else if (Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (response.data && response.data.data) {
          eventsData = response.data.data;
        } else {
          eventsData = [];
        }

        setFeaturedEvents(eventsData.slice(0, 3));
        setError("");
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please try again later.");
        setFeaturedEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const stats = [
    {
      icon: <FaCalendarCheck />,
      number: "500+",
      label: "Events Hosted",
      color: "#667eea",
    },
    {
      icon: <FaUsers />,
      number: "50K+",
      label: "Happy Attendees",
      color: "#48bb78",
    },
    {
      icon: <FaTicketAlt />,
      number: "100+",
      label: "Tickets Sold",
      color: "#ed8936",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Organizer",
      text: "EventHub has completely transformed how I manage my events. The platform is intuitive and powerful!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Regular Attendee",
      text: "I've discovered so many amazing events through this platform. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Business Owner",
      text: "The best event management platform I've ever used. Professional and reliable.",
      rating: 5,
    },
  ];

  if (loading) {
    return (
      <div className="home-loading-container">
        <div className="home-loader">
          <div className="home-loader-spinner"></div>
          <div className="home-loader-text">Loading amazing experiences...</div>
        </div>
        <style jsx>{`
          .home-loading-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .home-loader {
            text-align: center;
          }
          .home-loader-spinner {
            width: 60px;
            height: 60px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: homeSpin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes homeSpin {
            to {
              transform: rotate(360deg);
            }
          }
          .home-loader-text {
            color: white;
            font-size: 1.1rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="home-hero-overlay"></div>
        <div className="home-hero-bg-image"></div>
        <div className="home-container home-hero-container">
          <div className="home-hero-content">
            <div className="home-hero-badge">
              <span className="home-badge-pulse">✨ Welcome to EventHub</span>
            </div>
            <h1 className="home-hero-title">
              Discover{" "}
              <span className="home-gradient-text">Amazing Events</span>
              <br />
              Near You
            </h1>
            <p className="home-hero-description">
              Find and book the best events happening around you. From concerts
              to workshops, conferences to parties — we've got you covered with
              unforgettable experiences.
            </p>
            <div className="home-hero-buttons">
              <Link to="/events" className="home-btn-primary-glow">
                <span>Browse Events</span>
                <FaArrowRight className="home-btn-icon" />
              </Link>
              <Link to="/register" className="home-btn-outline-glow">
                <span>Get Started</span>
                <FaPlay className="home-btn-icon" />
              </Link>
            </div>
            <div className="home-hero-stats">
              {stats.map((stat, index) => (
                <div className="home-hero-stat-item" key={index}>
                  <div className="home-stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="home-stat-info">
                    <h3>{stat.number}</h3>
                    <p>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="home-hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="home-featured-section">
        <div className="home-container">
          <div className="home-section-header">
            <div className="home-section-tag">Featured Events</div>
            <h2 className="home-section-title">
              Popular <span className="home-gradient-text">Experiences</span>
            </h2>
            <p className="home-section-subtitle">
              Discover the most talked-about events of the season
            </p>
          </div>

          {error ? (
            <div className="home-error-container">
              <div className="home-error-card">
                <p>{error}</p>
                <button
                  className="home-btn-retry"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="home-empty-state">
              <div className="home-empty-state-content">
                <h3>No events available yet</h3>
                <p>Be the first to create an event and start your journey!</p>
                <Link to="/create-event" className="home-btn-primary-glow">
                  Create First Event
                </Link>
              </div>
            </div>
          ) : (
            <div className="home-events-grid">
              {featuredEvents.map((event) => (
                <div className="home-event-card-wrapper" key={event._id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}

          {featuredEvents.length > 0 && (
            <div className="home-view-all-container">
              <Link to="/events" className="home-btn-view-all">
                View All Events <FaChevronRight className="home-btn-icon" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features-section">
        <div className="home-container">
          <div className="home-section-header">
            <div className="home-section-tag">Why Choose Us</div>
            <h2 className="home-section-title">
              Everything You Need in One{" "}
              <span className="home-gradient-text">Platform</span>
            </h2>
          </div>
          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <FaCalendarCheck />
              </div>
              <h3>Easy Booking</h3>
              <p>
                Book events in just a few clicks with our streamlined process
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <FaUsers />
              </div>
              <h3>Community</h3>
              <p>Join a vibrant community of event enthusiasts</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <FaTicketAlt />
              </div>
              <h3>Secure Tickets</h3>
              <p>Get secure, verifiable tickets for all your events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-testimonials-section">
        <div className="home-container">
          <div className="home-section-header">
            <div className="home-section-tag">Testimonials</div>
            <h2 className="home-section-title">
              What Our{" "}
              <span className="home-gradient-text">Community Says</span>
            </h2>
          </div>
          <div className="home-testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div className="home-testimonial-card" key={index}>
                <FaQuoteLeft className="home-quote-icon" />
                <p className="home-testimonial-text">{testimonial.text}</p>
                <div className="home-testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="home-star-icon" />
                  ))}
                </div>
                <div className="home-testimonial-author">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta-section">
        <div className="home-container">
          <div className="home-cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>
              Join thousands of event lovers and create unforgettable memories
            </p>
            <Link to="/register" className="home-btn-cta">
              Get Started Now <FaArrowRight className="home-btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          overflow-x: hidden;
        }

        .home-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Hero Section */
        .home-hero-section {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .home-hero-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url(${heroBg});
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          transform: scale(1.05);
          animation: homeZoomBackground 20s ease-out;
        }

        @keyframes homeZoomBackground {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.05);
          }
        }

        .home-hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.85),
            rgba(0, 0, 0, 0.7)
          );
        }

        .home-hero-container {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .home-hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          color: white;
          animation: homeFadeInUp 1s ease;
        }

        @keyframes homeFadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .home-hero-badge {
          margin-bottom: 2rem;
        }

        .home-badge-pulse {
          display: inline-block;
          padding: 0.5rem 1.2rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          animation: homePulse 2s infinite;
        }

        @keyframes homePulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
            transform: scale(0.98);
          }
        }

        .home-hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .home-gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .home-hero-description {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .home-hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .home-btn-primary-glow,
        .home-btn-outline-glow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .home-btn-primary-glow {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        }

        .home-btn-primary-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
        }

        .home-btn-outline-glow {
          border: 2px solid rgba(255, 255, 255, 0.5);
          color: white;
        }

        .home-btn-outline-glow:hover {
          border-color: white;
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.1);
        }

        .home-hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          flex-wrap: wrap;
        }

        .home-hero-stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .home-stat-icon {
          font-size: 2rem;
        }

        .home-stat-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .home-stat-info p {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .home-hero-wave {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          z-index: 1;
        }

        /* Featured Section */
        .home-featured-section {
          padding: 5rem 0;
          background: #f7fafc;
        }

        .home-section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .home-section-tag {
          display: inline-block;
          padding: 0.3rem 1rem;
          background: linear-gradient(135deg, #667eea20, #764ba220);
          color: #667eea;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .home-section-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: #1a202c;
        }

        .home-section-subtitle {
          color: #718096;
          font-size: 1.1rem;
        }

        .home-events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .home-view-all-container {
          text-align: center;
        }

        .home-btn-view-all {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 2rem;
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .home-btn-view-all:hover {
          background: #667eea;
          color: white;
          transform: translateX(5px);
        }

        /* Features Section */
        .home-features-section {
          padding: 5rem 0;
          background: white;
        }

        .home-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .home-feature-card {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .home-feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .home-feature-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #667eea20, #764ba220);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #667eea;
        }

        /* Testimonials Section */
        .home-testimonials-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #667eea10, #764ba210);
        }

        .home-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .home-testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .home-testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .home-quote-icon {
          font-size: 2rem;
          color: #667eea;
          opacity: 0.3;
          margin-bottom: 1rem;
        }

        .home-testimonial-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #4a5568;
          margin-bottom: 1.5rem;
        }

        .home-star-icon {
          color: #fbbf24;
          margin-right: 0.25rem;
        }

        /* CTA Section */
        .home-cta-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .home-cta-content {
          text-align: center;
          color: white;
          position: relative;
          z-index: 1;
        }

        .home-cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .home-cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .home-btn-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2.5rem;
          background: white;
          color: #667eea;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .home-btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .home-error-container,
        .home-empty-state {
          text-align: center;
          padding: 3rem;
        }

        .home-error-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: inline-block;
        }

        .home-btn-retry {
          margin-top: 1rem;
          padding: 0.5rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .home-container {
            padding: 0 1rem;
          }
          .home-hero-title {
            font-size: 2rem;
          }
          .home-hero-description {
            font-size: 1rem;
          }
          .home-hero-buttons {
            flex-direction: column;
            align-items: center;
          }
          .home-hero-stats {
            flex-direction: column;
            gap: 1rem;
          }
          .home-section-title {
            font-size: 1.8rem;
          }
          .home-events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
