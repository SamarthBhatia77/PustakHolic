import { useEffect, useState } from "react";
import "./AllBooks.css";

export default function AllBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/books")
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

  return (
    <div className="allbooks-root">
      <div className="allbooks-bg-grid" />

      <section className="allbooks-section">
        <h1 className="allbooks-title">All Available Books</h1>
        <p className="allbooks-sub">
          Browse books uploaded by libraries across the network.
        </p>

        {loading ? (
          <p className="empty-text">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="empty-text">
            No books available yet. Check back soon!
          </p>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <div className="book-card" key={book.bID}>
                <img
                  src={book.bImage}
                  alt={book.bTitle}
                  className="book-image"
                />

                <h3 className="book-title">{book.bTitle}</h3>

                <p className="book-meta">
                  <strong>Author:</strong> {book.bAuthor}
                </p>

                <p className="book-meta">
                  <strong>Category:</strong> {book.bCategory}
                </p>

                <p className="book-meta">
                  <strong>Publisher:</strong> {book.pName}
                </p>

                <p className="book-meta">
                  <strong>Available Qty:</strong> {book.bQty}
                </p>

                <div className="librarian-box">
                  <h4>Librarian Details</h4>
                  <p><strong>Name:</strong> {book.librarianName}</p>
                  <p><strong>Age:</strong> {book.librarianAge}</p>
                  <p><strong>Address:</strong> {book.librarianAddress}</p>
                  <p><strong>Phone:</strong> {book.librarianPhone}</p>
                </div>

                <button className="borrow-btn">
                  Borrow Book
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}