import React from "react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  // Pages where footer should NOT appear
  const blockedPaths = [
    "/login",
    "/register",
    "/librarian-login",
    "/librarian-register"
  ];

  if (blockedPaths.includes(location.pathname)) return null;

  return (
    <footer className="land-footer">
      <span className="land-logo">
        <span className="logo-hi">पुस्तक</span>holic
      </span>

      <span className="footer-copy">
        © {new Date().getFullYear()} · Made with ❤️ for Indian readers
      </span>
    </footer>
  );
};

export default Footer;