import { useEffect, useState } from "react";
import axios from "axios";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

export default function ManageServices() {

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ 
    title: "", 
    service_name: "",
    price: "", 
    description: "",
    duration_minutes: "",
    status: "Available",
    category_id: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch all services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/v1/services`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setServices(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/v1/categories`);
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADD OR UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price || !form.duration_minutes) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`
      };

      if (editId !== null) {
        // Update
        await axios.patch(`${API}/v1/services/${editId}`, form, { headers });
        alert("Service updated successfully");
      } else {
        // Create
        await axios.post(`${API}/v1/services`, form, { headers });
        alert("Service created successfully");
      }

      // Refresh services list
      await fetchServices();
      setForm({ 
        title: "", 
        service_name: "",
        price: "", 
        description: "",
        duration_minutes: "",
        status: "Available"
      });
      setEditId(null);
    } catch (err) {
      console.error("Error saving service:", err);
      alert(err.response?.data?.message || "Failed to save service");
    } finally {
      setSubmitLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/v1/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("Service deleted successfully");
      await fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
      alert(err.response?.data?.message || "Failed to delete service");
    }
  };

  // EDIT
  const handleEdit = (service) => {
    setForm({
      title: service.title,
      service_name: service.service_name || "",
      price: service.price,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      status: service.status || "Available",
      category_id: service.category_id || ""
    });
    setEditId(service.id);
  };

  const handleCancel = () => {
    setForm({ 
      title: "", 
      service_name: "",
      price: "", 
      description: "",
      duration_minutes: "",
      status: "Available",
      category_id: ""
    });
    setEditId(null);
  };

  if (loading) {
    return <div className="admin-page"><h1>💆‍♀️ Manage Services</h1><p>Loading...</p></div>;
  }

  return (
    <div className="admin-page">

      <h1>💆‍♀️ Manage Services</h1>

      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

      {/* FORM */}
      <form className="admin-form" onSubmit={handleSubmit}>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Service Title (required)"
        />

        <input
          name="service_name"
          value={form.service_name}
          onChange={handleChange}
          placeholder="Service Name (optional)"
        />

        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          placeholder="Price (required)"
        />

        <input
          name="duration_minutes"
          type="number"
          value={form.duration_minutes}
          onChange={handleChange}
          placeholder="Duration in minutes (required)"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows="3"
        />

        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
        >
          <option value="">Select Category (optional)</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button disabled={submitLoading}>
            {submitLoading ? "Saving..." : editId ? "Update" : "Add"}
          </button>
          {editId && (
            <button type="button" onClick={handleCancel} style={{ backgroundColor: "#666" }}>
              Cancel
            </button>
          )}
        </div>

      </form>

      {/* LIST */}
      <div className="service-list">

        {services.map(s => (
          <div className="service-item" key={s.id}>

            <div>
              <h3>{s.title}</h3>
              {s.service_name && <p className="service-name">Name: {s.service_name}</p>}
              {s.category_name && <p className="category-name">Category: {s.category_name}</p>}
              <p>{s.description}</p>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                <span>KES {s.price}</span>
                <span>{s.duration_minutes} mins</span>
                <span style={{ color: s.status === "Available" ? "green" : "red" }}>
                  {s.status}
                </span>
              </div>
            </div>

            <div className="service-actions">

              <button onClick={() => handleEdit(s)}>
                Edit
              </button>

              <button onClick={() => handleDelete(s.id)} style={{ backgroundColor: "#dc3545" }}>
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}