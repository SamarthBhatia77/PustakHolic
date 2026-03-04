import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadThing } from "../utils/uploadthing";
import { UploadButton } from "../utils/uploadthing";
import "@uploadthing/react/styles.css";
import "./LibrarianProfile.css";

export default function LibrarianProfile() {
  const navigate = useNavigate();
  const [librarian, setLibrarian] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ bCategory: "", bTitle: "", bAuthor: "", bQty: 1, pName: "", pAddress: "", pPhone: "" });
  const [editImage, setEditImage] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ lName: "", lUserName: "", lAge: "", lPhone: "", lAddress: "" });
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

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

  useEffect(() => {
    if (!librarian?.lID) return;
    setBooksLoading(true);
    fetch(`/api/books/librarian/${librarian.lID}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch books");
        return res.json();
      })
      .then((data) => {
        setBooks(data.books || []);
      })
      .catch(() => setBooks([]))
      .finally(() => setBooksLoading(false));
  }, [librarian?.lID]);

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

  const openEditProfile = () => {
    if (!librarian) return;
    setProfileForm({
      lName: librarian.lName || "",
      lUserName: librarian.lUserName || "",
      lAge: librarian.lAge != null ? String(librarian.lAge) : "",
      lPhone: librarian.lPhone != null ? String(librarian.lPhone) : "",
      lAddress: librarian.lAddress || "",
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
    if (!librarian) return;
    setProfileSaveLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const res = await fetch("/api/librarians/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lID: librarian.lID,
          lName: profileForm.lName.trim(),
          lUserName: profileForm.lUserName.trim(),
          lAge: profileForm.lAge === "" ? null : Number(profileForm.lAge),
          lPhone: profileForm.lPhone.trim() || null,
          lAddress: profileForm.lAddress.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile.");
        return;
      }
      const updated = { ...librarian, ...data.librarian, lImage: librarian.lImage };
      setLibrarian(updated);
      sessionStorage.setItem("librarian", JSON.stringify(updated));
      setProfileSuccess("Profile updated.");
      setTimeout(() => closeEditProfile(), 800);
    } catch {
      setProfileError("Could not connect. Try again.");
    } finally {
      setProfileSaveLoading(false);
    }
  };

  const openEditBook = (book) => {
    setEditingBook(book);
    setEditForm({
      bCategory: book.bCategory || "",
      bTitle: book.bTitle || "",
      bAuthor: book.bAuthor || "",
      bQty: Number(book.bQty) || 1,
      pName: book.pName || "",
      pAddress: book.pAddress || "",
      pPhone: book.pPhone || "",
    });
    setEditImage(book.bImage || "");
    setEditError("");
    setEditSuccess("");
  };

  const closeEditBook = () => {
    setEditingBook(null);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === "bQty" ? Number(value) || 1 : value }));
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBook || !librarian) return;
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const res = await fetch(`/api/books/${editingBook.bID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lID: librarian.lID,
          bCategory: editForm.bCategory,
          bTitle: editForm.bTitle,
          bAuthor: editForm.bAuthor,
          bQty: editForm.bQty,
          bImage: editImage || editingBook.bImage || "",
          pName: editForm.pName,
          pAddress: editForm.pAddress,
          pPhone: editForm.pPhone,
        }),
      });
      let data = {};
      const text = await res.text();
      try {
        if (text) data = JSON.parse(text);
      } catch {
        console.error("Edit book: server returned non-JSON", res.status, text?.slice(0, 300));
        setEditError(
          data?.error ||
          (res.ok ? "Invalid response from server." : `Server error (${res.status}). Try again.`)
        );
        return;
      }
      if (!res.ok) {
        setEditError(data.error || "Failed to update book.");
        return;
      }
      setEditSuccess("Book updated successfully.");
      const listRes = await fetch(`/api/books/librarian/${librarian.lID}`);
      const listData = await listRes.json();
      if (listData.books) setBooks(listData.books);
      setTimeout(() => closeEditBook(), 1200);
    } catch (err) {
      console.error("Edit book error:", err);
      setEditError("Could not connect. Make sure the server is running and try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!editingBook || !librarian) return;
    if (!window.confirm(`Delete "${editingBook.bTitle}"? This cannot be undone.`)) return;
    setDeleteLoading(true);
    setEditError("");
    try {
      const res = await fetch(`/api/books/${editingBook.bID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lID: librarian.lID }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error || "Failed to delete book.");
        return;
      }
      closeEditBook();
      const listRes = await fetch(`/api/books/librarian/${librarian.lID}`);
      const listData = await listRes.json();
      if (listData.books) setBooks(listData.books);
    } catch {
      setEditError("Could not connect. Try again.");
    } finally {
      setDeleteLoading(false);
    }
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
          <button type="button" className="lp-edit-btn" onClick={openEditProfile}>
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

          {/* Books added by this librarian */}
          <div className="lp-books-section">
            <div className="lp-books-header">
              <h2 className="lp-books-title">Books you&apos;ve added</h2>
              <button type="button" className="lp-add-books-btn" onClick={handleAddBooks}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add books
              </button>
            </div>

            {booksLoading ? (
              <div className="lp-books-loading">
                <span className="lp-spinner" />
                <span>Loading your books…</span>
              </div>
            ) : books.length === 0 ? (
              <div className="lp-books-empty">
                <div className="lp-books-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <p className="lp-books-empty-title">No books added yet</p>
                <p className="lp-books-empty-sub">Add your first book to start building your catalog.</p>
                <button type="button" className="lp-add-books-btn lp-add-books-btn-primary" onClick={handleAddBooks}>
                  Add your first book
                </button>
              </div>
            ) : (
              <>
              <div className="lp-books-grid lp-books-grid--compact">
                {books.slice(0, 6).map((book) => (
                  <div key={book.bID} className="lp-book-card lp-book-card--compact">
                    <div className="lp-book-card-cover lp-book-card-cover--compact">
                      {book.bImage ? (
                        <img src={book.bImage} alt={book.bTitle} className="lp-book-card-img" />
                      ) : (
                        <div className="lp-book-card-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                          </svg>
                          <span>No cover</span>
                        </div>
                      )}
                    </div>
                    <div className="lp-book-card-body">
                      <h3 className="lp-book-card-title">{book.bTitle}</h3>
                      <p className="lp-book-card-author">{book.bAuthor}</p>
                      {book.bCategory && (
                        <span className="lp-book-card-category">{book.bCategory}</span>
                      )}
                      <div className="lp-book-card-meta">
                        Qty: {book.bQty}
                        {book.pName && <span> · {book.pName}</span>}
                      </div>
                      <button
                        type="button"
                        className="lp-book-edit-btn"
                        onClick={() => openEditBook(book)}
                        aria-label={`Edit ${book.bTitle}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {books.length > 6 && (
                <div className="lp-books-view-all-wrap">
                  <button type="button" className="lp-books-view-all-btn" onClick={handleAddBooks}>
                    View all
                  </button>
                </div>
              )}
              </>
            )}
          </div>

          {/* Edit profile modal */}
          {profileEditOpen && (
            <div className="lp-modal-overlay" onClick={closeEditProfile} role="dialog" aria-modal="true" aria-label="Edit profile">
              <div className="lp-modal lp-modal-profile" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="lp-modal-close" onClick={closeEditProfile} aria-label="Close">×</button>
                <h2 className="lp-modal-title">Edit profile</h2>
                <form onSubmit={handleProfileSubmit} className="lp-edit-form">
                  <div className="lp-edit-fields">
                    <label className="lp-edit-label">Full name</label>
                    <input name="lName" value={profileForm.lName} onChange={handleProfileFormChange} required />
                    <label className="lp-edit-label">Username</label>
                    <input name="lUserName" value={profileForm.lUserName} onChange={handleProfileFormChange} required placeholder="Without @" />
                    <label className="lp-edit-label">Age</label>
                    <input name="lAge" type="number" min="1" value={profileForm.lAge} onChange={handleProfileFormChange} placeholder="Optional" />
                    <label className="lp-edit-label">Phone</label>
                    <input name="lPhone" value={profileForm.lPhone} onChange={handleProfileFormChange} placeholder="Optional" />
                    <label className="lp-edit-label">Library address</label>
                    <input name="lAddress" value={profileForm.lAddress} onChange={handleProfileFormChange} placeholder="Optional" />
                  </div>
                  {profileError && <p className="lp-edit-error">{profileError}</p>}
                  {profileSuccess && <p className="lp-edit-success">{profileSuccess}</p>}
                  <div className="lp-modal-actions">
                    <button type="button" className="lp-modal-cancel" onClick={closeEditProfile}>Cancel</button>
                    <button type="submit" className="lp-modal-save" disabled={profileSaveLoading}>
                      {profileSaveLoading ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit book modal */}
          {editingBook && (
            <div className="lp-modal-overlay" onClick={closeEditBook} role="dialog" aria-modal="true" aria-label="Edit book">
              <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="lp-modal-close" onClick={closeEditBook} aria-label="Close">×</button>
                <h2 className="lp-modal-title">Edit book</h2>
                <form onSubmit={handleEditSubmit} className="lp-edit-form">
                  <div className="lp-edit-form-row">
                    <div className="lp-edit-cover">
                      <div className="lp-edit-cover-preview">
                        {editImage ? (
                          <img src={editImage} alt="Cover" />
                        ) : (
                          <span className="lp-edit-cover-placeholder">No cover</span>
                        )}
                      </div>
                      <span className="lp-edit-cover-label">Cover image</span>
                      <UploadButton
                        endpoint="bookImage"
                        onClientUploadComplete={(res) => {
                          setEditImage(res[0].url);
                          setEditError("");
                        }}
                        onUploadError={(err) => setEditError(err?.message || "Upload failed")}
                      />
                    </div>
                    <div className="lp-edit-fields">
                      <input name="bTitle" placeholder="Title" value={editForm.bTitle} onChange={handleEditFormChange} required />
                      <input name="bAuthor" placeholder="Author" value={editForm.bAuthor} onChange={handleEditFormChange} required />
                      <input name="bCategory" placeholder="Category" value={editForm.bCategory} onChange={handleEditFormChange} />
                      <input name="bQty" type="number" min={1} placeholder="Quantity" value={editForm.bQty} onChange={handleEditFormChange} required />
                      <input name="pName" placeholder="Publisher name" value={editForm.pName} onChange={handleEditFormChange} required />
                      <input name="pPhone" placeholder="Publisher phone" value={editForm.pPhone} onChange={handleEditFormChange} />
                      <input name="pAddress" placeholder="Publisher address" value={editForm.pAddress} onChange={handleEditFormChange} />
                    </div>
                  </div>
                  {editError && <p className="lp-edit-error">{editError}</p>}
                  {editSuccess && <p className="lp-edit-success">{editSuccess}</p>}
                  <div className="lp-modal-actions">
                    <button type="button" className="lp-modal-cancel" onClick={closeEditBook}>Cancel</button>
                    <button
                      type="button"
                      className="lp-modal-delete"
                      onClick={handleDeleteBook}
                      disabled={editLoading || deleteLoading}
                    >
                      {deleteLoading ? "Deleting…" : "Delete book"}
                    </button>
                    <button type="submit" className="lp-modal-save" disabled={editLoading || deleteLoading}>
                      {editLoading ? "Saving…" : "Save changes"}
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