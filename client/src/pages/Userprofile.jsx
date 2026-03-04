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
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ rName: "", rUserName: "", rAge: "", rAddress: "" });
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [currentReads, setCurrentReads] = useState([]);
  const [readHistory, setReadHistory] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [returnRequested, setReturnRequested] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);

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
    else {
      const r = JSON.parse(stored);
      setReader(r);

      // Fetch currently reading, read history, defaulter status
      const refetch = () => {
        fetch(`/api/borrow/current/${r.rID}`)
          .then((res) => res.json())
          .then((data) => setCurrentReads(data.currentReads || []))
          .catch((err) => console.error("Error fetching current reads:", err));
        fetch(`/api/borrow/history/${r.rID}`)
          .then((res) => res.json())
          .then((data) => setReadHistory(data.readHistory || []))
          .catch((err) => console.error("Error fetching read history:", err));
        fetch(`/api/borrow/defaulter-status/${r.rID}`)
          .then((res) => res.json())
          .then((data) => setDefaulters(data.defaulters || []))
          .catch(() => setDefaulters([]));
      };
      refetch();
      }
  }, [navigate]);

  const refetchBooks = () => {
    if (!reader?.rID) return;
    fetch(`/api/borrow/current/${reader.rID}`)
      .then((res) => res.json())
      .then((data) => setCurrentReads(data.currentReads || []))
      .catch(() => {});
    fetch(`/api/borrow/history/${reader.rID}`)
      .then((res) => res.json())
      .then((data) => setReadHistory(data.readHistory || []))
      .catch(() => {});
    fetch(`/api/borrow/defaulter-status/${reader.rID}`)
      .then((res) => res.json())
      .then((data) => setDefaulters(data.defaulters || []))
      .catch(() => {});
  };

  const handleMarkAsRead = async (book) => {
    if (!reader) return;
    setActionLoading(`read-${book.bID}`);
    try {
      const res = await fetch("/api/borrow/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rID: reader.rID, bID: book.bID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      refetchBooks();
    } catch (e) {
      alert(e.message || "Could not mark as read.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestReturn = async (book) => {
    if (!reader) return;
    setActionLoading(`return-${book.bID}`);
    try {
      const res = await fetch("/api/borrow/request-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rID: reader.rID, bID: book.bID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReturnRequested((prev) => new Set(prev).add(book.bID));
      alert("Return requested. The librarian will verify and then the book will be marked as returned.");
    } catch (e) {
      alert(e.message || "Could not request return.");
    } finally {
      setActionLoading(null);
    }
  };

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

  const openEditProfile = () => {
    if (!reader) return;
    setProfileForm({
      rName: reader.rName || "",
      rUserName: reader.rUserName || "",
      rAge: reader.rAge != null ? String(reader.rAge) : "",
      rAddress: reader.rAddress || "",
    });
    setProfileError("");
    setProfileSuccess("");
    setProfileEditOpen(true);
  };

  const closeEditProfile = () => {
    setProfileEditOpen(false);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileError("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!reader) return;
    setProfileSaveLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const res = await fetch("/api/readers/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rID: reader.rID,
          rName: profileForm.rName.trim(),
          rUserName: profileForm.rUserName.trim(),
          rAge: profileForm.rAge === "" ? null : Number(profileForm.rAge),
          rAddress: profileForm.rAddress.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile.");
        return;
      }
      const updated = { ...reader, ...data.reader, rImage: reader.rImage };
      setReader(updated);
      sessionStorage.setItem("reader", JSON.stringify(updated));
      setProfileSuccess("Profile updated.");
      setTimeout(() => closeEditProfile(), 800);
    } catch {
      setProfileError("Could not connect. Try again.");
    } finally {
      setProfileSaveLoading(false);
    }
  };

  if (!reader) return null;

  const initials = reader.rName
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="rp-root">
      <div className="rp-bg-grid" />
      <div className="rp-blob rp-blob-1" />
      <div className="rp-blob rp-blob-2" />

      <div className="rp-body">

        {/* LEFT SIDEBAR */}
        <aside className="rp-sidebar">
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
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span>Change photo</span>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={handleFileChange} />

          {uploading  && <p className="rp-upload-status">Uploading…</p>}
          {uploadError && <p className="rp-upload-error">{uploadError}</p>}

          <h1 className="rp-sidebar__name">{reader.rName}</h1>
          <p className="rp-sidebar__username">@{reader.rUserName}</p>

          <div className="rp-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Registered Reader
          </div>

          <button type="button" className="rp-edit-btn" onClick={openEditProfile}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit profile
          </button>

          <hr className="rp-divider" />

          <ul className="rp-meta">
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
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
            />
            <RpCard label="Username" value={`@${reader.rUserName}`}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            />
            <RpCard label="Age" value={reader.rAge ? `${reader.rAge} years` : "—"}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
            />
            <RpCard label="Reader ID" value={`#${reader.rID}`}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
            />
            <RpCard label="Address" value={reader.rAddress ?? "—"} wide
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
            />
          </div>

          {/* ── CURRENTLY READING ── */}
          <div className="rp-books-section">
            <h3 className="rp-books-section__title">Currently Reading</h3>
            {currentReads.length === 0 ? (
              <p className="rp-books-empty">You are not reading any books right now.</p>
            ) : (
              <div className="rp-books-grid">
                {currentReads.map((book) => {
                  const isDefaulter = defaulters.some((d) => d.bID === book.bID);
                  const returnPending = returnRequested.has(book.bID);
                  const loading = actionLoading === `read-${book.bID}` || actionLoading === `return-${book.bID}`;
                  const isViewed = book.markedAsRead === 1 || book.markedAsRead === true;
                  return (
                    <div className="rp-book-card" key={book.bID}>
                      <div className="rp-book-card-top">
                        {book.bImage ? (
                          <img src={book.bImage} alt={book.bTitle} className="rp-book-img" />
                        ) : (
                          <div className="rp-book-no-img">No Cover</div>
                        )}
                        <div className="rp-book-info">
                          <span className={`rp-book-status rp-book-status--${isViewed ? "viewed" : "reading"}`}>
                            {isViewed ? "Viewed" : "Reading"}
                          </span>
                          <p className="rp-book-title">{book.bTitle}</p>
                          <p className="rp-book-author">{book.bAuthor}</p>
                          <p className="rp-book-date">Borrowed: {book.issueDate?.slice(0, 10)}</p>
                          {isDefaulter && (
                            <p className="rp-book-defaulter-ping">
                              Return this book quickly — you have been marked as a defaulter.
                            </p>
                          )}
                          <div className="rp-book-actions">
                            {!isViewed && (
                              <button
                                type="button"
                                className="rp-book-btn rp-book-btn-read"
                                onClick={() => handleMarkAsRead(book)}
                                disabled={!!loading}
                              >
                                {actionLoading === `read-${book.bID}` ? "…" : "Mark as read"}
                              </button>
                            )}
                            <button
                              type="button"
                              className="rp-book-btn rp-book-btn-return"
                              onClick={() => handleRequestReturn(book)}
                              disabled={!!loading || returnPending}
                            >
                              {returnPending ? "Return requested" : actionLoading === `return-${book.bID}` ? "…" : "Return"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── ALREADY READ ── */}
          <div className="rp-books-section">
            <h3 className="rp-books-section__title">Already Read</h3>
            {readHistory.length === 0 ? (
              <p className="rp-books-empty">You have not read any books yet.</p>
            ) : (
              <div className="rp-books-grid">
                {readHistory.map((book, i) => (
                  <div className="rp-book-card" key={`${book.bID}-${i}`}>
                    {book.bImage ? (
                      <img src={book.bImage} alt={book.bTitle} className="rp-book-img" />
                    ) : (
                      <div className="rp-book-no-img">No Cover</div>
                    )}
                    <div className="rp-book-info">
                      <p className="rp-book-title">{book.bTitle}</p>
                      <p className="rp-book-author">{book.bAuthor}</p>
                      <p className="rp-book-date">Borrowed: {book.issueDate?.slice(0, 10)}</p>
                      <p className="rp-book-date">
                        Returned: {book.returnDate ? book.returnDate.slice(0, 10) : "Not yet returned"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit profile modal */}
          {profileEditOpen && (
            <div className="rp-modal-overlay" onClick={closeEditProfile} role="dialog" aria-modal="true" aria-label="Edit profile">
              <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="rp-modal-close" onClick={closeEditProfile} aria-label="Close">×</button>
                <h2 className="rp-modal-title">Edit profile</h2>
                <form onSubmit={handleProfileSubmit} className="rp-edit-form">
                  <div className="rp-edit-fields">
                    <label className="rp-edit-label">Full name</label>
                    <input name="rName" value={profileForm.rName} onChange={handleProfileFormChange} required />
                    <label className="rp-edit-label">Username</label>
                    <input name="rUserName" value={profileForm.rUserName} onChange={handleProfileFormChange} required placeholder="Without @" />
                    <label className="rp-edit-label">Age</label>
                    <input name="rAge" type="number" min="1" value={profileForm.rAge} onChange={handleProfileFormChange} placeholder="Optional" />
                    <label className="rp-edit-label">Address</label>
                    <input name="rAddress" value={profileForm.rAddress} onChange={handleProfileFormChange} placeholder="Optional" />
                  </div>
                  {profileError && <p className="rp-edit-error">{profileError}</p>}
                  {profileSuccess && <p className="rp-edit-success">{profileSuccess}</p>}
                  <div className="rp-modal-actions">
                    <button type="button" className="rp-modal-cancel" onClick={closeEditProfile}>Cancel</button>
                    <button type="submit" className="rp-modal-save" disabled={profileSaveLoading}>
                      {profileSaveLoading ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
