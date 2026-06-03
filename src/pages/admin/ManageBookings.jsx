import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

const STATUS_CLASS = {
  confirmed: "confirmed",
  pending:   "pending",
  cancelled: "cancelled",
  booked:    "booked",
};

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function ManageBookings() {
  const [bookings, setBookings]               = useState([]);
  const [employees, setEmployees]             = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [assigning, setAssigning]             = useState(null);
  const [search, setSearch]                   = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [bookingsRes, employeesRes] = await Promise.all([
        axios.get(`${API}/v1/appointments/admin/bookings`, { headers }),
        axios.get(`${API}/v1/appointments/admin/employees`, { headers }),
      ]);
      const bookingData    = bookingsRes.data.data  || [];
      const activeEmployees = employeesRes.data.data || [];
      setBookings(bookingData);
      setEmployees(activeEmployees);
      setSelectedEmployees(
        bookingData.reduce((map, b) => { map[b.id] = b.staff_id || ""; return map; }, {})
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const assignEmployee = async (appointmentId, employeeId) => {
    if (!employeeId) return setError("Please select an employee first.");
    setError("");
    try {
      setAssigning(appointmentId);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API}/v1/appointments/${appointmentId}/assign`,
        { employee_id: Number(employeeId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign employee.");
    } finally {
      setAssigning(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.user_name  || "").toLowerCase().includes(q) ||
      (b.user_email || "").toLowerCase().includes(q) ||
      (b.services?.[0]?.title || "").toLowerCase().includes(q) ||
      (b.status     || "").toLowerCase().includes(q)
    );
  });

  const unassigned = bookings.filter((b) => !b.staff_id).length;
  const confirmed  = bookings.filter((b) => b.status === "confirmed").length;

  const formatDate = (date, time) => {
    if (!date) return "—";
    try {
      return new Date(`${date}T${time || "00:00"}`).toLocaleString("en-KE", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      });
    } catch { return date; }
  };

  return (
    <>
      {/* ── TOPBAR ── */}
      <div className="admin-topbar">
        <div>
          <div className="admin-topbar-title">Manage bookings</div>
          <div className="admin-topbar-sub">Assign staff and track appointment status</div>
        </div>
        <div className="admin-topbar-actions">
          <button
            className="admin-icon-btn"
            onClick={fetchBookings}
            disabled={loading}
            title="Refresh"
          >
            {loading ? "…" : "↻"}
          </button>
        </div>
      </div>

      {/* ── PAGE ── */}
      <div className="admin-page">

        {error && <div className="admin-error">{error}</div>}

        {/* Summary strip */}
        <div className="bookings-summary">
          <div className="bookings-summary-card">
            <div className="label">Total bookings</div>
            <div className="value">{bookings.length}</div>
          </div>
          <div className="bookings-summary-card">
            <div className="label">Unassigned</div>
            <div className={`value ${unassigned > 0 ? "warn" : "good"}`}>{unassigned}</div>
          </div>
          <div className="bookings-summary-card">
            <div className="label">Confirmed</div>
            <div className="value good">{confirmed}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bookings-table-card">
          <div className="bookings-table-toolbar">
            <span className="admin-card-title">All bookings</span>
            <input
              className="bookings-search"
              type="text"
              placeholder="Search by client, service, status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="admin-loading" style={{ padding: "32px 20px" }}>
              <div className="admin-spinner" /> Loading bookings…
            </div>
          ) : (
            <div className="bookings-table-wrap">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Date &amp; time</th>
                    <th>Status</th>
                    <th>Staff</th>
                    <th>Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          {search ? "No bookings match your search." : "No bookings yet."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b) => {
                      const isCancelled = b.status === "cancelled";
                      return (
                        <tr key={b.id}>
                          {/* Client */}
                          <td>
                            <div className="client-cell">
                              <div className="client-initials">
                                {initials(b.user_name)}
                              </div>
                              <div>
                                <div className="client-name">{b.user_name || "—"}</div>
                                <div className="client-email">{b.user_email || ""}</div>
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td>{b.services?.[0]?.title || "—"}</td>

                          {/* Date */}
                          <td style={{ whiteSpace: "nowrap" }}>
                            {formatDate(b.appointment_date, b.appointment_time)}
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`status-pill ${STATUS_CLASS[b.status] || ""}`}>
                              {b.status || "booked"}
                            </span>
                          </td>

                          {/* Current staff */}
                          <td>
                            {b.staff_name ? (
                              <span className="staff-chip">{b.staff_name}</span>
                            ) : (
                              <span className="staff-chip unassigned">Unassigned</span>
                            )}
                          </td>

                          {/* Assign control */}
                          <td>
                            <div className="assign-cell">
                              <select
                                className="assign-select"
                                value={selectedEmployees[b.id] ?? ""}
                                disabled={isCancelled || assigning === b.id}
                                onChange={(e) =>
                                  setSelectedEmployees((prev) => ({
                                    ...prev,
                                    [b.id]: e.target.value,
                                  }))
                                }
                              >
                                <option value="">Select staff</option>
                                {employees.map((emp) => (
                                  <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.first_name} {emp.last_name}
                                  </option>
                                ))}
                              </select>
                              <button
                                className={`assign-btn ${assigning === b.id ? "saving" : ""}`}
                                disabled={isCancelled || assigning === b.id}
                                onClick={() => assignEmployee(b.id, selectedEmployees[b.id])}
                              >
                                {assigning === b.id ? "Saving…" : b.staff_id ? "Reassign" : "Assign"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}