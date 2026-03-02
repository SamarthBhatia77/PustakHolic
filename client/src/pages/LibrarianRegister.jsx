import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import "./LibrarianRegister.css";

const EMPTY = {
  lName: "",
  lUserName: "",
  lPassword: "",
  lAge: "",
  lPhone: "",
  lAddress: "",
};

export default function LibrarianRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/librarians/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        sessionStorage.setItem("librarian", JSON.stringify(data.librarian));
        navigate("/librarian-profile");
      }
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="bg-grid" />
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      <div className="login-card">
        {/* ── Left panel ── */}
        <div className="card-left lib-left">
          <div className="library-icon">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="20" width="10" height="45" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="24" y="14" width="10" height="51" rx="2" fill="currentColor" opacity="0.7"/>
              <rect x="38" y="24" width="10" height="41" rx="2" fill="currentColor" opacity="0.85"/>
              <rect x="52" y="10" width="10" height="55" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="8" y="65" width="56" height="3" rx="1.5" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="brand-title"><span className="brand-hi">पुस्तक</span><span className="brand-en">holic</span></h1>
          <p className="brand-sub">Admin Portal</p>

          <div className="lib-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Verified Library Partner
          </div>

          <div className="left-deco">
            <span>"Libraries are the temples of learning."</span>
            <em>— Carl T Rowan</em>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="card-right">
          <h2 className="form-title">Register your Library</h2>
          <p className="form-subtitle">Create your librarian account to get started</p>

          <form onSubmit={handleSubmit} className="login-form lib-form" noValidate>

            {/* Row 1 — Name + Username */}
            <div className="form-row">
              <div className="field-group">
                <label htmlFor="lName">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </span>
                  <input id="lName" name="lName" type="text" placeholder="Rajesh Kumar"
                    value={form.lName} onChange={handleChange} required autoComplete="name" />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="lUserName">Username</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input id="lUserName" name="lUserName" type="text" placeholder="rajesh_lib"
                    value={form.lUserName} onChange={handleChange} required autoComplete="username" />
                </div>
              </div>
            </div>

            {/* Row 2 — Age + Phone */}
            <div className="form-row">
              <div className="field-group">
                <label htmlFor="lAge">Age</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                  </span>
                  <input id="lAge" name="lAge" type="number" placeholder="35" min="18" max="99"
                    value={form.lAge} onChange={handleChange} required />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="lPhone">Phone Number</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <input id="lPhone" name="lPhone" type="tel" placeholder="9876543210"
                    value={form.lPhone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Row 3 — Password */}
            <div className="field-group">
              <label htmlFor="lPassword">Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input id="lPassword" name="lPassword"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.lPassword} onChange={handleChange}
                  required autoComplete="new-password" />
                <button type="button" className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password visibility">
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Row 4 — Address (full width) */}
            <div className="field-group">
              <label htmlFor="lAddress">Library Address</label>
              <div className="input-wrap">
                <span className="input-icon" style={{ top: "1rem", alignSelf: "flex-start" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <textarea id="lAddress" name="lAddress"
                  placeholder="123, MG Road, Pune, Maharashtra 411001"
                  value={form.lAddress} onChange={handleChange}
                  required rows={2} className="lib-textarea" />
              </div>
            </div>

            {error && (
              <div className="error-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="submit-btn lib-submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Register Library"}
            </button>
          </form>

          <p className="register-prompt">
            Already registered?{" "}
            <button className="link-btn" onClick={() => navigate("/librarian-login")}>
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}