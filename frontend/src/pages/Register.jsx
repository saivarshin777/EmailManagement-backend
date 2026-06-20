import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);

    if (e.target.name === "confirmPassword" || e.target.name === "password") {
      const pwd = e.target.name === "password" ? e.target.value : updated.password;
      const confirmPwd = e.target.name === "confirmPassword" ? e.target.value : updated.confirmPassword;
      if (confirmPwd && pwd !== confirmPwd) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      alert(response.data.message || "Registration Successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="logo-section">
        <div className="logo-box">MN</div>
        <div>
          <h2>
           <span className="mail-text">Mail </span>
           <span className="nova-text">Nova</span>
          </h2>
          <p>Smart Mail. Secure Access.</p>
        </div>
      </div>

      <div className="tabs">
        <Link to="/login">
          <button>Login</button>
        </Link>
        <button className="active-tab">Register</button>
      </div>

      <h1 className="welcome-title">Create Account</h1>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          onChange={handleChange}
          placeholder="Password"
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          onChange={handleChange}
          placeholder="Re-enter your password"
          required
          style={{ borderColor: passwordError ? "#e74c3c" : "" }}
        />

        {passwordError && (
          <p style={{ color: "#e74c3c", fontSize: "13px", marginTop: "6px" }}>
            {passwordError}
          </p>
        )}

        <button className="submit-btn" disabled={loading || !!passwordError}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
