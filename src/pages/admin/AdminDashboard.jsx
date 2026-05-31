import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL || window.location.origin;

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.debug("AdminDashboard mounted", { API, token });
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const [bookingsRes, servicesRes, statsRes] = await Promise.all([
          axios.get(`${API}/v1/appointments/admin/bookings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/v1/services`),
          axios.get(`${API}/v1/users/counts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBookings(bookingsRes.data.data || []);
        setServices(servicesRes.data.data || []);
        setClientsCount(statsRes.data.data?.customers || 0);
        setSuppliersCount(statsRes.data.data?.suppliers || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-page">
      <h1>🌸 Admin Dashboard</h1>
      <p>Overview of spa activity (data-driven)</p>
      <div className="admin-debug">
        <small>API: {API || "undefined"}</small>
        <small>Token: {token ? "present" : "missing"}</small>
      </div>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="dashboard-cards">
          <div className="admin-card">
            <h3>{bookings.length}</h3>
            <p>Total Bookings</p>
          </div>

          <div className="admin-card">
            <h3>{services.length}</h3>
            <p>Total Services</p>
          </div>

          <div className="admin-card">
            <h3>{clientsCount}</h3>
            <p>Total Clients</p>
          </div>

          <div className="admin-card">
            <h3>{suppliersCount}</h3>
            <p>Total Suppliers</p>
          </div>
        </div>
      )}
    </div>
  );
}