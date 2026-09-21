import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "../config";

function Login() {
  const [showpassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/todo");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="password-container">
        <input
          type={showpassword ? "text" : "password"}
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setShowPassword(!showpassword)}
          aria-label={showpassword ? "Hide password" : "Show password"}
        >
          {showpassword ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.9 10.9 0 0112 4c5.5 0 9.3 4.5 10 8-.3 1.4-1.1 2.9-2.2 4.1M6.2 6.2C4.1 7.7 2.6 10 2 12c.7 3.5 4.5 8 10 8 1.6 0 3.1-.4 4.4-1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <button onClick={handleSubmit}>Login</button>
      {error && <p className="error">{error}</p>}

      <p>
        Don't have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
export default Login;
