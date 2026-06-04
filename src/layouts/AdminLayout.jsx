import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../assets/styles/Admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topbar, setTopbar] = useState({ title: "", sub: "" });

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-layout">

      {/* ── OVERLAY (mobile) ── */}
      <div
        className={`admin-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {/* ── SIDEBAR ── */}
      <div className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">🌸</div>
          <div className="admin-brand-text">
            <strong>Wonderland</strong>
            <span>Admin console</span>
          </div>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav-section">Overview</span>
          <NavLink to="/admin/dashboard" end onClick={closeSidebar}>📊 Dashboard</NavLink>

          <span className="admin-nav-section">Manage</span>
          <NavLink to="/admin/bookings" onClick={closeSidebar}>📅 Bookings</NavLink>
          <NavLink to="/admin/services" onClick={closeSidebar}>✨ Services</NavLink>
          <NavLink to="/admin/clients" onClick={closeSidebar}>👥 Clients</NavLink>

          <span className="admin-nav-section">Settings</span>
          <NavLink to="/admin/settings" onClick={closeSidebar}>⚙️ Settings</NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-avatar">AD</div>
          <div className="admin-footer-info">
            <strong>Admin</strong>
            <span>{user?.username || "Super admin"}</span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
            ↩
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="admin-content">

        {/* ── TOPBAR ── */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div className="admin-topbar-titles">
              <div className="admin-topbar-title">{topbar.title}</div>
              <div className="admin-topbar-sub">{topbar.sub}</div>
            </div>
          </div>
          <div className="admin-topbar-actions">
            
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <Outlet context={{ setTopbar }} />

      </div>

    </div>
  );
}