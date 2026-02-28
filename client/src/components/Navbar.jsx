import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const librarian = sessionStorage.getItem("librarian");
  const reader = sessionStorage.getItem("reader");

  const handleLogout = () => {
    sessionStorage.removeItem("librarian");
    sessionStorage.removeItem("reader");
    navigate("/");
  };

  const handleAddBooks = () => {
    navigate("/add-books");
  };

  const handleViewAllBooks = () => {
    navigate("/all-books");
  };

  // Only show navbar on authenticated pages
  const allowedPaths = [
    "/profile",
    "/librarian-profile",
    "/add-books",
    "/all-books"
  ];

  if (!allowedPaths.includes(location.pathname)) return null;

  if (!librarian && !reader) return null;

  return librarian ? (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <span className="lp-nav-logo">
          <span className="lp-nav-logo-hi">पुस्तक</span>holic
          <span className="lp-nav-badge">Librarian Portal</span>
        </span>

        <button
          className="lp-logout-btn"
          onClick={handleAddBooks}
          style={{ marginRight: "12px" }}
        >
          Add Books
        </button>

        <button className="lp-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  ) : (
    <nav className="rp-nav">
      <div className="rp-nav-inner">
        <span className="rp-nav-logo">
          <span className="rp-nav-logo-hi">पुस्तक</span>holic
          <span className="rp-nav-badge">Reader Portal</span>
        </span>

        <button
          className="rp-logout-btn"
          onClick={handleViewAllBooks}
          style={{ marginRight: "12px" }}
        >
          View All Books
        </button>

        <button className="rp-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;