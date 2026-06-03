import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

const EMPTY_FORM = {
  title: "",
  service_name: "",
  price: "",
  description: "",
  duration_minutes: "",
  status: "Available",
  category_id: "",
};

// Pick a contextual icon per category name
function categoryIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("massage") || n.includes("stone")) return "ti-seeding";
  if (n.includes("facial") || n.includes("face"))   return "ti-sparkles";
  if (n.includes("nail") || n.includes("mani") || n.includes("pedi")) return "ti-hand-stop";
  if (n.includes("hair"))  return "ti-scissors";
  if (n.includes("body"))  return "ti-wave-sine";
  return "ti-spa";
}

export default function ManageServices() {
  const [services, setServices]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [editId, setEditId]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError]               = useState("");
  const [formError, setFormError]       = useState("");

  const token = () => localStorage.getItem("token");
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/v1/services`, { headers: headers() });
      setServices(res.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/v1/categories`);
      setCategories(res.data.data || []);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title || !form.price || !form.duration_minutes) {
      setFormError("Title, price, and duration are required.");
      return;
    }

    try {
      setSubmitLoading(true);
      if (editId !== null) {
        await axios.patch(`${API}/v1/services/${editId}`, form, { headers: headers() });
      } else {
        await axios.post(`${API}/v1/services`, form, { headers: headers() });
      }
      await fetchServices();
      setForm(EMPTY_FORM);
      setEditId(null);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save service.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (s) => {
    setForm({
      title:            s.title,
      service_name:     s.service_name     || "",
      price:            s.price,
      description:      s.description      || "",
      duration_minutes: s.duration_minutes,
      status:           s.status           || "Available",
      category_id:      s.category_id      || "",
    });
    setEditId(s.id);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/v1/services/${id}`, { headers: headers() });
      await fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete service.");
    }
  };

  return (
    <>
      {/* ── TOPBAR ── */}
      <div className="admin-topbar">
        <div>
          <div className="admin-topbar-title">Manage services</div>
          <div className="admin-topbar-sub">Add, edit, and organise your spa treatments</div>
        </div>
      </div>

      {/* ── PAGE ── */}
      <div className="admin-page">

        {error && <div className="admin-error">{error}</div>}

        <div className="services-body">

          {/* ── FORM ── */}
          <div className="services-form-card">
            <div className="services-form-head">
              <span className="services-form-head-title">
                {editId ? "Edit service" : "Add service"}
              </span>
              {editId && <span className="services-edit-badge">Editing</span>}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="services-form-body">

                {formError && (
                  <div className="admin-error" style={{ marginBottom: 0 }}>
                    {formError}
                  </div>
                )}

                <div className="svc-field">
                  <label>Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Deep tissue massage"
                  />
                </div>

                <div className="svc-field">
                  <label>Service name</label>
                  <input
                    name="service_name"
                    value={form.service_name}
                    onChange={handleChange}
                    placeholder="Internal name (optional)"
                  />
                </div>

                <div className="svc-form-row">
                  <div className="svc-field">
                    <label>Price (KES) *</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="svc-field">
                    <label>Duration (min) *</label>
                    <input
                      name="duration_minutes"
                      type="number"
                      min="1"
                      value={form.duration_minutes}
                      onChange={handleChange}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="svc-field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="What does this service include?"
                    rows={3}
                  />
                </div>

                <div className="svc-form-row">
                  <div className="svc-field">
                    <label>Category</label>
                    <select name="category_id" value={form.category_id} onChange={handleChange}>
                      <option value="">No category</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="svc-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="services-form-actions">
                <button type="submit" className="svc-btn-primary" disabled={submitLoading}>
                  {submitLoading ? "Saving…" : editId ? "Update service" : "Add service"}
                </button>
                {editId && (
                  <button type="button" className="svc-btn-ghost" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── LIST ── */}
          <div className="services-list-card">
            <div className="services-list-head">
              <span className="services-list-head-title">All services</span>
              <span className="services-count">{services.length} service{services.length !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
              <div className="admin-loading" style={{ padding: "32px 20px" }}>
                <div className="admin-spinner" /> Loading services…
              </div>
            ) : services.length === 0 ? (
              <div className="services-empty">No services yet. Add one using the form.</div>
            ) : (
              services.map((s) => (
                <div className="svc-item" key={s.id}>
                  <div className="svc-item-icon">
                    <i className={`ti ${categoryIcon(s.category_name || s.title)}`} aria-hidden="true" />
                  </div>

                  <div className="svc-item-body">
                    <div className="svc-item-title">{s.title}</div>
                    {s.description && (
                      <div className="svc-item-desc">{s.description}</div>
                    )}
                    <div className="svc-item-meta">
                      <span className="svc-chip">
                        KES {parseFloat(s.price || 0).toLocaleString()}
                      </span>
                      <span className="svc-chip">
                        {s.duration_minutes} min
                      </span>
                      {s.category_name && (
                        <span className="svc-chip">{s.category_name}</span>
                      )}
                      <span className={`svc-chip ${s.status === "Available" ? "svc-chip-available" : "svc-chip-unavailable"}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>

                  <div className="svc-item-actions">
                    <button
                      className="svc-action-btn edit"
                      title="Edit service"
                      onClick={() => handleEdit(s)}
                    >
                      <i className="ti ti-edit" aria-hidden="true" />
                    </button>
                    <button
                      className="svc-action-btn danger"
                      title="Delete service"
                      onClick={() => handleDelete(s.id)}
                    >
                      <i className="ti ti-trash" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}