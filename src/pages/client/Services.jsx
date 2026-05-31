import "../../assets/styles/Services.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

export default function Services() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/v1/services/available`);
        setServices(response.data.data || []);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const openBooking = (service) => {
    navigate("/client/book-appointment", { state: { service } });
  };

  const handleImageError = (imgUrl) => {
    setFailedImages(prev => new Set([...prev, imgUrl]));
  };

  // Transform image URLs from assets/images to public /images
  const transformImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f";
    
    // If it's a local path in assets/images, transform it to /images
    if (url.includes("assets/images")) {
      return url.replace(/.*assets\/images\//, "/images/");
    }
    
    return url;
  };

  // Group services by category
  const groupedByCategory = services.reduce((acc, service) => {
    const category = service.category_name || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  const getCategoryEmoji = (categoryName) => {
    if (categoryName.toLowerCase().includes("massage")) return "💆‍♀️";
    if (categoryName.toLowerCase().includes("nail")) return "💅";
    if (categoryName.toLowerCase().includes("facial")) return "🌸";
    return "✨";
  };

  if (loading) {
    return (
      <div className="services-page">
        <h1 className="services-title">✨ Our Spa Services</h1>
        <p style={{ textAlign: "center", padding: "2rem" }}>Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page">
        <h1 className="services-title">✨ Our Spa Services</h1>
        <p style={{ textAlign: "center", padding: "2rem", color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="services-page">

      <h1 className="services-title">✨ Our Spa Services</h1>

      {Object.entries(groupedByCategory).map(([category, categoryServices], i) => (
        <section key={category} className="category-section">

          <h2 className="category-title">{getCategoryEmoji(category)} {category}</h2>

          <div className="services-container">
            {categoryServices.map((service, j) => {
              const images = (service.images || []).map(transformImageUrl).filter(url => url);

              return (
                <div key={service.id} className="service-card">

                  <h3>{service.title}</h3>
                  <p className="service-description">{service.description}</p>

                  <div className="service-images">
                    {images.slice(0, 5).map((img, k) => (
                      <img key={k} src={img} alt={service.title} onError={() => handleImageError(img)} />
                    ))}
                  </div>

                  <div className="service-details">
                    <span>{service.duration_minutes} mins</span>
                    <span>KES {service.price}</span>
                  </div>

                  <button
                    className="book-btn"
                    onClick={() => openBooking(service)}
                  >
                    Book Appointment
                  </button>

                </div>
              );
            })}
          </div>

        </section>
      ))}


    </div>
  );
}