import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

// Shared
const Home = lazy(() => import("./pages/shared/Home"));
const Signup = lazy(() => import("./pages/shared/Signup"));
const Login = lazy(() => import("./pages/auth/Login"));

// Client
const ClientLayout = lazy(() => import("./layouts/ClientLayout"));
const Dashboard = lazy(() => import("./pages/client/Dashboard"));
const Profile = lazy(() => import("./pages/client/Profile"));
const Services = lazy(() => import("./pages/client/Services"));
const BookAppointment = lazy(() => import("./pages/client/BookAppointment"));
const MyAppointments = lazy(() => import("./pages/client/MyAppointments"));
const ServicesHistory = lazy(() => import("./pages/client/MyServicesHistory"));
const Notifications = lazy(() => import("./pages/client/Notifications"));
const Payment = lazy(() => import("./pages/client/Payments"));

// Admin
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageServices = lazy(() => import("./pages/admin/ManageServices"));
const ManageBookings = lazy(() => import("./pages/admin/ManageBookings"));
const ManageClients = lazy(() => import("./pages/admin/ManageClients"));

function App() {
  return (
    <Router>
      {/* ⏳ fallback while loading */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>

<Route path="/admin/*" element={<AdminLayout />}>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="services" element={<ManageServices />} />
  <Route path="bookings" element={<ManageBookings />} />
  <Route path="clients" element={<ManageClients />} />
</Route>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route
  path="/client/*"
  element={
    <ProtectedRoute>
      <ClientLayout />
    </ProtectedRoute>
  }
>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="services" element={<Services />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="my-appointments" element={<MyAppointments />} />
            <Route path="services-history" element={<ServicesHistory />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="payment" element={<Payment />} />
          </Route>

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;