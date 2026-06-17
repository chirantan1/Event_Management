import { Link } from "react-router-dom";
import {
  FaStar,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaHeart,
  FaRegHeart,
  FaClock,
  FaUsers,
} from "react-icons/fa";

function ServiceCard({
  service,
  viewMode = "grid",
  onWishlist,
  isWishlisted = false,
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  // Pass service data to booking page via state
  const handleViewDetails = () => {
    sessionStorage.setItem("selectedService", JSON.stringify(service));
  };

  if (viewMode === "list") {
    return (
      <div className="service-card-list">
        <div className="service-card-list-image">
          <img
            src={
              service.images?.[0] ||
              "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400"
            }
            alt={service.businessName}
          />
          {service.featured && (
            <span className="featured-badge-list">Featured</span>
          )}
        </div>

        <div className="service-card-list-content">
          <div className="service-card-list-header">
            <div>
              <h3 className="service-card-list-title">
                {service.businessName}
              </h3>
              <p className="service-card-list-provider">
                {service.providerName}
              </p>
            </div>
            <div className="service-card-list-rating">
              <FaStar className="star-icon" />
              <span className="rating-value">{service.averageRating}</span>
              <span className="rating-count">({service.totalReviews})</span>
            </div>
          </div>

          <p className="service-card-list-description">
            {service.description?.substring(0, 120)}...
          </p>

          <div className="service-card-list-details">
            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon" />
              <span>{service.city}</span>
            </div>
            <div className="detail-item">
              <FaUsers className="detail-icon" />
              <span>{service.maxCapacity} guests</span>
            </div>
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <span>{service.responseTime}</span>
            </div>
          </div>

          <div className="service-card-list-footer">
            <div className="service-card-list-price">
              <FaRupeeSign className="price-icon" />
              <span className="price-amount">
                {formatPrice(service.basePrice)}
              </span>
              {service.pricePerPerson > 0 && (
                <span className="price-unit"> per person</span>
              )}
            </div>
            <div className="service-card-list-actions">
              <button
                className="wishlist-btn"
                onClick={() => onWishlist?.(service._id)}
                aria-label="Add to wishlist"
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
              </button>
              <Link
                to={`/booking/${service._id}`}
                state={{ service }}
                className="view-details-btn"
                onClick={handleViewDetails}
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-card">
      {/* Animated blob background */}
      <div className="card-blob"></div>
      {/* Glass background */}
      <div className="card-bg"></div>

      {/* Content wrapper with higher z-index */}
      <div className="service-card-inner">
        {/* macOS-style window buttons */}
        <div className="window-controls">
          <div className="window-btn close"></div>
          <div className="window-btn minimize"></div>
          <div className="window-btn maximize"></div>
        </div>

        <div className="service-card-image">
          <img
            src={
              service.images?.[0] ||
              "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400"
            }
            alt={service.businessName}
          />
          {service.featured && <span className="featured-badge">Featured</span>}
          <button
            className="wishlist-btn-card"
            onClick={() => onWishlist?.(service._id)}
            aria-label="Add to wishlist"
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <div className="service-card-content">
          <div className="card-header">
            <div>
              <h3 className="card-title">{service.businessName}</h3>
              <p className="card-subtitle">{service.providerName}</p>
            </div>
            <div className="rating-badge">
              <FaStar className="star-icon" />
              <span className="rating-value">{service.averageRating}</span>
              <span className="rating-count">({service.totalReviews})</span>
            </div>
          </div>

          <p className="card-description">
            {service.shortDesc || service.description?.substring(0, 80)}...
          </p>

          <div className="info-grid">
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <span>{service.city}</span>
            </div>
            <div className="info-item">
              <FaUsers className="info-icon" />
              <span>{service.maxCapacity} guests</span>
            </div>
            <div className="info-item">
              <FaClock className="info-icon" />
              <span>{service.responseTime}</span>
            </div>
          </div>

          <div className="price-section">
            <div className="price">
              <FaRupeeSign className="price-icon" />
              <span className="price-amount">
                {formatPrice(service.basePrice)}
              </span>
              {service.pricePerPerson > 0 && (
                <span className="price-per-person">
                  + {formatPrice(service.pricePerPerson)}/person
                </span>
              )}
            </div>
            <Link
              to={`/booking/${service._id}`}
              state={{ service }}
              className="view-btn"
              onClick={handleViewDetails}
            >
              Book Now →
            </Link>
          </div>
        </div>
      </div>

      <style>
        {`
          /* Glassmorphism Grid View Styles */
          .service-card {
            position: relative;
            width: 100%;
            max-width: 340px;
            margin: 0 auto;
            border-radius: 24px;
            overflow: visible;
            display: flex;
            flex-direction: column;
            background: transparent;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Animated blob background */
          .card-blob {
            position: absolute;
            z-index: 0;
            top: 50%;
            left: 50%;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            opacity: 0.5;
            filter: blur(25px);
            animation: blob-bounce 8s infinite ease;
            pointer-events: none;
            transform: translate(-50%, -50%);
          }

          @keyframes blob-bounce {
            0% {
              transform: translate(-50%, -50%) translate3d(0, 0, 0);
            }
            25% {
              transform: translate(-50%, -50%) translate3d(30px, -20px, 0);
            }
            50% {
              transform: translate(-50%, -50%) translate3d(40px, 30px, 0);
            }
            75% {
              transform: translate(-50%, -50%) translate3d(-20px, 40px, 0);
            }
            100% {
              transform: translate(-50%, -50%) translate3d(0, 0, 0);
            }
          }

          /* Glass background layer */
          .card-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            outline: 1px solid rgba(255, 255, 255, 0.5);
            pointer-events: none;
          }

          /* Inner content wrapper */
          .service-card-inner {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            border-radius: 24px;
            overflow: hidden;
          }

          /* macOS-style window controls */
          .window-controls {
            position: absolute;
            top: 16px;
            left: 16px;
            display: flex;
            gap: 8px;
            z-index: 20;
          }

          .window-btn {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .window-btn.close {
            background-color: #ff5f56;
          }

          .window-btn.close:hover {
            background-color: #ff7b72;
          }

          .window-btn.minimize {
            background-color: #ffbd2e;
          }

          .window-btn.minimize:hover {
            background-color: #ffd34e;
          }

          .window-btn.maximize {
            background-color: #27c93f;
          }

          .window-btn.maximize:hover {
            background-color: #4cd964;
          }

          .service-card-image {
            position: relative;
            height: 200px;
            overflow: hidden;
            margin: 12px 12px 0 12px;
            border-radius: 16px;
            background: rgba(0, 0, 0, 0.05);
          }

          .service-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
          }

          .service-card:hover .service-card-image img {
            transform: scale(1.05);
          }

          .service-card:hover {
            transform: translateY(-6px);
          }

          .featured-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: #78350f;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            z-index: 15;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .wishlist-btn-card {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(4px);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            z-index: 15;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }

          .wishlist-btn-card:hover {
            transform: scale(1.08);
            background: white;
          }

          .wishlist-btn-card svg {
            color: #9ca3af;
            font-size: 18px;
          }

          .service-card-content {
            padding: 16px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
            position: relative;
            z-index: 2;
            background: transparent;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .card-header > div {
            flex: 1;
          }

          .card-title {
            font-size: 17px;
            font-weight: 800;
            color: #1f2937;
            margin: 0 0 4px 0;
            line-height: 1.35;
          }

          .card-subtitle {
            font-size: 12px;
            color: #6b7280;
            margin: 0;
          }

          .rating-badge {
            display: flex;
            align-items: center;
            gap: 5px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(4px);
            padding: 4px 10px;
            border-radius: 30px;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .star-icon {
            color: #fbbf24;
            font-size: 12px;
          }

          .rating-value {
            font-weight: 700;
            font-size: 13px;
            color: #1f2937;
          }

          .rating-count {
            font-size: 11px;
            color: #9ca3af;
          }

          .card-description {
            font-size: 12.5px;
            color: #4b5563;
            line-height: 1.5;
            margin: 0;
          }

          .info-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 10px 0;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          }

          .info-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #4b5563;
          }

          .info-icon {
            font-size: 12px;
            color: #6b7280;
          }

          .price-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            gap: 12px;
          }

          .price {
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;
            gap: 4px;
            flex: 1;
          }

          .price-icon {
            font-size: 12px;
            color: #059669;
          }

          .price-amount {
            font-size: 20px;
            font-weight: 800;
            color: #059669;
          }

          .price-per-person {
            font-size: 11px;
            color: #6b7280;
          }

          .price-unit {
            font-size: 12px;
            color: #6b7280;
          }

          /* Fix for View Details button */
          .view-btn {
            background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
            color: white !important;
            padding: 8px 20px !important;
            border-radius: 40px !important;
            text-decoration: none !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
            display: inline-block !important;
            white-space: nowrap !important;
            box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3) !important;
            cursor: pointer !important;
            border: none !important;
            z-index: 10 !important;
            position: relative !important;
            line-height: normal !important;
          }

          .view-btn:hover {
            background: linear-gradient(135deg, #4338ca, #4f46e5) !important;
            transform: translateX(3px) !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4) !important;
            color: white !important;
          }

          /* List View Styles */
          .service-card-list {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            display: flex;
            gap: 20px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.5);
            position: relative;
            z-index: 1;
          }

          .service-card-list:hover {
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.95);
          }

          .service-card-list-image {
            position: relative;
            width: 130px;
            height: 130px;
            flex-shrink: 0;
            border-radius: 18px;
            overflow: hidden;
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .service-card-list-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .featured-badge-list {
            position: absolute;
            top: 8px;
            left: 8px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: #78350f;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            z-index: 10;
          }

          .service-card-list-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .service-card-list-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
            gap: 12px;
          }

          .service-card-list-header > div {
            flex: 1;
          }

          .service-card-list-title {
            font-size: 18px;
            font-weight: 800;
            color: #1f2937;
            margin: 0 0 4px 0;
          }

          .service-card-list-provider {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
          }

          .service-card-list-rating {
            display: flex;
            align-items: center;
            gap: 5px;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(4px);
            padding: 4px 12px;
            border-radius: 30px;
            white-space: nowrap;
          }

          .service-card-list-description {
            font-size: 13px;
            color: #4b5563;
            line-height: 1.5;
            margin-bottom: 12px;
          }

          .service-card-list-details {
            display: flex;
            gap: 24px;
            margin-bottom: 12px;
            flex-wrap: wrap;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #4b5563;
          }

          .detail-icon {
            font-size: 13px;
            color: #6b7280;
          }

          .service-card-list-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            gap: 16px;
          }

          .service-card-list-price {
            display: flex;
            align-items: baseline;
            gap: 4px;
            flex: 1;
          }

          .service-card-list-actions {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .wishlist-btn {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(4px);
            border: none;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.2s ease;
            color: #ef4444;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .wishlist-btn:hover {
            background: white;
            transform: scale(1.08);
            color: #dc2626;
          }

          .view-details-btn {
            background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
            color: white !important;
            padding: 8px 24px !important;
            border-radius: 40px !important;
            text-decoration: none !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
            display: inline-block !important;
            white-space: nowrap !important;
            box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3) !important;
            cursor: pointer !important;
            border: none !important;
          }

          .view-details-btn:hover {
            background: linear-gradient(135deg, #4338ca, #4f46e5) !important;
            transform: translateX(2px) !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4) !important;
            color: white !important;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .service-card-list {
              flex-direction: column;
            }

            .service-card-list-image {
              width: 100%;
              height: 180px;
            }

            .service-card-list-details {
              flex-direction: column;
              gap: 8px;
            }

            .service-card-list-footer {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;
            }

            .service-card-list-actions {
              justify-content: space-between;
            }

            .service-card {
              max-width: 100%;
            }

            .window-controls {
              top: 12px;
              left: 12px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default ServiceCard;
