import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import AuthLayout from "../components/AuthLayout.jsx";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await API.post(
        `/auth/reset-password/${token}`,
        { password }
      );

      alert(response.data.message || "Password Updated");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="welcome-title">
        Reset Password
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button className="submit-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
