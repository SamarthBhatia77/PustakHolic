import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SelectedReader.css";

export default function SelectedReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reader, setReader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/readers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setReader(data.reader);
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, [id]);

  const initials = reader
    ? reader.rName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <div className="sr-root">
      <div className="sr-bg-grid" />
      <div className="sr-blob sr-blob-1" />
      <div className="sr-blob sr-blob-2" />

      {/* Navbar */}
      <nav className="sr-nav">
        <div className="sr-nav-inner">
          <span className="sr-nav-logo">
            <span className="sr-nav-logo-hi">पुस्तक</span>holic
          </span>
          <div className="sr-nav-actions">
            <button className="sr-nav-back" onClick={() => navigate("/all-readers")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              All Readers
            </button>
          </div>
        </div>
      </nav>

      <div className="sr-body">

        {/* Loading */}
        {loading && (
          <div className="sr-state">
            <div className="sr-spinner" />
            <p>Loading reader…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="sr-state sr-state--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
            <button className="sr-btn-back" onClick={() => navigate("/all-readers")}>
              ← Back to All Readers
            </button>
          </div>
        )}

        {/* Profile */}
        {!loading && reader && (
          <div className="sr-profile">

            {/* Left sidebar */}
            <aside className="sr-sidebar">
              <div className="sr-avatar">
                {reader.rImage ? (
                  <img src={reader.rImage} alt={reader.rName} />
                ) : (
                  <span className="sr-avatar__initials">{initials}</span>
                )}
              </div>

              <h1 className="sr-sidebar__name">{reader.rName}</h1>
              <p className="sr-sidebar__username">@{reader.rUserName}</p>

              <div className="sr-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                Registered Reader
              </div>

              <hr className="sr-divider" />

              <ul className="sr-meta">
                {reader.rAge && (
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    {reader.rAge} years old
                  </li>
                )}
                {reader.rAddress && (
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {reader.rAddress}
                  </li>
                )}
              </ul>
            </aside>

            {/* Right main */}
            <main className="sr-main">
              <div className="sr-header-card">
                <div className="sr-header-card__inner">
                  <div>
                    <h2 className="sr-main__name">{reader.rName}</h2>
                    <p className="sr-main__username">@{reader.rUserName}</p>
                  </div>
                  <span className="sr-id-chip">Reader #{reader.rID}</span>
                </div>
              </div>

              <div className="sr-grid">
                <SrCard label="Full Name" value={reader.rName}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
                />
                <SrCard label="Username" value={`@${reader.rUserName}`}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                />
                <SrCard label="Age" value={reader.rAge ? `${reader.rAge} years` : "—"}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
                />
                <SrCard label="Reader ID" value={`#${reader.rID}`}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
                />
                <SrCard label="Address" value={reader.rAddress ?? "—"} wide
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                />
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

function SrCard({ icon, label, value, wide }) {
  return (
    <div className={`sr-card${wide ? " sr-card--wide" : ""}`}>
      <div className="sr-card__icon">{icon}</div>
      <div className="sr-card__body">
        <span className="sr-card__label">{label}</span>
        <span className="sr-card__value">{value}</span>
      </div>
    </div>
  );
}