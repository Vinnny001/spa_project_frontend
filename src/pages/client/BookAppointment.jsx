import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Jost:wght@300;400;500&display=swap');

  .book-page {
    font-family: 'Jost', sans-serif;
    padding: 36px 24px;
    background: #fff5f7;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .book-header {
    margin-bottom: 4px;
  }

  .book-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    font-weight: 400;
    color: #1a1a2e;
    letter-spacing: 0.03em;
    margin: 0 0 6px;
  }

  .book-subtitle {
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #bbb;
  }

  .book-body {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    align-items: start;
  }

  @media (max-width: 820px) {
    .book-body { grid-template-columns: 1fr; }
  }

  /* ── FORM CARD ── */
  .book-form-card {
    background: white;
    border-radius: 20px;
    padding: 36px 32px;
    box-shadow: 0 4px 28px rgba(255,46,136,0.07);
    border: 1px solid rgba(255,46,136,0.07);
  }

  .form-section-label {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #ccc;
    margin-bottom: 18px;
    display: block;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 20px;
  }

  .form-field label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #aaa;
  }

  .form-field select,
  .form-field input,
  .form-field textarea {
    padding: 12px 16px;
    border: 1.5px solid #f0e0e8;
    border-radius: 10px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: #333;
    background: white;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }

  .form-field select:focus,
  .form-field input:focus,
  .form-field textarea:focus {
    border-color: #ff2e88;
    box-shadow: 0 0 0 3px rgba(255,46,136,0.08);
  }

  .form-field textarea {
    resize: vertical;
    min-height: 90px;
    line-height: 1.6;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    .form-row { grid-template-columns: 1fr; }
  }

  .form-divider {
    border: none;
    border-top: 1px solid #f5e6ea;
    margin: 24px 0;
  }

  .btn-submit {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #ff2e88, #ff6eb0);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    margin-top: 4px;
  }

  .btn-submit:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .book-alert {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    margin-top: 14px;
    line-height: 1.5;
  }

  .book-alert.error   { background: #fff0f5; color: #ff2e88; }
  .book-alert.success { background: #e8fdf0; color: #1abf6e; }

  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
  @keyframes spin { to { transform: rotate(360deg) } }

  /* ── SERVICE SUMMARY CARD ── */
  .book-summary-card {
    background: white;
    border-radius: 20px;
    padding: 28px 24px;
    box-shadow: 0 4px 28px rgba(255,46,136,0.07);
    border: 1px solid rgba(255,46,136,0.07);
    position: sticky;
    top: 24px;
  }

  .summary-eyebrow {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #ccc;
    margin-bottom: 16px;
    display: block;
  }

  .summary-service-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 400;
    color: #1a1a2e;
    margin-bottom: 10px;
    line-height: 1.2;
  }

  .summary-desc {
    font-size: 13px;
    color: #999;
    line-height: 1.7;
    margin-bottom: 20px;
  }

  .summary-divider {
    border: none;
    border-top: 1px dashed #f5e6ea;
    margin: 16px 0;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #777;
    margin-bottom: 10px;
  }

  .summary-row-label { color: #bbb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }

  .summary-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f5e6ea;
  }

  .summary-price-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #bbb;
  }

  .summary-price-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 500;
    color: #ff2e88;
  }

  .summary-price-currency {
    font-size: 14px;
    font-family: 'Jost', sans-serif;
    color: #ff6eb0;
    margin-right: 2px;
  }

  .summary-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #fff0f5;
    color: #ff2e88;
    border-radius: 20px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 14px;
  }

  .summary-placeholder {
    text-align: center;
    padding: 30px 0;
    color: #ddd;
  }

  .summary-placeholder-icon {
    font-size: 36px;
    margin-bottom: 10px;
  }

  .summary-placeholder-text {
    font-size: 13px;
    font-style: italic;
    color: #ccc;
  }
`;

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialService = location.state?.service || null;

  const [service, setService] = useState(initialService);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(initialService?.id || "");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!service) {
      const fetchServices = async () => {
        try {
          const response = await axios.get(`${API}/v1/services/available`);
          const available = response.data.data || [];
          setServices(available);
          if (!selectedServiceId && available.length > 0) {
            setSelectedServiceId(available[0].id);
            setService(available[0]);
          }
        } catch {
          setError("Failed to load services. Please try again later.");
        }
      };
      fetchServices();
    }
  }, [service, selectedServiceId]);

  useEffect(() => {
    if (selectedServiceId && services.length) {
      const selected = services.find((svc) => svc.id === selectedServiceId);
      if (selected) setService(selected);
    }
  }, [selectedServiceId, services]);

  const handleServiceChange = (e) => {
    const id = Number(e.target.value);
    setSelectedServiceId(id);
    const selected = services.find((svc) => svc.id === id);
    if (selected) setService(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedServiceId) { setError("Please choose a service."); return; }
    if (!scheduledDate || !scheduledTime) { setError("Please select a date and time."); return; }

    const token = localStorage.getItem("token");
    if (!token) { setError("You must be signed in to book an appointment."); return; }

    try {
      setLoading(true);
      await axios.post(
        `${API}/v1/appointments`,
        { service_ids: [selectedServiceId], scheduled_at: `${scheduledDate}T${scheduledTime}:00`, notes },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      setSuccess("Appointment booked! Redirecting to your appointments…");
      setTimeout(() => navigate("/client/my-appointments"), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="book-page">
        <div className="book-header">
          <h1 className="book-title">Book an Appointment</h1>
          <p className="book-subtitle">Reserve your next spa experience</p>
        </div>

        <div className="book-body">
          {/* ── FORM ── */}
          <div className="book-form-card">
            <span className="form-section-label">Service & Schedule</span>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Select Service</label>
                <select value={selectedServiceId} onChange={handleServiceChange}>
                  {service && !services.length ? (
                    <option value={service.id}>{service.title}</option>
                  ) : (
                    services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.title} — KES {svc.price}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    min={today}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <hr className="form-divider" />

              <div className="form-field">
                <label>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests, allergies or preferences…"
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Booking…" : "Confirm Booking"}
              </button>

              {error   && <div className="book-alert error">{error}</div>}
              {success && <div className="book-alert success">{success}</div>}
            </form>
          </div>

          {/* ── SUMMARY ── */}
          <div className="book-summary-card">
            <span className="summary-eyebrow">Selected Service</span>

            {service ? (
              <>
                <h2 className="summary-service-name">{service.title}</h2>
                {service.description && (
                  <p className="summary-desc">{service.description}</p>
                )}

                <hr className="summary-divider" />

                <div className="summary-row">
                  <span className="summary-row-label">Duration</span>
                  <span>{service.duration_minutes ? `${service.duration_minutes} min` : "—"}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-row-label">Category</span>
                  <span>{service.category_name || "—"}</span>
                </div>

                <div className="summary-price-row">
                  <span className="summary-price-label">Price</span>
                  <span className="summary-price-value">
                    <span className="summary-price-currency">KES</span>
                    {parseFloat(service.price || 0).toFixed(2)}
                  </span>
                </div>

                <span className="summary-badge">✦ Pay after booking</span>
              </>
            ) : (
              <div className="summary-placeholder">
                <div className="summary-placeholder-icon">🌸</div>
                <p className="summary-placeholder-text">Choose a service to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}