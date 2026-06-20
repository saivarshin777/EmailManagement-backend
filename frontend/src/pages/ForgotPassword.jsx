import { useState } from "react";
import API from "../services/api";
import AuthLayout from "../components/AuthLayout.jsx";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await API.post("/auth/forgot-password", {
        email,
      });

      alert(response.data.message || "Reset link sent");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="welcome-title">
        Forgot Password
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <button className="submit-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Link"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
