import { useState } from "react";
import api, { getErrorMessage } from "../services/api";

const initialForm = { name: "", email: "", phone: "", jobRole: "", skills: "" };

export default function ApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    const skills = form.skills.split(",").map((skill) => skill.trim()).filter(Boolean);

    if (skills.length === 0) {
      setError("Please enter at least one skill.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/applications", { ...form, skills });
      setMessage(response.data.message);
      setForm(initialForm);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</p>
        <h1>Make your next career move.</h1>
        <p className="hero-copy">Submit your application and let our team review your profile.</p>
      </section>

      <section className="form-card">
        <div className="section-heading">
          <div><p className="eyebrow">CANDIDATE FORM</p><h2>Job application</h2></div>
          <span className="required-note">* Required fields</span>
        </div>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Full name *<input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" required maxLength="80" /></label>
            <label>Email address *<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required /></label>
            <label>Phone number *<input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" pattern="[0-9+() -]{7,20}" required /></label>
            <label>Job role *<input name="jobRole" value={form.jobRole} onChange={handleChange} placeholder="e.g. Full Stack Developer" required maxLength="100" /></label>
            <label className="full-width">Skills *<textarea name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB, JavaScript (separate with commas)" rows="4" required /></label>
          </div>
          <button className="primary-button" disabled={loading}>{loading ? "Submitting..." : "Submit application"}</button>
        </form>
      </section>
    </main>
  );
}
