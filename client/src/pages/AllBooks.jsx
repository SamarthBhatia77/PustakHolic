import { useEffect, useState } from "react";
import "./AllBooks.css";

export default function AllBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowStatus, setBorrowStatus] = useState({}); // tracks per-book status

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setLoading(false);
      });
  }, []);

  const handleBorrow = async (bID) => {
    const stored = sessionStorage.getItem("reader");
    const reader = JSON.parse(stored);
    const rID = reader.rID;

    setBorrowStatus((prev) => ({ ...prev, [bID]: "Borrowing..." }));

    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rID, bID }),
      });

      const data = await res.json();

      if (res.ok) {
        setBorrowStatus((prev) => ({ ...prev, [bID]: "✅ Borrowed successfully!" }));
        // Decrement quantity in UI
        setBooks((prev) =>
          prev.map((b) => (b.bID === bID ? { ...b, bQty: b.bQty - 1 } : b))
        );
      } else {
        setBorrowStatus((prev) => ({ ...prev, [bID]: `❌ ${data.error}` }));
      }
    } catch (err) {
      console.error("Borrow error:", err);
      setBorrowStatus((prev) => ({ ...prev, [bID]: "❌ Something went wrong." }));
    }
  };

  return (
    <div className="allbooks-root">
      <div className="allbooks-bg-grid" aria-hidden="true" />
      <div className="allbooks-blob allbooks-blob-1" aria-hidden="true" />
      <div className="allbooks-blob allbooks-blob-2" aria-hidden="true" />
      <section className="allbooks-section">
        <h1 className="allbooks-title">All Available Books</h1>
        <p className="allbooks-sub">
          Browse books uploaded by libraries across the network.
        </p>
        {loading ? (
          <p className="allbooks-loading">Loading books…</p>
        ) : books.length === 0 ? (
          <p className="empty-text">No books available yet. Check back soon!</p>
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
                <div className="librarian-box">
                  <h4>Librarian Details</h4>
                  <p><strong>Name:</strong> {book.librarianName}</p>
                  {book.librarianAge != null && <p><strong>Age:</strong> {book.librarianAge}</p>}
                  {book.librarianAddress && <p><strong>Address:</strong> {book.librarianAddress}</p>}
                  {book.librarianPhone && <p><strong>Phone:</strong> {book.librarianPhone}</p>}
                </div>

                <button
                  type="button"
                  className="borrow-btn"
                  onClick={() => handleBorrow(book.bID)}
                  disabled={book.bQty <= 0 || borrowStatus[book.bID] === "Borrowing..." || borrowStatus[book.bID] === "✅ Borrowed successfully!"}
                >
                  {book.bQty <= 0 ? "Out of Stock" : borrowStatus[book.bID] === "✅ Borrowed successfully!" ? "Borrowed!" : "Borrow Book"}
                </button>

                {borrowStatus[book.bID] && (
                  <p style={{ marginTop: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                    {borrowStatus[book.bID]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}