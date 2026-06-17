// frontend/src/pages/Terms.jsx
import { Link } from "react-router-dom";

function Terms() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h1 className="text-center mb-4">Terms of Service</h1>
              <p className="text-muted text-center mb-4">
                Last updated: June 2024
              </p>

              <h4>1. Acceptance of Terms</h4>
              <p>
                By using EventHub, you agree to these terms. If you don't agree,
                please don't use our service.
              </p>

              <h4 className="mt-4">2. User Accounts</h4>
              <p>
                You must create an account to use our services. You are
                responsible for maintaining the security of your account.
              </p>

              <h4 className="mt-4">3. Event Listings</h4>
              <p>
                Event organizers are responsible for the accuracy of their event
                information. We are not liable for any inaccuracies.
              </p>

              <h4 className="mt-4">4. Payments</h4>
              <p>
                All payments are processed securely through our payment
                partners. We do not store your payment information.
              </p>

              <h4 className="mt-4">5. Cancellations</h4>
              <p>
                Cancellation policies vary by event. Please check the specific
                event details for cancellation information.
              </p>

              <h4 className="mt-4">6. Prohibited Activities</h4>
              <p>
                You may not use our service for any illegal or unauthorized
                purpose.
              </p>

              <h4 className="mt-4">7. Disclaimer</h4>
              <p>
                We provide our service "as is" without any warranties. We are
                not responsible for any issues that arise from using our
                service.
              </p>

              <h4 className="mt-4">8. Changes to Terms</h4>
              <p>
                We may update these terms at any time. We will notify you of
                significant changes.
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

export default Terms;
