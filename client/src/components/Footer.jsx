import React from "react";
import { useLocation } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const location = useLocation();

  const blockedPaths = [
    "/login",
    "/register",
    "/librarian-login",
    "/librarian-register"
  ];

  if (blockedPaths.includes(location.pathname)) return null;

  const isReaderPage = ["/profile", "/all-books"].includes(location.pathname);
  const isLibPage = ["/librarian-profile", "/add-books"].includes(location.pathname);
  const footerClass = isReaderPage ? "rp-footer" : `land-footer${isLibPage ? " lib-footer" : ""}`;

  return (
    <footer className={footerClass}>
      <span className={isReaderPage ? "rp-footer-logo" : "land-logo"}>
        <span className={isReaderPage ? "rp-footer-logo-hi" : "logo-hi"}>पुस्तक</span>holic
      </span>
      <span className="footer-copy">
        © {new Date().getFullYear()} · Made with ❤️ for Indian readers
      </span>
    </footer>
  );
};

export default Footer;