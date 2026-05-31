import { Link } from "react-router-dom";
import "../../assets/styles/Home.css";

export default function Home() {
  return (
    <div className="home">

      {/* FLOATING PARTICLES */}
      <div className="particles">
        <span>✨</span>
        <span>💖</span>
        <span>🌸</span>
        <span>✨</span>
        <span>💆‍♀️</span>
      </div>

      <div
        className="hero"
        style={{ backgroundImage: `url(/images/spa.jpg4.jpeg)` }}
      >

        <div className="overlay"></div>

        {/* FADE IN CONTAINER */}
        <div className="center-box fade-in">

          <h1>Beauty Wonderland Spa 💆‍♀️</h1>

          <p className="tagline">
            Your beauty, your confidence. <br />
            Where every style tells a story.
          </p>

          {/* BUTTONS */}
          <div className="buttons">
            <Link to="/login" className="btn glow">Login</Link>
            <Link to="/signup" className="btn glow secondary">Sign Up</Link>
          </div>

          {/* CTA DISPLAY ONLY */}
<div className="cta">
  Book Appointment Now 💅
</div>

          <div className="spacer"></div>

          {/* SERVICES */}
          <div className="services-panel">

            <div className="services-title">
              The services we offer;
            </div>

            <div className="services-grid">

              <div className="service-item">Massage 💆‍♀️</div>
              <div className="service-item">Nails 💅</div>

              <div className="service-item">Facials 🌸</div>
              <div className="service-item">Hair Styling 💇‍♀️</div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}