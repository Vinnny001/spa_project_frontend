import "../../assets/styles/Services.css";
import axios from "axios";
import { useState, useEffect } from "react";

const API =
  import.meta.env.MODE === "developmen"
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

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.phone) {
    setPhone(user.phone);
  }

  if (user?.email) {
    setEmail(user.email);
  }
}, []);


  const [loadingIndex, setLoadingIndex] = useState(null);

const handlePayment = async (amount, index) => {
  if (!phone) {
    alert("Enter phone number");
    return;
  }

  if (!email) {
    alert("Email missing");
    return;
  }

  try {
    setLoadingIndex(index);

    const response = await axios.post(
      `${API}/v1/payments/pay`,
      {
        phone_number: phone,
        email,
        amount: parseInt(amount),
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

    alert(
      error.response?.data?.message || "Payment failed"
    );

  } finally {
    setLoadingIndex(null);
  }
};

  const categories = [

    {
      name: "Massage 💆‍♀️",
      description:
        "Relaxing therapies that help relieve stress, body fatigue and muscle tension.",

      services: [

        {
          name: "Swedish Massage",
          price: "20",
          displayPrice: "KES 20",
          duration: "60 mins",

          description:
            "A gentle full-body massage that promotes relaxation and better circulation.",

          images: [s1, s2, s3, s4, s5]
        },

        {
          name: "Deep Tissue Massage",
          price: "2500",
          displayPrice: "KES 2500",
          duration: "75 mins",

          description:
            "Firm-pressure massage designed to relieve deeper muscle tension and pain.",

          images: [d1, d2, d3, d4]
        }

      ]
    },

    {
      name: "Nails 💅",
      description:
        "Professional nail care services for healthy, elegant and beautiful nails.",

      services: [

        {
          name: "Manicure",
          price: "1000",
          displayPrice: "KES 1000",
          duration: "30 mins",

          description:
            "Nail shaping, cuticle care and polish application for neat elegant hands.",

          images: [m1, m2, m3, m4]
        },

        {
          name: "Pedicure",
          price: "1500",
          displayPrice: "KES 1500",
          duration: "45 mins",

          description:
            "Relaxing foot treatment including soaking, scrubbing and massage.",

          images: [p1, p2, p3, p4, p5]
        }

      ]
    },

    {
      name: "Facials 🌸",
      description:
        "Professional skincare treatments that cleanse, refresh and brighten your skin.",

      services: [

        {
          name: "Glow Facial",
          price: "5",
          displayPrice: "KES 5",
          duration: "60 mins",

          description:
            "Deep cleansing facial treatment for glowing healthy skin.",

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

      <h1 className="services-title">
        ✨ Our Spa Services
      </h1>

      {/* PHONE INPUT */}
      <div className="payment-input">

  <label className="payment-label">
    Mpesa Phone Number: 
  </label>

  <input
    type="text"
    placeholder="Enter Mpesa Number e.g 0712345678"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />

</div>

      {categories.map((category, i) => (

        <section key={i} className="category-section">

          <h2 className="category-title">
            {category.name}
          </h2>

          <p className="category-description">
            {category.description}
          </p>

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
        onClick={() => handlePayment(service.price, uniqueIndex)}
      >
        {isLoading ? "Processing..." : "Book Appointment"}
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