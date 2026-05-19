import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const API =
  import.meta.env.MODE === "developmen"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;

const headers = {
  "Content-Type": "application/json"
};

export default function Signup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    contact: "",
    gender: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer"
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Resend countdown state
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Start 30s countdown whenever the modal opens
  useEffect(() => {
    if (showVerificationModal) {
      startResendCountdown();
    }
    return () => clearInterval(countdownRef.current);
  }, [showVerificationModal]);

  const startResendCountdown = () => {
    setResendCountdown(30);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (role) => {
    setForm({ ...form, role });
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setVerificationCode("");
    setError("");
    clearInterval(countdownRef.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.role === "customer") {
      if (!form.firstName || !form.email || !form.password) {
        setError("Please fill all required customer fields");
        return;
      }
    }

    if (form.role === "supplier") {
      if (!form.firstName || !form.surname || !form.email || !form.password) {
        setError("Please fill all required supplier fields");
        return;
      }
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const safeGender =
      form.gender === "Prefer not to say" ? "Other" : form.gender;

    try {
      const res = await fetch(`${API}/v1/auth/register`, {
        method: "POST",
        headers,
        body: JSON.stringify(
          form.role === "customer"
            ? {
                firstName: form.firstName,
                surname: form.surname,
                contact: form.contact,
                gender: safeGender,
                email: form.email,
                password: form.password,
                role: "customer"
              }
            : {
                firstName: form.firstName,
                surname: form.surname,
                contact: form.contact,
                email: form.email,
                address: form.address,
                password: form.password,
                role: "supplier"
              }
        )
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Verification code sent to your email");
      setShowVerificationModal(true);

    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setError("Enter verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/v1/auth/verify-email`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: form.email, code: verificationCode })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      setSuccess("Email verified successfully");
      setShowVerificationModal(false);
      navigate("/");

    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API}/v1/auth/resend-verification`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: form.email, role: form.role })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend code");
        return;
      }

      setSuccess("Verification code resent!");
      startResendCountdown();

    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.card}>

          <h2>Create Account 💆‍♀️</h2>

          <div style={styles.toggle}>
            <button
              type="button"
              onClick={() => handleToggle("customer")}
              style={form.role === "customer" ? styles.activeToggle : styles.inactiveToggle}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleToggle("supplier")}
              style={form.role === "supplier" ? styles.activeToggle : styles.inactiveToggle}
            >
              Supplier
            </button>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          <form onSubmit={handleSubmit} style={styles.form}>

            {form.role === "customer" && (
              <>
                <input name="firstName" placeholder="First Name *" onChange={handleChange} style={styles.input} />
                <input name="surname" placeholder="Surname" onChange={handleChange} style={styles.input} />
                <input name="contact" placeholder="Contact" onChange={handleChange} style={styles.input} />
                <select name="gender" onChange={handleChange} style={styles.input}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </>
            )}

            {form.role === "supplier" && (
              <>
                <input name="firstName" placeholder="Supplier Name *" onChange={handleChange} style={styles.input} />
                <input name="surname" placeholder="Contact Person *" onChange={handleChange} style={styles.input} />
                <input name="contact" placeholder="Phone" onChange={handleChange} style={styles.input} />
                <input name="address" placeholder="Address" onChange={handleChange} style={styles.input} />
              </>
            )}

            <input name="email" placeholder="Email *" onChange={handleChange} style={styles.input} />
            <input name="password" type="password" placeholder="Password *" onChange={handleChange} style={styles.input} />
            <input name="confirmPassword" type="password" placeholder="Confirm Password *" onChange={handleChange} style={styles.input} />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Please wait..." : "Sign Up"}
            </button>

          </form>

          <p style={{ textAlign: "center", marginTop: "15px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#ec4899", fontWeight: "bold" }}>
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      {showVerificationModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              style={styles.closeButton}
              aria-label="Close verification modal"
            >
              ✕
            </button>

            <h3>Email Verification</h3>
            <p>Enter the verification code sent to:</p>
            <strong>{form.email}</strong>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              style={{ ...styles.input, marginTop: "15px" }}
            />

            <button onClick={handleVerifyEmail} style={styles.button} disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {/* Resend Button with countdown */}
            <div style={styles.resendWrapper}>
              <button
                onClick={handleResendCode}
                disabled={resendCountdown > 0 || loading}
                style={resendCountdown > 0 ? styles.resendButtonDisabled : styles.resendButton}
              >
                {resendCountdown > 0
                  ? `Resend code in ${resendCountdown}s`
                  : "Resend Code"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

const styles = {

  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ffd6e8, #fff)"
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    width: "380px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },

  toggle: {
    display: "flex",
    marginBottom: "15px",
    borderRadius: "8px",
    overflow: "hidden"
  },

  activeToggle: {
    flex: 1,
    padding: "10px",
    background: "#ec4899",
    color: "white",
    border: "none",
    cursor: "pointer"
  },

  inactiveToggle: {
    flex: 1,
    padding: "10px",
    background: "#eee",
    border: "none",
    cursor: "pointer"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box"
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    background: "#ec4899",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%"
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    position: "relative"
  },

  closeButton: {
    position: "absolute",
    top: "12px",
    right: "14px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
    lineHeight: 1,
    padding: "4px 6px",
    borderRadius: "4px"
  },

  resendWrapper: {
    marginTop: "14px"
  },

  resendButton: {
    background: "none",
    border: "none",
    color: "#ec4899",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
    padding: 0
  },

  resendButtonDisabled: {
    background: "none",
    border: "none",
    color: "#aaa",
    fontSize: "14px",
    cursor: "not-allowed",
    padding: 0
  }
};