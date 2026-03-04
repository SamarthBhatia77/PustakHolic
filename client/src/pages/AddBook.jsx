import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadButton } from "../utils/uploadthing";
import "./AllBooks.css";
import "./AddBook.css";

export default function AddBook() {
  const navigate = useNavigate();
  const [librarian, setLibrarian] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form and request state
  const [form, setForm] = useState({
    bCategory: "",
    bTitle: "",
    bAuthor: "",
    bQty: 1,
    pName: "",
    pAddress: "",
    pPhone: ""
  });
  const [bImage, setBImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ bCategory: "", bTitle: "", bAuthor: "", bQty: 1, pName: "", pAddress: "", pPhone: "" });
  const [editImage, setEditImage] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const refetchBooks = () => {
    if (!librarian?.lID) return;
    fetch(`/api/books/librarian/${librarian.lID}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Fetch failed"))))
      .then((data) => { if (data.books) setBooks(data.books); })
      .catch((err) => console.error(err));
  };

  // Authenticate librarian on mount
  useEffect(() => {
    const sessionData = sessionStorage.getItem("librarian");
    if (!sessionData) {
      navigate("/librarian-login"); // Redirect if not logged in
    } else {
      setLibrarian(JSON.parse(sessionData));
    }
  }, [navigate]);

  useEffect(() => {
  if (!librarian) return;

  fetch(`/api/books/librarian/${librarian.lID}`)
    .then(res => {
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
    })
    .then(data => {
      if (data.books) setBooks(data.books);
    })
    .catch(err => console.error("Failed to load books:", err));
    }, [librarian]);

  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!bImage) {
      setError("Please upload a book cover image first.");
      setLoading(false);
      return;
    }

    try {
      // Assemble the payload combining form state, uploaded image URL, and the librarian's ID
      const payload = {
        ...form,
        bImage,
        lID: librarian.lID 
      };

      const res = await fetch("/api/books/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add book.");
      } else {
        setSuccess("Book successfully added to your catalog!");
        fetch(`/api/books/librarian/${librarian.lID}`)
        .then(res => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
        })
        .then(data => {
        if (data.books) setBooks(data.books);
        });
        // Reset form state after success
        setForm({ bCategory: "", bTitle: "", bAuthor: "", bQty: 1, pName: "", pAddress: "", pPhone: "" });
        setBImage("");
        setTimeout(() => setIsModalOpen(false), 2000); // Auto-close modal
      }
    } catch (err) {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
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
      const text = await res.text();
      let data = {};
      try { if (text) data = JSON.parse(text); } catch { /* ignore */ }
      if (!res.ok) {
        setEditError(data.error || "Failed to update book.");
        return;
      }
      setEditSuccess("Book updated.");
      refetchBooks();
      setTimeout(closeEditBook, 1000);
    } catch {
      setEditError("Could not connect. Try again.");
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
      refetchBooks();
    } catch {
      setEditError("Could not connect. Try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!librarian) return <div className="ab-loading">Loading…</div>;

  return (
  <div className="ab-root">
    <div className="ab-bg-grid" aria-hidden="true" />
    <div className="ab-blob ab-blob-1" aria-hidden="true" />
    <div className="ab-blob ab-blob-2" aria-hidden="true" />

    <div className="ab-body">
      <div className="ab-header">
        <h1 className="ab-title">Your Added Books</h1>
        <button type="button" className="ab-add-btn" onClick={() => setIsModalOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add New Book
        </button>
      </div>

      {books.length === 0 ? (
      <div className="ab-empty">
        <div className="ab-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <p className="ab-empty-title">No books added yet</p>
        <p className="ab-empty-sub">Add your first book to start building your catalog.</p>
        <button type="button" className="ab-add-btn ab-add-btn-primary" onClick={() => setIsModalOpen(true)}>
          Add your first book
        </button>
      </div>
    ) : (
      <div className="books-grid">
        {books.map((book, i) => (
          <div className="book-card" key={book.bID} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="book-cover">
              {book.bImage ? (
                <img src={book.bImage} alt={book.bTitle} />
              ) : (
                <div className="book-no-cover">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  <span>No cover</span>
                </div>
              )}
            </div>
            <h3 className="book-title">{book.bTitle}</h3>
            <p className="book-meta"><strong>Author:</strong> {book.bAuthor}</p>
            {book.bCategory && (
              <p className="book-meta"><strong>Category:</strong> {book.bCategory}</p>
            )}
            <p className="book-meta"><strong>Publisher:</strong> {book.pName}</p>
            <p className="book-meta"><strong>Available Qty:</strong> {book.bQty}</p>
            <button
              type="button"
              className="book-edit-btn"
              onClick={() => openEditBook(book)}
              aria-label={`Edit ${book.bTitle}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        ))}
      </div>
    )}
    </div>

    {isModalOpen && (
      <div className="ab-modal-overlay" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true" aria-label="Add book">
        <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="ab-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close">×</button>
          <h2 className="ab-modal-title">Add a New Book</h2>
          <p className="ab-modal-sub">Enter book and publisher details.</p>

          <form onSubmit={handleSubmit} className="ab-form">
            <div className="ab-form-row">
              <div className="ab-cover-section">
                <div className="ab-cover-preview">
                  {bImage ? (
                    <img src={bImage} alt="Cover preview" />
                  ) : (
                    <span className="ab-cover-placeholder">No cover</span>
                  )}
                </div>
                <span className="ab-upload-label">Cover image</span>
                <UploadButton
                  endpoint="bookImage"
                  onClientUploadComplete={(res) => {
                    setBImage(res[0].url);
                    setError("");
                  }}
                  onUploadError={(error) => {
                    setError(error?.message || "Upload failed");
                  }}
                />
              </div>
              <div className="ab-fields">
                <input name="bTitle" placeholder="Title" value={form.bTitle} onChange={handleChange} required />
                <input name="bAuthor" placeholder="Author" value={form.bAuthor} onChange={handleChange} required />
                <input name="bCategory" placeholder="Category" value={form.bCategory} onChange={handleChange} />
                <input name="bQty" type="number" min={1} placeholder="Quantity" value={form.bQty} onChange={handleChange} required />
                <input name="pName" placeholder="Publisher name" value={form.pName} onChange={handleChange} required />
                <input name="pPhone" placeholder="Publisher phone" value={form.pPhone} onChange={handleChange} />
                <input name="pAddress" placeholder="Publisher address" value={form.pAddress} onChange={handleChange} />
              </div>
            </div>
            {error && <p className="ab-form-error">{error}</p>}
            {success && <p className="ab-form-success">{success}</p>}
            <div className="ab-form-actions">
              <button type="button" className="ab-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="ab-btn-save" disabled={loading}>
                {loading ? "Saving…" : "Save Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {editingBook && (
      <div className="ab-modal-overlay" onClick={closeEditBook} role="dialog" aria-modal="true" aria-label="Edit book">
        <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="ab-modal-close" onClick={closeEditBook} aria-label="Close">×</button>
          <h2 className="ab-modal-title">Edit book</h2>
          <form onSubmit={handleEditSubmit} className="ab-edit-form">
            <div className="ab-edit-form-row">
              <div className="ab-edit-cover">
                <div className="ab-cover-preview">
                  {editImage ? (
                    <img src={editImage} alt="Cover" />
                  ) : (
                    <span className="ab-cover-placeholder">No cover</span>
                  )}
                </div>
                <span className="ab-upload-label">Cover image</span>
                <UploadButton
                  endpoint="bookImage"
                  onClientUploadComplete={(res) => { setEditImage(res[0].url); setEditError(""); }}
                  onUploadError={(err) => setEditError(err?.message || "Upload failed")}
                />
              </div>
              <div className="ab-fields">
                <input name="bTitle" placeholder="Title" value={editForm.bTitle} onChange={handleEditFormChange} required />
                <input name="bAuthor" placeholder="Author" value={editForm.bAuthor} onChange={handleEditFormChange} required />
                <input name="bCategory" placeholder="Category" value={editForm.bCategory} onChange={handleEditFormChange} />
                <input name="bQty" type="number" min={1} placeholder="Quantity" value={editForm.bQty} onChange={handleEditFormChange} required />
                <input name="pName" placeholder="Publisher name" value={editForm.pName} onChange={handleEditFormChange} required />
                <input name="pPhone" placeholder="Publisher phone" value={editForm.pPhone} onChange={handleEditFormChange} />
                <input name="pAddress" placeholder="Publisher address" value={editForm.pAddress} onChange={handleEditFormChange} />
              </div>
            </div>
            {editError && <p className="ab-form-error">{editError}</p>}
            {editSuccess && <p className="ab-form-success">{editSuccess}</p>}
            <div className="ab-form-actions ab-edit-actions">
              <button type="button" className="ab-btn-cancel" onClick={closeEditBook}>Cancel</button>
              <button type="button" className="ab-btn-delete" onClick={handleDeleteBook} disabled={editLoading || deleteLoading}>
                {deleteLoading ? "Deleting…" : "Delete book"}
              </button>
              <button type="submit" className="ab-btn-save" disabled={editLoading || deleteLoading}>
                {editLoading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}