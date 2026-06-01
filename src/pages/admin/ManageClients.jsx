import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL || window.location.origin;

export default function ManageClients() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/v1/users/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load clients.");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (client) => {
    setActionError("");
    setEditingClient({ ...client });
  };

  const handleCancel = () => {
    setEditingClient(null);
    setActionError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditingClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editingClient) return;
    setSaving(true);
    setActionError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/v1/users/customers/${editingClient.customer_id}`,
        {
          first_name: editingClient.first_name,
          last_name: editingClient.last_name,
          gender: editingClient.gender,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchClients();
      setEditingClient(null);
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Failed to save client.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId) => {
    const confirmed = window.confirm("Delete this client permanently?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/v1/users/customers/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchClients();
      if (editingClient?.customer_id === clientId) {
        setEditingClient(null);
      }
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Failed to delete client.");
    }
  };

  return (
    <div className="admin-page">
      <div className="manage-header">
        <h1>👤 Manage Clients</h1>
        <p>View, edit, or remove customers from the system.</p>
      </div>

      <div className="client-list">
        {error && <p className="error">{error}</p>}
        {actionError && <p className="error">{actionError}</p>}

        {clients.length === 0 ? (
          <p>No clients registered</p>
        ) : (
          clients.map((c) => (
            <div className="client-card" key={c.customer_id}>
              <div>
                <h3>{`${c.first_name || ""} ${c.last_name || ""}`.trim()}</h3>
                <p>{c.email}</p>
                <p>{c.phone}</p>
              </div>
              <div className="client-actions">
                <button type="button" onClick={() => handleEdit(c)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(c.customer_id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingClient && (
        <div className="client-edit-panel">
          <h2>Edit Client</h2>
          <div className="form-row">
            <label>First name</label>
            <input
              name="first_name"
              value={editingClient.first_name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Last name</label>
            <input
              name="last_name"
              value={editingClient.last_name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Email</label>
            <p className="readonly-field">{editingClient.email || "Not provided"}</p>
          </div>
          <div className="form-row">
            <label>Phone</label>
            <p className="readonly-field">{editingClient.phone || "Not provided"}</p>
          </div>
          <div className="form-row">
            <label>Gender</label>
            <select name="gender" value={editingClient.gender || ""} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="form-row">
            <label>Date of birth</label>
            <p className="readonly-field">{editingClient.date_of_birth ? editingClient.date_of_birth.split("T")[0] : "Not provided"}</p>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
