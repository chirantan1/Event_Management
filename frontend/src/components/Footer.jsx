import { Link } from "react-router-dom"; // Add this import
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5>EventHub</h5>
            <p>
              Your one-stop platform to discover and book amazing events.
              Connect, learn, and have fun!
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-white text-decoration-none">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white text-decoration-none">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white text-decoration-none">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h5>Follow Us</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-white fs-4">
                <FaFacebook />
              </a>
              <a href="#" className="text-white fs-4">
                <FaTwitter />
              </a>
              <a href="#" className="text-white fs-4">
                <FaInstagram />
              </a>
              <a href="#" className="text-white fs-4">
                <FaGithub />
              </a>
            </div>
            <p className="mt-3">
              <strong>Email:</strong> support@eventhub.com
              <br />
              <strong>Phone:</strong> +1 234 567 890
            </p>
          </div>
        </div>
        <hr className="bg-light" />
        <div className="text-center">
          <p className="mb-0">© {currentYear} EventHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
