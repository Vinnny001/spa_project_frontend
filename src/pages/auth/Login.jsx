import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

const headers = { "Content-Type": "application/json" };

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [step, setStep] = useState(1); // 1=email, 2=role+password, 3=2FA code
  const [selectedRole, setSelectedRole] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // STEP 1 — check email
      if (step === 1) {
        const res = await fetch(`${API}/v1/auth/check-email`, {
          method: "POST",
          headers,
          body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "User not found");
          return;
        }

        setRoles(data.roles);
        if (data.roles.length === 1) setSelectedRole(data.roles[0]);
        setStep(2);
      }

      // STEP 2 — validate password, send 2FA code
      else if (step === 2) {
        const res = await fetch(`${API}/v1/auth/login/initiate`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            role: selectedRole,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Login failed");
          return;
        }

        setStep(3);
      }

      // STEP 3 — verify 2FA code
      else if (step === 3) {
        const res = await fetch(`${API}/v1/auth/login/verify-code`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            email: form.email,
              role: selectedRole,
            code,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Invalid code");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("token", data.data.token);

        if (selectedRole === "admin")    navigate("/admin/dashboard");
        if (selectedRole === "supplier") navigate("/supplier/dashboard");
        if (selectedRole === "customer") navigate("/client/dashboard");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);
    try {
    const res = await fetch(`${API}/v1/auth/login/verify-code`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: form.email,
          role: selectedRole,
          code,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid code");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.token);

      if (selectedRole === "admin")    navigate("/admin/dashboard");
      if (selectedRole === "supplier") navigate("/supplier/dashboard");
      if (selectedRole === "customer") navigate("/client/dashboard");
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 💆‍♀️</h2>
        <p style={styles.subtitle}>Login to Beauty Wonderland Spa</p>

        {error && step !== 3 && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* EMAIL — always visible */}
          <input
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            style={{
              ...styles.input,
              background: step >= 2 ? "#f9f9f9" : "white",
              color: step >= 2 ? "#aaa" : "#000",
            }}
            disabled={step >= 2}
          />

          {/* STEP 2 — role selector + password */}
          {step >= 2 && (
            <>
              {roles.length > 1 && (
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    ...styles.input,
                    background: step === 3 ? "#f9f9f9" : "white",
                    color: step === 3 ? "#aaa" : "#000",
                  }}
                  disabled={step === 3}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}

              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                style={{
                  ...styles.input,
                  background: step === 3 ? "#f9f9f9" : "white",
                  color: step === 3 ? "#aaa" : "#000",
                }}
                disabled={step === 3}
              />
            </>
          )}

          {step < 3 && (
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Please wait..." : step === 1 ? "Next" : "Login"}
            </button>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#ec4899", fontWeight: "bold" }}>
            Signup
          </Link>
        </p>

        {/* 2FA CODE MODAL */}
        {step === 3 && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Verify your identity</h3>
              <p style={styles.modalSubtitle}>
                A 6-digit code was sent to
                <br />
                <strong>{form.email}</strong>
                <br />
                for your{" "}
                <span style={styles.roleBadge}>
                  {selectedRole.toUpperCase()}
                </span>{" "}
                account.
              </p>

              {error && <p style={styles.error}>{error}</p>}

              <input
                placeholder="· · · · · ·"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                style={styles.codeInput}
                autoFocus
              />

              <button
                onClick={handleVerifyCode}
                style={{
                  ...styles.button,
                  marginTop: "16px",
                  opacity: code.length !== 6 || loading ? 0.6 : 1,
                  cursor: code.length !== 6 || loading ? "not-allowed" : "pointer",
                }}
                disabled={code.length !== 6 || loading}
              >
                {loading ? "Verifying..." : "Confirm"}
              </button>

              <p
                style={styles.backLink}
                onClick={() => {
                  setStep(2);
                  setCode("");
                  setError("");
                }}
              >
                ← Go back
              </p>
            </div>
          </div>
        )}
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
    fontFamily: "Arial",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "18px",
    width: "340px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  title:    { marginBottom: "5px", color: "#d63384" },
  subtitle: { fontSize: "14px", marginBottom: "20px", color: "#777" },
  form:     { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg, #ff66b2, #ff99cc)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    fontSize: "14px",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "8px",
  },

  // Modal
  modalOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    zIndex: 10,
  },
  modal: {
    background: "white",
    padding: "32px 24px",
    borderRadius: "16px",
    width: "290px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    color: "#d63384",
    marginBottom: "10px",
    fontSize: "18px",
  },
  modalSubtitle: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "20px",
    lineHeight: "1.7",
  },
  roleBadge: {
    background: "#fce4ef",
    color: "#d63384",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  codeInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "2px solid #f48fb1",
    outline: "none",
    fontSize: "24px",
    textAlign: "center",
    letterSpacing: "10px",
    fontWeight: "bold",
    color: "#d63384",
    boxSizing: "border-box",
  },
  backLink: {
    fontSize: "13px",
    color: "#aaa",
    marginTop: "14px",
    cursor: "pointer",
  },
};