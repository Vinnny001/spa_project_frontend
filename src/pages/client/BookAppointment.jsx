import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialService = location.state?.service || null;

  const [service, setService] = useState(initialService);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialService?.id || "",
  );
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        } catch (err) {
          setError("Failed to load services. Please try again later.");
        }
      };
      fetchServices();
    }
  }, [service, selectedServiceId]);

  useEffect(() => {
    if (selectedServiceId && !service) {
      const selected = services.find((svc) => svc.id === selectedServiceId);
      if (selected) {
        setService(selected);
      }
    }
  }, [selectedServiceId, services, service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedServiceId) {
      setError("Please choose a service.");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      setError("Please select a date and time for your appointment.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be signed in to book an appointment.");
      return;
    }

    const scheduled_at = `${scheduledDate}T${scheduledTime}:00`;

    try {
      setLoading(true);
      await axios.post(
        `${API}/v1/appointments`,
        {
          service_ids: [selectedServiceId],
          scheduled_at,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setSuccess("Appointment booked successfully. You can pay for it on My Appointments.");
      setTimeout(() => navigate("/client/my-appointments"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (event) => {
    const serviceId = Number(event.target.value);
    setSelectedServiceId(serviceId);
    const selected = services.find((svc) => svc.id === serviceId);
    if (selected) {
      setService(selected);
    }
  };

  return (
    <div className="book-appointment-page">
      <h1>Book Appointment</h1>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <label>
          Service
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
        </label>

        <label>
          Appointment Date
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
          />
        </label>

        <label>
          Appointment Time
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
          />
        </label>

        <label>
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special requests or preferences"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Booking..." : "Book Appointment"}
        </button>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
      </form>

      {service && (
        <div className="appointment-summary">
          <h2>Selected Service</h2>
          <p>{service.title}</p>
          <p>{service.description}</p>
          <p>Price: KES {service.price}</p>
        </div>
      )}
    </div>
  );
}
