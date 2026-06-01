import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Jost:wght@300;400;500&display=swap');

  .appt-page {
    font-family: 'Jost', sans-serif;
    padding: 32px 24px;
    background: #fff5f7;
    min-height: 100vh;
  }

  .appt-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px;
    font-weight: 400;
    color: #1a1a2e;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
  }

  .appt-subheading {
    font-size: 13px;
    color: #999;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 32px;
  }

  .appt-empty {
    text-align: center;
    color: #bbb;
    font-size: 15px;
    margin-top: 60px;
    font-style: italic;
  }

  .appt-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .appt-card {
    background: white;
    border-radius: 16px;
    padding: 24px 28px;
    box-shadow: 0 4px 24px rgba(255,46,136,0.06);
    border: 1px solid rgba(255,46,136,0.08);
    transition: box-shadow 0.2s;
  }

  .appt-card:hover {
    box-shadow: 0 8px 32px rgba(255,46,136,0.12);
  }

  .appt-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .appt-id {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 500;
    color: #1a1a2e;
  }

  .appt-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .badge-status-Booked      { background: #e8f4fd; color: #1a7abf; }
  .badge-status-Confirmed   { background: #e8fdf0; color: #1abf6e; }
  .badge-status-Completed   { background: #f0e8fd; color: #7a1abf; }
  .badge-status-Cancelled   { background: #fde8e8; color: #bf1a1a; }
  .badge-status-In\ Progress{ background: #fff8e1; color: #f59e0b; }
  .badge-status-No-show     { background: #f5f5f5; color: #999; }

  .badge-paid   { background: #e8fdf0; color: #1abf6e; }
  .badge-unpaid { background: #fff0f5; color: #ff2e88; }

  .appt-meta {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .appt-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .appt-meta-label {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #bbb;
  }

  .appt-meta-value {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .appt-divider {
    border: none;
    border-top: 1px solid #f5e6ea;
    margin: 16px 0;
  }

  .appt-services {
    margin-bottom: 16px;
  }

  .appt-services-title {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #bbb;
    margin-bottom: 8px;
  }

  .appt-service-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #444;
    padding: 4px 0;
    border-bottom: 1px dashed #f0e0e6;
  }

  .appt-service-row:last-child { border-bottom: none; }

  .appt-total {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    margin-top: 10px;
  }

  .appt-actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
    flex-wrap: wrap;
  }

  .btn-pay {
    padding: 10px 22px;
    background: linear-gradient(135deg, #ff2e88, #ff6eb0);
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
  }

  .btn-pay:hover { opacity: 0.88; transform: translateY(-1px); }

  .btn-cancel-appt {
    padding: 10px 22px;
    background: white;
    color: #999;
    border: 1px solid #eee;
    border-radius: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .btn-cancel-appt:hover { border-color: #ff2e88; color: #ff2e88; }

  /* ── MODAL ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20, 10, 20, 0.55);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

  .modal {
    background: white;
    border-radius: 20px;
    padding: 36px 32px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 20px 60px rgba(255,46,136,0.18);
    animation: slideUp 0.25s ease;
    position: relative;
  }

  @keyframes slideUp {
    from { transform: translateY(24px); opacity: 0 }
    to   { transform: translateY(0);    opacity: 1 }
  }

  .modal-close {
    position: absolute;
    top: 18px;
    right: 20px;
    background: none;
    border: none;
    font-size: 22px;
    color: #ccc;
    cursor: pointer;
    line-height: 1;
    transition: color 0.15s;
  }

  .modal-close:hover { color: #ff2e88; }

  .modal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 400;
    color: #1a1a2e;
    margin-bottom: 4px;
  }

  .modal-subtitle {
    font-size: 13px;
    color: #aaa;
    margin-bottom: 24px;
  }

  .modal-amount {
    background: #fff0f5;
    border-radius: 10px;
    padding: 14px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }

  .modal-amount-label { font-size: 12px; color: #bbb; text-transform: uppercase; letter-spacing: 0.1em; }
  .modal-amount-value { font-size: 22px; font-weight: 600; color: #ff2e88; }

  .modal-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .modal-field label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #bbb;
  }

  .modal-field select,
  .modal-field input {
    padding: 11px 14px;
    border: 1px solid #eee;
    border-radius: 8px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: #333;
    outline: none;
    transition: border-color 0.2s;
    background: white;
  }

  .modal-field select:focus,
  .modal-field input:focus { border-color: #ff2e88; }

  .btn-confirm {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #ff2e88, #ff6eb0);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.06em;
    cursor: pointer;
    margin-top: 6px;
    transition: opacity 0.2s;
  }

  .btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-confirm:not(:disabled):hover { opacity: 0.88; }

  .modal-error {
    background: #fff0f5;
    color: #ff2e88;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 14px;
  }

  .modal-success {
    background: #e8fdf0;
    color: #1abf6e;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 14px;
  }

  .appt-alert {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .appt-alert.error   { background: #fff0f5; color: #ff2e88; }
  .appt-alert.success { background: #e8fdf0; color: #1abf6e; }

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
`;

const formatScheduled = (appointment) => {
  const date = appointment.appointment_date
    ? new Date(appointment.appointment_date).toISOString().split("T")[0]
    : null;
  const time = appointment.appointment_time;
  if (!date || !time) return "N/A";
  return new Date(`${date}T${time}`).toLocaleString("en-KE", {
    weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const isPaid = (appointment) =>
  appointment.payment_status === "Paid" ||
  (appointment.payments?.some((p) => p.payment_status === "Paid") ?? false);

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAppointment, setModalAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchAppointments();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.phone) setPhone(user.phone);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setPageError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/v1/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data.data || []);
    } catch (err) {
      setPageError(err.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (appointment) => {
    setModalAppointment(appointment);
    setPaymentMethod("cash");
    setTransactionId("");
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAppointment(null);
    setModalError("");
  };

  const handlePay = async () => {
    if (!modalAppointment) return;
    setSubmitting(true);
    setModalError("");

    const token = localStorage.getItem("token");
    const amount = modalAppointment.services.reduce(
      (sum, s) => sum + parseFloat(s.price || 0), 0
    );

    try {
      if (paymentMethod === "mpesa") {
        if (!phone) { setModalError("Please provide your Mpesa phone number."); setSubmitting(false); return; }
        await axios.post(
          `${API}/v1/appointments/${modalAppointment.id}/payments`,
          { amount, method: "mpesa", phone_number: phone },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
        );
      } else {
        if (!transactionId) { setModalError("Please enter a transaction/reference ID."); setSubmitting(false); return; }
        await axios.post(
          `${API}/v1/appointments/${modalAppointment.id}/pay`,
          { amount, method: paymentMethod, transaction_id: transactionId },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
        );
      }
      closeModal();
      setPageSuccess("Payment recorded successfully.");
      fetchAppointments();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/v1/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPageSuccess("Appointment cancelled.");
      fetchAppointments();
    } catch (err) {
      setPageError(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="appt-page">
        <h1 className="appt-heading">My Appointments</h1>
        <p className="appt-subheading">Your upcoming & past bookings</p>

        {pageError   && <div className="appt-alert error">{pageError}</div>}
        {pageSuccess && <div className="appt-alert success">{pageSuccess}</div>}

        {loading && <p className="appt-empty">Loading your appointments…</p>}

        {!loading && appointments.length === 0 && (
          <p className="appt-empty">You have no appointments yet.</p>
        )}

        <div className="appt-list">
          {appointments.map((appt) => {
            const paid = isPaid(appt);
            const total = appt.services.reduce((s, svc) => s + parseFloat(svc.price || 0), 0);

            return (
              <div key={appt.id} className="appt-card">
                <div className="appt-card-header">
                  <span className="appt-id">Appointment #{appt.id}</span>
                  <div className="appt-badges">
                    <span className={`badge badge-status-${appt.status}`}>{appt.status}</span>
                    <span className={`badge ${paid ? "badge-paid" : "badge-unpaid"}`}>
                      {paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>

                <div className="appt-meta">
                  <div className="appt-meta-item">
                    <span className="appt-meta-label">Scheduled</span>
                    <span className="appt-meta-value">{formatScheduled(appt)}</span>
                  </div>
                  <div className="appt-meta-item">
                    <span className="appt-meta-label">Staff</span>
                    <span className="appt-meta-value">{appt.staff_name || "To be assigned"}</span>
                  </div>
                </div>

                <hr className="appt-divider" />

                <div className="appt-services">
                  <p className="appt-services-title">Services</p>
                  {appt.services.map((svc) => (
                    <div key={svc.id} className="appt-service-row">
                      <span>{svc.title}</span>
                      <span>KES {parseFloat(svc.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="appt-total">
                    <span>Total</span>
                    <span>KES {total.toFixed(2)}</span>
                  </div>
                </div>

                {!paid && appt.status !== "Cancelled" && (
                  <div className="appt-actions">
                    <button className="btn-pay" onClick={() => openPayModal(appt)}>
                      Pay for Appointment
                    </button>
                    <button className="btn-cancel-appt" onClick={() => handleCancel(appt.id)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PAYMENT MODAL ── */}
      {modalOpen && modalAppointment && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>×</button>

            <h2 className="modal-title">Complete Payment</h2>
            <p className="modal-subtitle">Appointment #{modalAppointment.id}</p>

            <div className="modal-amount">
              <span className="modal-amount-label">Amount Due</span>
              <span className="modal-amount-value">
                KES {modalAppointment.services.reduce((s, svc) => s + parseFloat(svc.price || 0), 0).toFixed(2)}
              </span>
            </div>

            {modalError && <div className="modal-error">{modalError}</div>}

            <div className="modal-field">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setTransactionId(""); setModalError(""); }}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mpesa">Mpesa</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            {paymentMethod === "mpesa" ? (
              <div className="modal-field">
                <label>Mpesa Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                />
              </div>
            ) : (
              <div className="modal-field">
                <label>Transaction / Reference ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter reference number"
                />
              </div>
            )}

            <button className="btn-confirm" onClick={handlePay} disabled={submitting}>
              {submitting && <span className="spinner" />}
              {submitting
                ? paymentMethod === "mpesa" ? "Processing Mpesa…" : "Recording Payment…"
                : paymentMethod === "mpesa" ? "Pay with Mpesa" : "Confirm Payment"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}