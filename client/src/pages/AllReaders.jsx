import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AllReaders.css";

export default function AllReaders() {
  const navigate = useNavigate();
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/readers/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setReaders(data.readers);
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = readers.filter(
    (r) =>
      r.rName.toLowerCase().includes(search.toLowerCase()) ||
      r.rUserName.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    sessionStorage.removeItem("reader");
    navigate("/login");
  };

  return (
    <div className="ar-root">
      <div className="ar-bg-grid" />
      <div className="ar-blob ar-blob-1" />
      <div className="ar-blob ar-blob-2" />

     

      {/* ── Page content ── */}
      <div className="ar-body">

        {/* Header */}
        <div className="ar-page-header">
          <div>
            <h1 className="ar-page-title">Our Readers</h1>
            <p className="ar-page-sub">
              {loading ? "Loading…" : `${readers.length} registered reader${readers.length !== 1 ? "s" : ""} in the community`}
            </p>
          </div>

          {/* Search */}
          <div className="ar-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="ar-search"
              type="text"
              placeholder="Search by name or username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="ar-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="ar-state">
            <div className="ar-spinner" />
            <p>Fetching readers…</p>
          </div>
        )}

        {!loading && error && (
          <div className="ar-state ar-state--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="ar-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>No readers match "<strong>{search}</strong>"</p>
          </div>
        )}

        {/* Reader cards grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="ar-grid">
            {filtered.map((r, i) => (
              <ReaderCard
                key={r.rID}
                reader={r}
                index={i}
                onClick={() => navigate(`/reader/${r.rID}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReaderCard({ reader, index, onClick }) {
  const initials = reader.rName
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      className="ar-card"
      style={{ animationDelay: `${index * 0.055}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Avatar */}
      <div className="ar-card__avatar">
        {reader.rImage ? (
          <img src={reader.rImage} alt={reader.rName} />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="ar-card__info">
        <h3 className="ar-card__name">{reader.rName}</h3>
        <p className="ar-card__username">@{reader.rUserName}</p>

        <div className="ar-card__meta">
          {reader.rAge && (
            <span className="ar-card__pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              {reader.rAge} yrs
            </span>
          )}
          {reader.rAddress && (
            <span className="ar-card__pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {reader.rAddress.length > 22
                ? reader.rAddress.slice(0, 22) + "…"
                : reader.rAddress}
            </span>
          )}
        </div>
      </div>

      {/* ID chip + arrow */}
      <div className="ar-card__right">
        <span className="ar-card__id">#{reader.rID}</span>
        <svg className="ar-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
}