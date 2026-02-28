import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadThing } from "../utils/uploadthing";
import "@uploadthing/react/styles.css";
import "./LibrarianProfile.css";

export default function LibrarianProfile() {
  const navigate = useNavigate();
  const [librarian, setLibrarian] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const { startUpload } = useUploadThing("profileImage", {
    onClientUploadComplete: async (res) => {
      const url = res[0].ufsUrl;
      try {
        const response = await fetch("/api/librarians/update-image", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lID: librarian.lID, imageUrl: url }),
        });
        if (!response.ok) throw new Error("Failed to save image.");
        const updated = { ...librarian, lImage: url };
        setLibrarian(updated);
        sessionStorage.setItem("librarian", JSON.stringify(updated));
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
    const stored = sessionStorage.getItem("librarian");
    if (!stored) {
      navigate("/librarian-login");
    } else {
      setLibrarian(JSON.parse(stored));
    }
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
    sessionStorage.removeItem("librarian");
    navigate("/librarian-login");
  };

  const handleAddBooks = () => {
  navigate("/add-books");
  };

  if (!librarian) return null;

  const initials = librarian.lName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="lp-root">
      {/* Background */}
      <div className="lp-bg-grid" />
      <div className="lp-blob lp-blob-1" />
      <div className="lp-blob lp-blob-2" />


      {/* Page body */}
      <div className="lp-body">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="lp-sidebar">

          {/* Avatar */}
          <div
            className={`lp-avatar-wrap ${uploading ? "lp-avatar-uploading" : ""}`}
            onClick={handleAvatarClick}
            title="Click to change photo"
          >
            {uploading ? (
              <div className="lp-avatar-spinner-wrap">
                <span className="lp-spinner" />
              </div>
            ) : librarian.lImage ? (
              <img src={librarian.lImage} alt={librarian.lName} className="lp-avatar-img" />
            ) : (
              <div className="lp-avatar-initials">{initials}</div>
            )}
            <div className="lp-avatar-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span>Change photo</span>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Upload feedback */}
          {uploading && <p className="lp-upload-status">Uploading…</p>}
          {uploadError && <p className="lp-upload-error">{uploadError}</p>}

          {/* Name + username */}
          <h1 className="lp-sidebar-name">{librarian.lName}</h1>
          <p className="lp-sidebar-username">@{librarian.lUserName}</p>

          {/* Librarian badge */}
          <div className="lp-role-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Verified Librarian
          </div>

          {/* Edit profile button */}
          <button className="lp-edit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit profile
          </button>

          {/* Divider */}
          <div className="lp-divider" />

          {/* Quick info — sidebar */}
          <ul className="lp-meta-list">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{librarian.lAddress || "—"}</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{librarian.lPhone || "—"}</span>
            </li>
          </ul>
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <main className="lp-main">

          {/* Profile header card */}
          <div className="lp-header-card">
            <div className="lp-header-card-inner">
              <div>
                <h2 className="lp-main-name">{librarian.lName}</h2>
                <p className="lp-main-username">@{librarian.lUserName}</p>
              </div>
              <span className="lp-id-chip">ID #{librarian.lID}</span>
            </div>
          </div>

          {/* Details grid */}
          <div className="lp-details-grid">
            <InfoCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              }
              label="Full Name"
              value={librarian.lName}
            />
            <InfoCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
              label="Username"
              value={`@${librarian.lUserName}`}
            />
            <InfoCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              }
              label="Age"
              value={librarian.lAge ? `${librarian.lAge} years` : "—"}
            />
            <InfoCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              }
              label="Phone Number"
              value={librarian.lPhone || "—"}
            />
            <InfoCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              }
              label="Library Address"
              value={librarian.lAddress || "—"}
              wide
            />
          </div>

        </main>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, wide }) {
  return (
    <div className={`lp-info-card ${wide ? "lp-info-card-wide" : ""}`}>
      <div className="lp-info-icon">{icon}</div>
      <div className="lp-info-text">
        <span className="lp-info-label">{label}</span>
        <span className="lp-info-value">{value}</span>
      </div>
    </div>
  );
}