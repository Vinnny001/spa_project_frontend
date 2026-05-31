import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const [bookingsRes, employeesRes] = await Promise.all([
        axios.get(`${API}/v1/appointments/admin/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/v1/appointments/admin/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bookingData = bookingsRes.data.data || [];
      const activeEmployees = employeesRes.data.data || [];

      setBookings(bookingData);
      setEmployees(activeEmployees);
      setSelectedEmployees(
        bookingData.reduce((map, booking) => {
          map[booking.id] = booking.staff_id || "";
          return map;
        }, {}),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const assignEmployee = async (appointmentId, employeeId) => {
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
      setError(err.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="admin-page">
      <h1>📅 Manage Bookings</h1>

      {loading && <p>Loading bookings...</p>}
      {error && <p className="error">{error}</p>}

      <div className="booking-list">
        {bookings.length === 0 && !loading && <p>No bookings available</p>}

        {bookings.map((b) => (
          <div className="booking-card" key={b.id}>
            <div>
              <h3>{b.services?.[0]?.title || "Service"}</h3>
              <p>👤 {b.user_name} — {b.user_email}</p>
              <p>📅 {b.appointment_date} {b.appointment_time}</p>
              <p>Staff: {b.staff_name || "Unassigned"} (id: {b.staff_id || "—"})</p>
              <span className={`status ${b.status || "Booked"}`}>{b.status}</span>
            </div>

            <div className="booking-actions">
              <label>
              Assign employee:
              <select
                value={selectedEmployees[b.id] ?? ""}
                onChange={(event) =>
                  setSelectedEmployees((prev) => ({
                    ...prev,
                    [b.id]: event.target.value,
                  }))
                }
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option
                    key={employee.employee_id}
                    value={employee.employee_id}
                  >
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                const val = selectedEmployees[b.id];
                if (!val) return setError("Select an employee");
                assignEmployee(b.id, val);
              }}
              disabled={assigning === b.id}
            >
              {assigning === b.id ? "Assigning..." : "Assign"}
            </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}