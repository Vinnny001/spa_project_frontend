import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "../assets/styles/Admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-layout">

      {/* ── SIDEBAR ── */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">🌸</div>
          <div className="admin-brand-text">
            <strong>Wonderland</strong>
            <span>Admin console</span>
          </div>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav-section">Overview</span>
          <NavLink to="/admin/dashboard" end>Dashboard</NavLink>

          <span className="admin-nav-section">Manage</span>
          <NavLink to="/admin/bookings">Bookings</NavLink>
          <NavLink to="/admin/services">Services</NavLink>
          <NavLink to="/admin/clients">Clients</NavLink>

          <span className="admin-nav-section">Settings</span>
          <NavLink to="/admin/settings">Settings</NavLink>
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
        <Outlet />
      </div>

    </div>
  );
}