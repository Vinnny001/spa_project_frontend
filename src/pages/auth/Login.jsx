import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

const headers = {
  "Content-Type": "application/json",
};


export default function Login() {
  const navigate = useNavigate();

  

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");


  const [roles, setRoles] = useState([]);
  const [step, setStep] = useState(1); // 1 = email, 2 = role+password
  const [selectedRole, setSelectedRole] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  try {
    // STEP 1 → check email
    if (step === 1) {
      const res = await fetch(`${API}/v1/auth/check-email`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: form.email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "User not found");
        return;
      }

      setRoles(data.roles);

      // if only one role → auto select
      if (data.roles.length === 1) {
        setSelectedRole(data.roles[0]);
      }

      setStep(2);
    }

    // STEP 2 → login
    else {
      const res = await fetch(`${API}/v1/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: selectedRole
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ store user + token
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.token);

      // ✅ redirect by role
      if (selectedRole === "admin") navigate("/admin/dashboard");
      if (selectedRole === "supplier") navigate("/supplier/dashboard");
      if (selectedRole === "customer") navigate("/client/dashboard");
    }

  } catch (err) {
    setError("Server error");
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 💆‍♀️</h2>
        <p style={styles.subtitle}>Login to Beauty Wonderland Spa</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>

  {/* EMAIL ALWAYS */}
  <input
    name="email"
    placeholder="Email address"
    onChange={handleChange}
    style={styles.input}
    disabled={step === 2}
  />

  {/* STEP 2 ONLY */}
  {step === 2 && (
    <>
      {/* Role selection if multiple */}
      {roles.length > 1 && (
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.toUpperCase()}
            </option>
          ))}
        </select>
      )}

      {/* Password */}
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        style={styles.input}
      />
    </>
  )}

  <button type="submit" style={styles.button}>
    {step === 1 ? "Next" : "Login"}
  </button>

</form>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
  Don't have an account?{" "}
  <Link to="/signup" style={{ color: "#ec4899", fontWeight: "bold" }}>
    Signup
  </Link>
</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ffd6e8, #fff)",
    fontFamily: "Arial"
  },

  card: {
    background: "white",
    padding: "40px",
    borderRadius: "18px",
    width: "340px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center"
  },

  title: {
    marginBottom: "5px",
    color: "#d63384"
  },

  subtitle: {
    fontSize: "14px",
    marginBottom: "20px",
    color: "#777"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px"
  },

  button: {
    padding: "12px",
    background: "linear-gradient(90deg, #ff66b2, #ff99cc)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s"
  },

  error: {
    color: "red",
    fontSize: "13px"
  }
};