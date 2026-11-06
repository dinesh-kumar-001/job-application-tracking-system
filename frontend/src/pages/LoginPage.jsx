import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <section className="login-card">
        <p className="eyebrow">ADMINISTRATOR ACCESS</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage candidate applications.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" /></label>
          <button className="primary-button full-button" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <Link className="back-link" to="/">← Back to application form</Link>
      </section>
    </main>
  );
}
