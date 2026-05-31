import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentAppointmentId, setPaymentAppointmentId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/v1/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartPayment = (appointmentId) => {
    setPaymentAppointmentId(appointmentId);
    setSuccess("");
    setTransactionId("");
  };

  const handlePay = async () => {
    if (!paymentAppointmentId) return;
    if (!transactionId) {
      setError("Please enter a transaction/reference ID.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const appointment = appointments.find(
        (appt) => appt.id === paymentAppointmentId,
      );
      const amount = appointment.services.reduce(
        (sum, service) => sum + parseFloat(service.price || 0),
        0,
      );

      await axios.post(
        `${API}/v1/appointments/${paymentAppointmentId}/payments`,
        {
          amount,
          method: paymentMethod,
          transaction_id: transactionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setSuccess("Payment recorded successfully.");
      setPaymentAppointmentId(null);
      setTransactionId("");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const isPaid = (appointment) =>
    appointment.payments &&
    appointment.payments.some((payment) => payment.status === "completed");

  return (
    <div className="my-appointments-page">
      <h1>My Appointments</h1>

      {loading && <p>Loading appointments...</p>}
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      {!loading && appointments.length === 0 && (
        <p>No appointments found yet.</p>
      )}

      {appointments.map((appointment) => {
        const totalAmount = appointment.services.reduce(
          (sum, service) => sum + parseFloat(service.price || 0),
          0,
        );
        const paid = isPaid(appointment);
        const paymentLabel = paid ? "Paid" : "Unpaid";

        return (
          <div key={appointment.id} className="appointment-card">
            <div className="appointment-header">
              <h2>Appointment #{appointment.id}</h2>
              <span className={`status ${appointment.status}`}>{appointment.status}</span>
            </div>
            <p>
              Scheduled: {new Date(appointment.scheduled_at).toLocaleString()}
            </p>
            <p>Staff: {appointment.staff_name || "TBD"}</p>
            <p>Payment status: {paymentLabel}</p>
            <div className="appointment-services">
              <h3>Services</h3>
              <ul>
                {appointment.services.map((service) => (
                  <li key={service.id}>
                    {service.title} — KES {service.price}
                  </li>
                ))}
              </ul>
            </div>
            <p>Total: KES {totalAmount.toFixed(2)}</p>

            {!paid && appointment.status !== "Cancelled" && (
  <div className="appointment-payment">
    <button
      className="book-btn"
      onClick={() => handleStartPayment(appointment.id)}
    >
      Pay for appointment
    </button>

    <button
      className="cancel-btn"
      onClick={() => handleCancelAppointment(appointment.id)}
    >
      Cancel Appointment
    </button>
  </div>
)}

            {paymentAppointmentId === appointment.id && (
              <div className="payment-form">
                <label>
                  Payment method
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label>
                  Transaction/Reference ID
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Mpesa or bank reference"
                  />
                </label>

                <button
                  className="modal-confirm-btn"
                  onClick={handlePay}
                  disabled={submitting}
                >
                  {submitting ? "Recording payment..." : "Confirm Payment"}
                </button>

                <button
                  type="button"
                  className="book-btn"
                  onClick={() => setPaymentAppointmentId(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
