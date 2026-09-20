import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "../config";

function Signup() {
  const navigate = useNavigate();
  const [otploading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpsend, setOtpSend] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handlesendotp();
  };

  const handlesendotp = async () => {
    if (cooldown > 0 || otploading) return;
    setOtpLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }
      alert("OTP sent to your email successfully");
      setOtpSend(true);

      setCooldown(20);

      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Unable to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Invalid OTP");
        return;
      }

      alert("Account created successfully!");
      navigate("/login");
    } catch {
      setError("Unable to verify OTP. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {otpsend && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button type="button" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </>
        )}
        <button type="submit" disabled={otploading || cooldown > 0}>
          {otploading
            ? "Sending OTP..."
            : cooldown > 0
              ? `Resend OTP in ${cooldown}s`
              : "Send OTP"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
