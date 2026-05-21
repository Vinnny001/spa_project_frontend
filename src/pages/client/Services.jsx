import "../../assets/styles/Services.css";
import axios from "axios";
import { useState, useEffect } from "react";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

/* PEDICURE */
import p1 from "../../assets/images/1.jpeg";
import p2 from "../../assets/images/2.jpeg";
import p3 from "../../assets/images/3.jpeg";
import p4 from "../../assets/images/4.jpeg";
import p5 from "../../assets/images/5.jpeg";

/* MANICURE */
import m1 from "../../assets/images/11.jpeg";
import m2 from "../../assets/images/22.jpeg";
import m3 from "../../assets/images/33.jpeg";
import m4 from "../../assets/images/44.jpeg";

/* SWEDISH MASSAGE */
import s1 from "../../assets/images/111.jpeg";
import s2 from "../../assets/images/222.jpeg";
import s3 from "../../assets/images/333.jpeg";
import s4 from "../../assets/images/444.jpeg";
import s5 from "../../assets/images/555.jpeg";

/* DEEP TISSUE MASSAGE */
import d1 from "../../assets/images/1111.jpeg";
import d2 from "../../assets/images/2222.jpeg";
import d3 from "../../assets/images/3333.jpeg";
import d4 from "../../assets/images/4444.jpeg";

export default function Services() {

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.phone) setPhone(user.phone);
    if (user?.email) setEmail(user.email);
  }, []);

  // Open modal and store which service was clicked
  const openModal = (service, uniqueIndex) => {
    setSelectedService({ ...service, uniqueIndex });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedService(null);
  };

  const handlePayment = async () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }

    if (!email) {
      alert("Email missing");
      return;
    }

    try {
      setLoadingIndex(selectedService.uniqueIndex);
      closeModal();

      const response = await axios.post(
        `${API}/v1/payments/pay`,
        {
          phone_number: phone,
          email,
          amount: parseInt(selectedService.price),
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message);

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoadingIndex(null);
    }
  };

  const categories = [
    {
      name: "Massage 💆‍♀️",
      description: "Relaxing therapies that help relieve stress, body fatigue and muscle tension.",
      services: [
        {
          name: "Swedish Massage",
          price: "100",
          displayPrice: "KES 100",
          duration: "60 mins",
          description: "A gentle full-body massage that promotes relaxation and better circulation.",
          images: [s1, s2, s3, s4, s5]
        },
        {
          name: "Deep Tissue Massage",
          price: "2500",
          displayPrice: "KES 2500",
          duration: "75 mins",
          description: "Firm-pressure massage designed to relieve deeper muscle tension and pain.",
          images: [d1, d2, d3, d4]
        }
      ]
    },
    {
      name: "Nails 💅",
      description: "Professional nail care services for healthy, elegant and beautiful nails.",
      services: [
        {
          name: "Manicure",
          price: "1000",
          displayPrice: "KES 1000",
          duration: "30 mins",
          description: "Nail shaping, cuticle care and polish application for neat elegant hands.",
          images: [m1, m2, m3, m4]
        },
        {
          name: "Pedicure",
          price: "1500",
          displayPrice: "KES 1500",
          duration: "45 mins",
          description: "Relaxing foot treatment including soaking, scrubbing and massage.",
          images: [p1, p2, p3, p4, p5]
        }
      ]
    },
    {
      name: "Facials 🌸",
      description: "Professional skincare treatments that cleanse, refresh and brighten your skin.",
      services: [
        {
          name: "Glow Facial",
          price: "50",
          displayPrice: "KES 50",
          duration: "60 mins",
          description: "Deep cleansing facial treatment for glowing healthy skin.",
          images: [
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15",
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e"
          ]
        }
      ]
    }
  ];

  return (
    <div className="services-page">

      <h1 className="services-title">✨ Our Spa Services</h1>

      {categories.map((category, i) => (
        <section key={i} className="category-section">

          <h2 className="category-title">{category.name}</h2>
          <p className="category-description">{category.description}</p>

          <div className="services-container">
            {category.services.map((service, j) => {
              const uniqueIndex = `${i}-${j}`;
              const isLoading = loadingIndex === uniqueIndex;

              return (
                <div key={j} className="service-card">

                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>

                  <div className="service-images">
                    {service.images.map((img, k) => (
                      <img key={k} src={img} alt={service.name} />
                    ))}
                  </div>

                  <div className="service-details">
                    <span>{service.duration}</span>
                    <span>{service.displayPrice}</span>
                  </div>

                  <button
                    className="book-btn"
                    disabled={isLoading}
                    onClick={() => openModal(service, uniqueIndex)}
                  >
                    {isLoading ? "Processing..." : "Book Appointment"}
                  </button>

                </div>
              );
            })}
          </div>

        </section>
      ))}

      {/* PAYMENT MODAL */}
      {modalOpen && selectedService && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <button className="modal-close" onClick={closeModal}>✕</button>

            <h2 className="modal-title">📅 Book Appointment</h2>

            <div className="modal-service-info">
              <span className="modal-service-name">{selectedService.name}</span>
              <span className="modal-service-meta">
                {selectedService.duration} &nbsp;·&nbsp; {selectedService.displayPrice}
              </span>
            </div>

            <div className="modal-field">
              <label>Mpesa Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              className="modal-confirm-btn"
              onClick={handlePayment}
              disabled={loadingIndex !== null}
            >
              {loadingIndex !== null ? "Processing..." : `Pay ${selectedService.displayPrice}`}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}