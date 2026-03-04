import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import "./LibrarianRegister.css";

export default function LibrarianLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ lUserName: "", lPassword: "" });
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
      const res = await fetch("/api/librarians/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
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
              <rect x="8"  y="65" width="56" height="3"  rx="1.5" fill="currentColor"/>
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
          <h2 className="form-title">Welcome back</h2>
          <p className="form-subtitle">Sign in to your librarian account</p>

          <form onSubmit={handleSubmit} className="login-form lib-form" noValidate>

            <div className="field-group">
              <label htmlFor="lUserName">Username</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="lUserName" name="lUserName" type="text"
                  placeholder="rajesh_lib"
                  value={form.lUserName} onChange={handleChange}
                  required autoComplete="username"
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="lPassword">Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="lPassword" name="lPassword"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.lPassword} onChange={handleChange}
                  required autoComplete="current-password"
                />
                <button
                  type="button" className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8"  x2="12"    y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="submit-btn lib-submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>

          <p className="register-prompt">
            Not registered yet?{" "}
            <button className="link-btn" onClick={() => navigate("/librarian-register")}>
              Register your library
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}