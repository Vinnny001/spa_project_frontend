import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL || window.location.origin;

export default function ManageClients() {

  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/v1/users/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load clients.");
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="admin-page">

      <h1>👤 Manage Clients</h1>

      <div className="client-list">
        {error && <p className="error">{error}</p>}

        {clients.length === 0 ? (
          <p>No clients registered</p>
        ) : (
          clients.map((c, i) => (
            <div className="client-card" key={i}>
              <h3>{c.first_name ? `${c.first_name} ${c.last_name}` : c.name}</h3>
              <p>{c.email}</p>
              <p>{c.phone}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}