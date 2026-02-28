import React, { useEffect, useState } from "react";
import "./AllBooks.css";

const AllBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/books") // change if your backend port is different
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  return (
    <div className="allbooks-container">
      <h1 className="allbooks-title">All Available Books</h1>

      <div className="books-grid">
        {books.length === 0 ? (
          <p className="no-books">No books available yet.</p>
        ) : (
          books.map((book) => (
            <div className="book-card" key={book.id}>
              <h3 className="book-title">{book.title}</h3>

              <p>
                <strong>Author:</strong> {book.author}
              </p>

              <p>
                <strong>Category:</strong> {book.category}
              </p>

              <p>
                <strong>Library:</strong> {book.library_name}
              </p>

              {/* Borrow Button (UI only) */}
              <button className="borrow-btn">
                Borrow Book
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllBooks;