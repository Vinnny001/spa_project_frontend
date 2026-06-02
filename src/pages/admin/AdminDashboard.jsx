import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL || window.location.origin;

const STATUS_CLASS = { confirmed: "confirmed", pending: "pending", cancelled: "cancelled" };

export default function AdminDashboard() {
  const [bookings, setBookings]       = useState([]);
  const [services, setServices]       = useState([]);
  const [clientsCount, setClients]    = useState(0);
  const [suppliersCount, setSuppliers] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [bookingsRes, servicesRes, statsRes] = await Promise.all([
          axios.get(`${API}/v1/appointments/admin/bookings`, { headers }),
          axios.get(`${API}/v1/services`),
          axios.get(`${API}/v1/users/counts`, { headers }),
        ]);
        setBookings(bookingsRes.data.data || []);
        setServices(servicesRes.data.data || []);
        setClients(statsRes.data.data?.customers || 0);
        setSuppliers(statsRes.data.data?.suppliers || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const recentBookings = bookings.slice(0, 5);

  return (
    <>
      {/* ── TOP BAR ── */}
      <div className="admin-topbar">
        <div>
          <div className="admin-topbar-title">Dashboard</div>
          <div className="admin-topbar-sub">{today}</div>
        </div>
        <div className="admin-topbar-actions">
          <Link to="/admin/bookings" className="admin-icon-btn" title="Bookings">📅</Link>
          <div className="admin-icon-btn" title="Notifications">🔔</div>
        </div>
      </div>

      {/* ── PAGE ── */}
      <div className="admin-page">

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            Loading dashboard…
          </div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : (
          <>
            {/* ── METRIC CARDS ── */}
            <div className="admin-metrics">
              <div className="admin-metric">
                <div className="admin-metric-top">
                  <div className="admin-metric-icon pink">📅</div>
                </div>
                <div className="admin-metric-val">{bookings.length}</div>
                <div className="admin-metric-label">Total bookings</div>
              </div>

              <div className="admin-metric">
                <div className="admin-metric-top">
                  <div className="admin-metric-icon teal">✨</div>
                </div>
                <div className="admin-metric-val">{services.length}</div>
                <div className="admin-metric-label">Services</div>
              </div>

              <div className="admin-metric">
                <div className="admin-metric-top">
                  <div className="admin-metric-icon purple">👥</div>
                </div>
                <div className="admin-metric-val">{clientsCount}</div>
                <div className="admin-metric-label">Clients</div>
              </div>

              <div className="admin-metric">
                <div className="admin-metric-top">
                  <div className="admin-metric-icon amber">🚚</div>
                </div>
                <div className="admin-metric-val">{suppliersCount}</div>
                <div className="admin-metric-label">Suppliers</div>
              </div>
            </div>

            {/* ── TABLE + QUICK ACTIONS ── */}
            <div className="admin-grid">

              <div className="admin-card">
                <div className="admin-card-header">
                  <span className="admin-card-title">Recent bookings</span>
                  <Link to="/admin/bookings" className="admin-card-action">View all →</Link>
                </div>
                {recentBookings.length === 0 ? (
                  <p style={{ padding: "20px 18px", color: "#ccc", fontSize: 13 }}>No bookings yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b.id}>
                          <td>{b.client_name || b.user_name || "—"}</td>
                          <td>{b.service_name || "—"}</td>
                          <td>{b.scheduled_at
                            ? new Date(b.scheduled_at).toLocaleDateString("en-KE", { day: "numeric", month: "short" })
                            : "—"}
                          </td>
                          <td>
                            <span className={`status-pill ${STATUS_CLASS[b.status] || ""}`}>
                              {b.status || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <span className="admin-card-title">Quick actions</span>
                </div>
                <Link to="/admin/services" className="admin-quick-item">
                  <div className="admin-quick-icon">＋</div>
                  <div>
                    <div className="admin-quick-label">Add service</div>
                    <div className="admin-quick-sub">New treatment</div>
                  </div>
                </Link>
                <Link to="/admin/bookings" className="admin-quick-item">
                  <div className="admin-quick-icon">📋</div>
                  <div>
                    <div className="admin-quick-label">All bookings</div>
                    <div className="admin-quick-sub">Manage schedule</div>
                  </div>
                </Link>
                <Link to="/admin/clients" className="admin-quick-item">
                  <div className="admin-quick-icon">👤</div>
                  <div>
                    <div className="admin-quick-label">Clients</div>
                    <div className="admin-quick-sub">View all clients</div>
                  </div>
                </Link>
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}