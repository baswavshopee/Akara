import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="https://qbjlbtdwiqvmsovbfpgf.supabase.co/storage/v1/object/sign/akara-assests/Logo/AKARA.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTI5NWVlYi04ZWVmLTQwMjYtYTQzNS05ODI5ZWM1Y2QwNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJha2FyYS1hc3Nlc3RzL0xvZ28vQUtBUkEucG5nIiwiaWF0IjoxNzc3MTc4NzM0LCJleHAiOjQ5MzA3Nzg3MzR9.ZnWan6Mfw8Vng1dk3t4ZrSu1rYJjwV4a8PiRmHKzFz4" alt="AKARA Logo" style={{height: "45px", width: "auto", objectFit: "contain"}} />
        </Link>
        <h2 className="auth-title">Forgot password</h2>
        <p className="auth-subtitle">Enter your email and we'll send a reset link</p>

        {error && <div className="auth-error">{error}</div>}

        {sent ? (
          <div className="auth-success" style={{ marginTop: 16 }}>
            Check your inbox! A password reset link has been sent to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
