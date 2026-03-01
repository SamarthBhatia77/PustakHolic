import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadThing } from "../utils/uploadthing";
import "@uploadthing/react/styles.css";
import "./UserProfile.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const [reader, setReader] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const { startUpload } = useUploadThing("profileImage", {
    onClientUploadComplete: async (res) => {
      const url = res[0].ufsUrl;
      try {
        const response = await fetch("/api/readers/update-image", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rID: reader.rID, imageUrl: url }),
        });
        if (!response.ok) throw new Error("Failed to save image.");
        const updated = { ...reader, rImage: url };
        setReader(updated);
        sessionStorage.setItem("reader", JSON.stringify(updated));
      } catch {
        setUploadError("Upload succeeded but failed to save. Try again.");
      } finally {
        setUploading(false);
      }
    },
    onUploadError: (err) => {
      setUploadError(err.message || "Upload failed.");
      setUploading(false);
    },
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("reader");
    if (!stored) navigate("/login");
    else setReader(JSON.parse(stored));
  }, [navigate]);

  const handleAvatarClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    await startUpload([file]);
    e.target.value = "";
  };

  const handleLogout = () => {
    sessionStorage.removeItem("reader");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmDelete) return;

    const password = prompt("Enter your password to confirm deletion:");
    if (!password) return;

    const response = await fetch("/api/readers/delete-account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rID: reader.rID, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    sessionStorage.removeItem("reader");
    navigate("/");
  };

  if (!reader) return null;

  const initials = reader.rName
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="rp-root">
      <div className="rp-bg-grid" />
      <div className="rp-blob rp-blob-1" />
      <div className="rp-blob rp-blob-2" />


      {/* ── Page layout ── */}
      <div className="rp-body">

        {/* LEFT SIDEBAR */}
        <aside className="rp-sidebar">

          {/* Big circular avatar */}
          <div
            className={`rp-avatar${uploading ? " rp-avatar--uploading" : ""}`}
            onClick={handleAvatarClick}
            title="Click to change photo"
          >
            {uploading ? (
              <div className="rp-avatar__spinner-wrap">
                <span className="rp-spinner" />
              </div>
            ) : reader.rImage ? (
              <img src={reader.rImage} alt={reader.rName} />
            ) : (
              <span className="rp-avatar__initials">{initials}</span>
            )}
            <div className="rp-avatar__overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Change photo</span>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={handleFileChange} />

          {uploading && <p className="rp-upload-status">Uploading…</p>}
          {uploadError && <p className="rp-upload-error">{uploadError}</p>}

          {/* Name / username */}
          <h1 className="rp-sidebar__name">{reader.rName}</h1>
          <p className="rp-sidebar__username">@{reader.rUserName}</p>

          {/* Badge */}
          <div className="rp-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Registered Reader
          </div>

          {/* Edit profile */}
          <button className="rp-edit-btn" onClick={() => navigate("/reader-edit")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit profile
          </button>

          <hr className="rp-divider" />

          {/* Meta rows */}
          <ul className="rp-meta">
            {reader.rAge && (
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {reader.rAge} years old
              </li>
            )}
            {reader.rAddress && (
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {reader.rAddress}
              </li>
            )}
          </ul>
          <button className="rp-delete-btn" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </aside>

        {/* RIGHT MAIN */}
        <main className="rp-main">

          {/* Header card */}
          <div className="rp-header-card">
            <div className="rp-header-card__inner">
              <div>
                <h2 className="rp-main__name">{reader.rName}</h2>
                <p className="rp-main__username">@{reader.rUserName}</p>
              </div>
              <span className="rp-id-chip">Reader #{reader.rID}</span>
            </div>
          </div>

          {/* Info grid */}
          <div className="rp-grid">
            <RpCard label="Full Name" value={reader.rName}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>}
            />
            <RpCard label="Username" value={`@${reader.rUserName}`}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
            />
            <RpCard label="Age" value={reader.rAge ? `${reader.rAge} years` : "—"}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}
            />
            <RpCard label="Reader ID" value={`#${reader.rID}`}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
            />
            <RpCard label="Address" value={reader.rAddress ?? "—"} wide
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function RpCard({ icon, label, value, wide }) {
  return (
    <div className={`rp-card${wide ? " rp-card--wide" : ""}`}>
      <div className="rp-card__icon">{icon}</div>
      <div className="rp-card__body">
        <span className="rp-card__label">{label}</span>
        <span className="rp-card__value">{value}</span>
      </div>
    </div>
  );
}