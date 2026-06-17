// frontend/src/pages/Privacy.jsx
import { Link } from "react-router-dom";

function Privacy() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h1 className="text-center mb-4">Privacy Policy</h1>
              <p className="text-muted text-center mb-4">
                Last updated: June 2024
              </p>

              <h4>1. Information We Collect</h4>
              <p>
                We collect information you provide directly, such as your name,
                email, phone number, and event details.
              </p>

              <h4 className="mt-4">2. How We Use Your Information</h4>
              <ul>
                <li>To provide and improve our services</li>
                <li>To communicate with you about events and updates</li>
                <li>To process transactions</li>
                <li>For customer support</li>
              </ul>

              <h4 className="mt-4">3. Information Sharing</h4>
              <p>
                We do not sell or share your personal information with third
                parties except:
              </p>
              <ul>
                <li>With event organizers when you book their events</li>
                <li>With payment processors for transaction processing</li>
                <li>When required by law</li>
              </ul>

              <h4 className="mt-4">4. Data Security</h4>
              <p>
                We implement security measures to protect your data. However, no
                method of transmission over the internet is 100% secure.
              </p>

              <h4 className="mt-4">5. Cookies</h4>
              <p>
                We use cookies to enhance your experience, remember your
                preferences, and analyze site usage.
              </p>

              <h4 className="mt-4">6. Your Rights</h4>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your account</li>
                <li>Opt-out of marketing communications</li>
              </ul>

              <h4 className="mt-4">7. Contact Us</h4>
              <p>
                If you have questions about our privacy policy, please contact
                us at support@eventhub.com
              </p>

              <h4 className="mt-4">8. Changes to This Policy</h4>
              <p>
                We may update this privacy policy periodically. We will notify
                you of any changes.
              </p>

              <div className="text-center mt-4">
                <Link to="/register" className="btn btn-primary">
                  Back to Registration
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
