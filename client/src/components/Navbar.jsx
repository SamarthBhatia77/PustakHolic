import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

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

  const handleViewAllBooks = () => {
    navigate("/all-books");
  };

  // Only show navbar on authenticated pages
  const allowedPaths = [
    "/profile",
    "/librarian-profile",
    "/add-books",
    "/all-books",
    "/your-readers"
  ];

  if (!allowedPaths.includes(location.pathname)) return null;

  if (!librarian && !reader) return null;

  const handleProfile = () => {
    if (librarian) navigate("/librarian-profile");
    else navigate("/profile");
  };

  return librarian ? (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <span className="lp-nav-logo">
          <span className="lp-nav-logo-text">
            <span className="lp-nav-logo-hi">पुस्तक</span><span className="lp-nav-logo-en">holic</span>
          </span>
          <span className="lp-nav-badge">Librarian Portal</span>
        </span>

        <div className="lp-nav-actions">
          <button type="button" className="lp-nav-btn" onClick={() => navigate("/your-readers")}>
            Your readers
          </button>
          <button type="button" className="lp-profile-btn" onClick={handleProfile}>
            Profile
          </button>
          <button type="button" className="lp-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  ) : (
    <nav className="rp-nav">
      <div className="rp-nav-inner">
        <span className="rp-nav-logo">
          <span className="rp-nav-logo-text">
            <span className="rp-nav-logo-hi">पुस्तक</span><span className="rp-nav-logo-en">holic</span>
          </span>
          <span className="rp-nav-badge">Reader Portal</span>
        </span>

        <div className="rp-nav-actions">
          <button
            type="button"
            className="rp-nav-btn"
            onClick={handleViewAllBooks}
          >
            View All Books
          </button>
          <button type="button" className="rp-profile-btn" onClick={handleProfile}>
            Profile
          </button>
          <button type="button" className="rp-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;