import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Reusing your existing styles for consistency
import { UploadButton } from "../utils/uploadthing";
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

  if (!librarian) return <div style={{ padding: "20px" }}>Loading...</div>; // Prevent rendering before authentication check

  return (
  <div className="ab-root">
    <div className="ab-header">
      <h1 className="ab-title">Your Added Books</h1>
      <button
        className="ab-add-btn"
        onClick={() => setIsModalOpen(true)}
      >
        + Add New Book
      </button>
    </div>

    {books.length === 0 ? (
      <p className="ab-empty">No books added yet.</p>
    ) : (
      <div className="ab-grid">
        {books.map((book) => (
          <div key={book.bID} className="ab-card">
            <img
              src={book.bImage}
              alt={book.bTitle}
              className="ab-card-img"
            />
            <div className="ab-card-body">
              <div className="ab-card-title">{book.bTitle}</div>
              <div className="ab-card-author">{book.bAuthor}</div>
              <div className="ab-card-meta">
                Qty: {book.bQty} | {book.pName}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {isModalOpen && (
  <div className="ab-modal-overlay">
    <div className="ab-modal">

      {/* LEFT SIDE — COVER + UPLOAD */}
      <div className="ab-modal-left">
        <div className="ab-cover-preview">
          {bImage ? (
            <img src={bImage} alt="Preview" />
          ) : (
            <span style={{ color: "#6b7280", fontSize: "12px" }}>
              No Cover
            </span>
          )}
        </div>

        <div className="ab-upload-label">
          Upload Book Cover
        </div>

        <UploadButton
          endpoint="bookImage"
          onClientUploadComplete={(res) => {
            setBImage(res[0].url);
            setError("");
          }}
          onUploadError={(error) => {
            setError(`Upload failed: ${error.message}`);
          }}
        />
      </div>

      {/* RIGHT SIDE — FORM */}
      <div className="ab-modal-right">
        <span
          className="ab-close"
          onClick={() => setIsModalOpen(false)}
        >
          ×
        </span>

        <h2>Add a New Book</h2>
        <p>Enter book and publisher details</p>

        <form onSubmit={handleSubmit}>
          <input name="bTitle" placeholder="Title" value={form.bTitle} onChange={handleChange} required />
          <input name="bAuthor" placeholder="Author" value={form.bAuthor} onChange={handleChange} required />
          <input name="bCategory" placeholder="Category" value={form.bCategory} onChange={handleChange} />
          <input name="bQty" type="number" min="1" value={form.bQty} onChange={handleChange} required />
          <input name="pName" placeholder="Publisher Name" value={form.pName} onChange={handleChange} required />
          <input name="pPhone" placeholder="Publisher Phone" value={form.pPhone} onChange={handleChange} />
          <input name="pAddress" placeholder="Publisher Address" value={form.pAddress} onChange={handleChange} />

          {error && <div className="error-box">{error}</div>}
          {success && <div style={{ color: "#1ed760" }}>{success}</div>}

          <button type="submit" className="ab-save-btn">
            {loading ? "Saving..." : "Save Book"}
          </button>
        </form>
      </div>
    </div>
  </div>
)}
  </div>
);
}