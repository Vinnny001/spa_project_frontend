import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL || window.location.origin;

// Safe against null, undefined, and empty string
function initials(first, last) {
  const f = (first ?? "")[0] ?? "";
  const l = (last  ?? "")[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

// Safe full name display
function fullName(first, last) {
  return [first, last].filter(Boolean).join(" ") || "—";
}

export default function ManageClients() {
  const [clients, setClients]             = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [search, setSearch]               = useState("");
  const [error, setError]                 = useState("");
  const [actionError, setActionError]     = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving]               = useState(false);

  const token   = () => localStorage.getItem("token");
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchClients = async () => {
    try {
      const res  = await axios.get(`${API}/v1/users/customers`, { headers: headers() });
      const data = res.data.data || [];
      setClients(data);
      setFiltered(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load clients.");
    }
  };

  useEffect(() => { fetchClients(); }, []);

  // Live search filter
  useEffect(() => {
    if (!search.trim()) { setFiltered(clients); return; }
    const q = search.toLowerCase();
    setFiltered(
      clients.filter((c) =>
        fullName(c.first_name, c.last_name).toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
      )
    );
  }, [search, clients]);

  const handleEdit = (client) => {
    setActionError("");
    setEditingClient({ ...client });
  };

  const handleCancel = () => {
    setEditingClient(null);
    setActionError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editingClient) return;
    setSaving(true);
    setActionError("");
    try {
      await axios.put(
        `${API}/v1/users/customers/${editingClient.customer_id}`,
        {
          first_name: editingClient.first_name,
          last_name:  editingClient.last_name,
          gender:     editingClient.gender,
        },
        { headers: headers() }
      );
      await fetchClients();
      setEditingClient(null);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm("Delete this client permanently?")) return;
    setActionError("");
    try {
      await axios.delete(`${API}/v1/users/customers/${clientId}`, { headers: headers() });
      await fetchClients();
      if (editingClient?.customer_id === clientId) setEditingClient(null);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete client.");
    }
  };

  const withBookings = clients.filter((c) => c.bookings_count > 0).length;

  return (
    <>
      {/* ── TOPBAR ── */}
      <div className="admin-topbar">
        <div>
          <div className="admin-topbar-title">Manage clients</div>
          <div className="admin-topbar-sub">View, edit, or remove customers from the system</div>
        </div>
      </div>

      {/* ── PAGE ── */}
      <div className="admin-page">

        {error       && <div className="admin-error">{error}</div>}
        {actionError && <div className="admin-error">{actionError}</div>}

        {/* ── SUMMARY ── */}
        <div className="clients-summary">
          <div className="clients-summary-card">
            <div className="label">Total clients</div>
            <div className="value">{clients.length}</div>
          </div>
          <div className="clients-summary-card">
            <div className="label">With bookings</div>
            <div className="value">{withBookings}</div>
          </div>
          <div className="clients-summary-card">
            <div className="label">Showing</div>
            <div className="value">{filtered.length}</div>
          </div>
        </div>

        <div className="clients-body">

          {/* ── TABLE ── */}
          <div className="clients-table-card">
            <div className="clients-table-toolbar">
              <span className="admin-card-title">All clients</span>
              <input
                className="clients-search"
                type="text"
                placeholder="Search by name, email, or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="clients-table-wrap">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="clients-empty">
                          {search
                            ? "No clients match your search."
                            : "No clients registered yet."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c.customer_id}
                        className={
                          editingClient?.customer_id === c.customer_id
                            ? "active-row"
                            : ""
                        }
                      >
                        {/* Client cell */}
                        <td>
                          <div className="client-cell">
                            <div className="client-initials">
                              {initials(c.first_name, c.last_name)}
                            </div>
                            <div>
                              <div className="client-name">
                                {fullName(c.first_name, c.last_name)}
                              </div>
                              <div className="client-email">{c.email || ""}</div>
                            </div>
                          </div>
                        </td>

                        <td>{c.phone  || "—"}</td>
                        <td>{c.gender || "—"}</td>

                        {/* Actions */}
                        <td>
                          <div className="client-row-actions">
                            <button
                              className={`cl-action-btn edit ${
                                editingClient?.customer_id === c.customer_id
                                  ? "active"
                                  : ""
                              }`}
                              title="Edit client"
                              onClick={() => handleEdit(c)}
                            >
                              <i className="ti ti-edit" aria-hidden="true" />
                            </button>
                            <button
                              className="cl-action-btn danger"
                              title="Delete client"
                              onClick={() => handleDelete(c.customer_id)}
                            >
                              <i className="ti ti-trash" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── EDIT PANEL ── */}
          {editingClient && (
            <div className="clients-edit-panel">
              <div className="ep-head">
                <div className="ep-avatar">
                  {initials(editingClient.first_name, editingClient.last_name)}
                </div>
                <div className="ep-head-info">
                  <div className="ep-head-name">
                    {fullName(editingClient.first_name, editingClient.last_name)}
                  </div>
                  <div className="ep-head-email">
                    {editingClient.email || "No email"}
                  </div>
                </div>
                <span className="ep-editing-badge">Editing</span>
              </div>

              <div className="ep-body">
                <div className="ep-field">
                  <label>First name</label>
                  <input
                    name="first_name"
                    value={editingClient.first_name ?? ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="ep-field">
                  <label>Last name</label>
                  <input
                    name="last_name"
                    value={editingClient.last_name ?? ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="ep-field">
                  <label>Email</label>
                  <div className="ep-readonly">
                    {editingClient.email || "Not provided"}
                  </div>
                </div>

                <div className="ep-field">
                  <label>Phone</label>
                  <div className="ep-readonly">
                    {editingClient.phone || "Not provided"}
                  </div>
                </div>

                <div className="ep-field">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={editingClient.gender ?? ""}
                    onChange={handleChange}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="ep-field">
                  <label>Date of birth</label>
                  <div className="ep-readonly">
                    {editingClient.date_of_birth
                      ? editingClient.date_of_birth.split("T")[0]
                      : "Not provided"}
                  </div>
                </div>
              </div>

              <div className="ep-footer">
                <button
                  className="ep-btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button className="ep-btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}