import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaClock,
  FaGlobe,
  FaHeadset,
  FaRegSmile,
  FaRocket,
  FaArrowRight,
  FaWhatsapp,
  FaTelegram,
  FaGithub,
  FaYoutube,
  FaQuoteLeft,
} from "react-icons/fa";
import { GiChatBubble } from "react-icons/gi";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (value.length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Please enter a valid email address";
        break;
      case "subject":
        if (value.length < 3) error = "Subject must be at least 3 characters";
        break;
      case "message":
        if (value.length < 10) error = "Message must be at least 10 characters";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
    setErrors({});
  };

  const contactMethods = [
    {
      icon: <FaEnvelope />,
      title: "Email Support",
      details: ["support@eventhub.in", "hello@eventhub.in", "care@eventhub.in"],
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      action: "mailto:support@eventhub.in",
    },
    {
      icon: <FaPhone />,
      title: "Phone Line",
      details: [
        "+91 98765 43210",
        "+91 98765 43211",
        "1800-123-HELP (Toll Free)",
      ],
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      action: "tel:+919876543210",
    },
    {
      icon: <FaWhatsapp />,
      title: "WhatsApp Support",
      details: [
        "+91 98765 43212",
        "Chat with us on WhatsApp",
        "Response within minutes",
      ],
      gradient: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
      action: "https://wa.me/919876543212",
    },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, name: "Facebook", color: "#1877f2", url: "#" },
    { icon: <FaTwitter />, name: "Twitter", color: "#1da1f2", url: "#" },
    { icon: <FaInstagram />, name: "Instagram", color: "#e4405f", url: "#" },
    { icon: <FaLinkedin />, name: "LinkedIn", color: "#0077b5", url: "#" },
    {
      icon: <FaWhatsapp />,
      name: "WhatsApp",
      color: "#25D366",
      url: "https://wa.me/919876543212",
    },
    { icon: <FaTelegram />, name: "Telegram", color: "#0088cc", url: "#" },
    { icon: <FaGithub />, name: "GitHub", color: "#333", url: "#" },
    { icon: <FaYoutube />, name: "YouTube", color: "#ff0000", url: "#" },
  ];

  const stats = [
    { icon: <FaRegSmile />, number: "1 Lakh+", label: "Happy Customers" },
    { icon: <GiChatBubble />, number: "24/7", label: "Support Available" },
    { icon: <FaClock />, number: "< 30 min", label: "Response Time" },
    { icon: <FaGlobe />, number: "28+", label: "States Served" },
  ];

  const locations = [
    {
      city: "Mumbai",
      address: "101, Techno Park, Andheri East, Mumbai - 400093",
      phone: "+91 22 1234 5678",
      map: "https://maps.google.com/?q=Mumbai+Andheri+East+Techno+Park",
    },
    {
      city: "Delhi NCR",
      address: "Tower B, Cyber City, Gurugram, Delhi NCR - 122002",
      phone: "+91 124 6789 012",
      map: "https://maps.google.com/?q=Gurugram+Cyber+City",
    },
    {
      city: "Bengaluru",
      address: "45, Electronic City, Bengaluru - 560100",
      phone: "+91 80 3456 7890",
      map: "https://maps.google.com/?q=Bengaluru+Electronic+City",
    },
    {
      city: "Kolkata",
      address: "Salt Lake City, Sector V, Kolkata - 700091",
      phone: "+91 33 2345 6789",
      map: "https://maps.google.com/?q=Kolkata+Salt+Lake+Sector+V",
    },
    {
      city: "Chennai",
      address: "OMR Road, Thoraipakkam, Chennai - 600097",
      phone: "+91 44 4567 8901",
      map: "https://maps.google.com/?q=Chennai+OMR+Road",
    },
    {
      city: "Hyderabad",
      address: "Hitech City, Hyderabad - 500081",
      phone: "+91 40 5678 9012",
      map: "https://maps.google.com/?q=Hyderabad+Hitech+City",
    },
  ];

  return (
    <div className="contact-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      {/* Hero Section */}
      <section className="contact-hero-section">
        <div className="contact-container">
          <div className="contact-hero-content">
            <div className="contact-hero-badge" data-aos="fade-up">
              <FaHeadset />
              <span>24/7 Support Available | भारत में स्थित</span>
            </div>
            <h1
              className="contact-hero-title"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Let's Start a{" "}
              <span className="contact-gradient-text">Conversation</span>
            </h1>
            <p
              className="contact-hero-description"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Whether you have a question, want to collaborate, or just want to
              say hi, we're here to help. Our team is ready to assist you 24/7.
              पूरे भारत में हमारी सेवाएं उपलब्ध हैं।
            </p>

            {/* CTA Buttons */}
            <div
              className="contact-hero-buttons"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <button className="btn-primary">
                <FaHeadset /> Start Chat
              </button>
              <button className="btn-secondary">
                <FaWhatsapp /> WhatsApp Us
              </button>
            </div>

            <div
              className="contact-hero-stats"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              {stats.map((stat, index) => (
                <div className="contact-hero-stat" key={index}>
                  <div className="contact-stat-icon">{stat.icon}</div>
                  <div className="contact-stat-content">
                    <h3>{stat.number}</h3>
                    <p>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods Cards */}
      <section className="contact-methods-section">
        <div className="contact-container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-subtitle">Get in Touch</span>
            <h2 className="section-title">Ways to Reach Us</h2>
            <p className="section-description">
              Choose your preferred method and we'll get back to you as soon as
              possible
            </p>
          </div>
          <div className="contact-methods-grid">
            {contactMethods.map((method, index) => (
              <div
                className="contact-method-card"
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div
                  className="contact-method-icon"
                  style={{ background: method.gradient }}
                >
                  {method.icon}
                </div>
                <h3>{method.title}</h3>
                {method.details.map((detail, i) => (
                  <p key={i}>{detail}</p>
                ))}
                <a href={method.action} className="contact-method-link">
                  Get in Touch <FaArrowRight />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations Section */}
      <section className="contact-locations-section">
        <div className="contact-container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-subtitle">Our Presence</span>
            <h2 className="section-title">Office Locations Across India</h2>
            <p className="section-description">
              We have offices in major cities across India to serve you better
            </p>
          </div>
          <div className="locations-grid">
            {locations.map((location, index) => (
              <div
                className="location-card"
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="location-icon">
                  <FaMapMarkerAlt />
                </div>
                <h3>{location.city}</h3>
                <p>{location.address}</p>
                <p className="location-phone">{location.phone}</p>
                <a
                  href={location.map}
                  className="location-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions <FaArrowRight />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="contact-form-section">
        <div className="contact-container">
          <div className="contact-form-container" data-aos="fade-up">
            <div className="contact-form-info">
              <div className="contact-info-content">
                <div className="contact-info-badge">
                  <FaRocket />
                  <span>We're Here to Help</span>
                </div>
                <h2>Send Us a Message</h2>
                <p>
                  Fill out the form and our team will get back to you within 24
                  hours. We're excited to hear from you!
                </p>

                <div className="contact-info-features">
                  <div className="contact-feature-item">
                    <FaCheckCircle className="contact-feature-icon" />
                    <div>
                      <strong>Fast Response Time</strong>
                      <p>Average response time under 30 minutes</p>
                    </div>
                  </div>
                  <div className="contact-feature-item">
                    <FaCheckCircle className="contact-feature-icon" />
                    <div>
                      <strong>Expert Support Team</strong>
                      <p>Dedicated professionals ready to help</p>
                    </div>
                  </div>
                  <div className="contact-feature-item">
                    <FaCheckCircle className="contact-feature-icon" />
                    <div>
                      <strong>100% Satisfaction Guaranteed</strong>
                      <p>We value your satisfaction above all</p>
                    </div>
                  </div>
                </div>

                <div className="contact-social-links">
                  <h4>Connect With Us</h4>
                  <div className="contact-social-icons">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className="contact-social-icon"
                        style={{ background: social.color }}
                        title={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              {submitted && (
                <div className="contact-success-message">
                  <FaCheckCircle className="contact-success-icon" />
                  <div>
                    <h4>Message Sent Successfully!</h4>
                    <p>
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-group">
                  <label className="contact-form-label">
                    Your Name <span className="contact-required">*</span>
                  </label>
                  <div
                    className={`contact-input-wrapper ${focusedField === "name" ? "focused" : ""} ${errors.name ? "error" : ""}`}
                  >
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      className="contact-form-input"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <span className="contact-error-message">
                        {errors.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">
                    Email Address <span className="contact-required">*</span>
                  </label>
                  <div
                    className={`contact-input-wrapper ${focusedField === "email" ? "focused" : ""} ${errors.email ? "error" : ""}`}
                  >
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="contact-form-input"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <span className="contact-error-message">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">
                    Subject <span className="contact-required">*</span>
                  </label>
                  <div
                    className={`contact-input-wrapper ${focusedField === "subject" ? "focused" : ""} ${errors.subject ? "error" : ""}`}
                  >
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      className="contact-form-input"
                      placeholder="How can we help?"
                    />
                    {errors.subject && (
                      <span className="contact-error-message">
                        {errors.subject}
                      </span>
                    )}
                  </div>
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">
                    Message <span className="contact-required">*</span>
                  </label>
                  <div
                    className={`contact-input-wrapper ${focusedField === "message" ? "focused" : ""} ${errors.message ? "error" : ""}`}
                  >
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      className="contact-form-textarea"
                      rows="5"
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && (
                      <span className="contact-error-message">
                        {errors.message}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="contact-spinner"></div> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="contact-btn-icon" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map-section">
        <div className="contact-container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-subtitle">Visit Us</span>
            <h2 className="section-title">Find Our Head Office</h2>
            <p className="section-description">
              Come visit our headquarters in Mumbai or any of our regional
              offices
            </p>
          </div>
          <div className="contact-map-wrapper" data-aos="fade-up">
            <iframe
              title="Office Location - Mumbai"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.9152959696577!2d72.869383974749!3d19.11339125247948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c83a3fa60d0d%3A0xe8cfb55dbb6d24fc!2sAndheri%20East%2C%20Mumbai%2C%20Maharashtra%20400093!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            <div className="contact-map-overlay">
              <div className="contact-map-card">
                <FaMapMarkerAlt className="contact-map-marker" />
                <h4>Head Office - Mumbai</h4>
                <p>101, Techno Park, Andheri East, Mumbai - 400093</p>
                <p>📞 +91 22 1234 5678</p>
                <a
                  href="https://maps.google.com/?q=Mumbai+Andheri+East+Techno+Park"
                  className="contact-map-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions <FaArrowRight />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="contact-newsletter">
        <div className="contact-container">
          <div className="newsletter-wrapper" data-aos="fade-up">
            <div className="newsletter-content">
              <h3>Subscribe to Our Newsletter</h3>
              <p>
                Get the latest updates, news, and special offers directly to
                your inbox
              </p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email address" />
                <button>Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .contact-page {
          overflow-x: hidden;
          position: relative;
          background: #f8fafc;
        }

        /* Animated Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .gradient-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 20s infinite;
        }

        .sphere-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .sphere-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #f093fb, #f5576c);
          bottom: -150px;
          right: -150px;
          animation-delay: 5s;
        }

        .sphere-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, 30px) scale(1.1);
          }
          50% {
            transform: translate(30px, 60px) scale(0.9);
          }
          75% {
            transform: translate(-20px, 40px) scale(1.05);
          }
        }

        .contact-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        /* Section Header */
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-subtitle {
          display: inline-block;
          background: linear-gradient(135deg, #667eea20, #764ba220);
          color: #667eea;
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1f2937, #4b5563);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 1rem;
        }

        .section-description {
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Hero Section */
        .contact-hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .contact-hero-content {
          text-align: center;
          color: #1f2937;
          padding: 6rem 0;
        }

        .contact-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .contact-hero-badge svg {
          color: #667eea;
        }

        .contact-hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .contact-gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .contact-hero-description {
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto 2rem;
          color: #4b5563;
        }

        .contact-hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          background: #667eea10;
        }

        .contact-hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .contact-hero-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1rem 2rem;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .contact-hero-stat:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .contact-stat-icon {
          font-size: 2rem;
          color: #667eea;
        }

        .contact-stat-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }

        .contact-stat-content p {
          margin: 0;
          font-size: 0.85rem;
          color: #6b7280;
        }

        /* Contact Methods */
        .contact-methods-section {
          padding: 5rem 0;
        }

        .contact-methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .contact-method-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .contact-method-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        }

        .contact-method-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }

        .contact-method-card h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .contact-method-card p {
          color: #6b7280;
          margin: 0.3rem 0;
        }

        .contact-method-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: gap 0.3s;
        }

        .contact-method-link:hover {
          gap: 1rem;
          color: #764ba2;
        }

        /* Locations Section */
        .contact-locations-section {
          padding: 5rem 0;
          background: #f1f5f9;
        }

        .locations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .location-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .location-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        }

        .location-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea20, #764ba220);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.8rem;
          color: #667eea;
        }

        .location-card h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .location-card p {
          color: #6b7280;
          margin: 0.5rem 0;
          line-height: 1.5;
        }

        .location-phone {
          color: #667eea;
          font-weight: 600;
        }

        .location-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: gap 0.3s;
        }

        .location-link:hover {
          gap: 1rem;
        }

        /* Contact Form Section */
        .contact-form-section {
          padding: 5rem 0;
        }

        .contact-form-container {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2rem;
          background: white;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .contact-form-info {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 3rem;
          color: white;
        }

        .contact-info-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          margin-bottom: 2rem;
        }

        .contact-form-info h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .contact-form-info > p {
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .contact-info-features {
          margin-bottom: 2rem;
        }

        .contact-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .contact-feature-icon {
          color: #fbbf24;
          font-size: 1.2rem;
          margin-top: 0.2rem;
          flex-shrink: 0;
        }

        .contact-feature-item strong {
          display: block;
          margin-bottom: 0.3rem;
        }

        .contact-feature-item p {
          font-size: 0.85rem;
          opacity: 0.8;
          margin: 0;
        }

        .contact-social-links h4 {
          margin-bottom: 1rem;
        }

        .contact-social-icons {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
        }

        .contact-social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.3s;
        }

        .contact-social-icon:hover {
          transform: translateY(-3px) scale(1.05);
        }

        .contact-form-wrapper {
          padding: 3rem;
        }

        .contact-success-message {
          background: linear-gradient(135deg, #48bb78 0%, #38b2ac 100%);
          color: white;
          padding: 1rem;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          animation: slideDown 0.5s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-form-label {
          font-weight: 600;
          color: #2d3748;
        }

        .contact-required {
          color: #ef4444;
        }

        .contact-input-wrapper {
          position: relative;
        }

        .contact-form-input,
        .contact-form-textarea {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
          background: white;
        }

        .contact-form-input:focus,
        .contact-form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .contact-input-wrapper.focused .contact-form-input,
        .contact-input-wrapper.focused .contact-form-textarea {
          border-color: #667eea;
        }

        .contact-input-wrapper.error .contact-form-input,
        .contact-input-wrapper.error .contact-form-textarea {
          border-color: #ef4444;
        }

        .contact-error-message {
          position: absolute;
          bottom: -20px;
          left: 0;
          font-size: 0.75rem;
          color: #ef4444;
        }

        .contact-submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .contact-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .contact-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .contact-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Map Section */
        .contact-map-section {
          padding: 0 0 5rem 0;
        }

        .contact-map-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .contact-map-overlay {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
        }

        .contact-map-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          min-width: 280px;
          animation: slideInRight 0.6s ease;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .contact-map-marker {
          font-size: 2rem;
          color: #ef4444;
          margin-bottom: 0.5rem;
        }

        .contact-map-card h4 {
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .contact-map-card p {
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .contact-map-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .contact-map-link:hover {
          gap: 1rem;
        }

        /* Newsletter Section */
        .contact-newsletter {
          padding: 0 0 5rem 0;
        }

        .newsletter-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 30px;
          padding: 4rem;
          text-align: center;
          color: white;
        }

        .newsletter-content h3 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .newsletter-content p {
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .newsletter-form {
          display: flex;
          gap: 1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-form input {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
        }

        .newsletter-form input:focus {
          outline: none;
        }

        .newsletter-form button {
          padding: 1rem 2rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .newsletter-form button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        /* Responsive */
        @media (max-width: 968px) {
          .contact-form-container {
            grid-template-columns: 1fr;
          }
          .contact-hero-title {
            font-size: 2.5rem;
          }
          .contact-hero-stats {
            flex-direction: column;
            align-items: center;
          }
          .contact-map-overlay {
            position: relative;
            bottom: auto;
            right: auto;
            margin-top: 1rem;
          }
          .newsletter-form {
            flex-direction: column;
          }
          .locations-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .contact-container {
            padding: 0 1rem;
          }
          .contact-methods-grid {
            grid-template-columns: 1fr;
          }
          .contact-form-info,
          .contact-form-wrapper {
            padding: 2rem;
          }
          .contact-hero-buttons {
            flex-direction: column;
            align-items: center;
          }
          .btn-primary,
          .btn-secondary {
            width: 200px;
            justify-content: center;
          }
          .newsletter-wrapper {
            padding: 2rem;
          }
          .contact-map-card {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default Contact;
