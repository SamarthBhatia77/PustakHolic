import { useNavigate } from "react-router-dom";
import "./Landing.css";

const features = [
  {
    emoji: "🇮🇳",
    tag: "Made for Bharat",
    title: "Library for the New India",
    desc: "A modern digital layer over your city's libraries — accessible, fast, and built for every Indian reader, from metros to mofussil towns.",
  },
  {
    emoji: "✍️",
    tag: "Community",
    title: "Share Book Reviews",
    desc: "Read something unforgettable? Let the world know. Write reviews, discover what others loved, and build a reading culture together.",
  },
  {
    emoji: "📦",
    tag: "Borrow",
    title: "Borrow from Nearby Libraries",
    desc: "Check availability, reserve a copy, and walk in ready. No more wasted trips — know exactly what's on the shelf before you arrive.",
  },
  {
    emoji: "🌐",
    tag: "Network",
    title: "Connected Library Network",
    desc: "Hundreds of libraries, one platform. Search across a growing network and find any book regardless of which library holds it.",
  },
  {
    emoji: "🤝",
    tag: "People",
    title: "Bringing Readers Together",
    desc: "Discover readers with your tastes, join reading circles, and turn solitary reading into a shared, living experience.",
  },
  {
    emoji: "📖",
    tag: "Mission",
    title: "Reviving the Reading Habit",
    desc: "Screens stole our reading hours. पुस्तकholic is on a mission to bring books back — one reader, one library, one page at a time.",
  },
];

const stats = [
  { value: "500+", label: "Libraries" },
  { value: "2L+", label: "Books" },
  { value: "50K+", label: "Readers" },
  { value: "12+", label: "Cities" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      {/* ── Background ── */}
      <div className="land-bg-grid" />
      <div className="land-blob land-blob-1" />
      <div className="land-blob land-blob-2" />
      <div className="land-blob land-blob-3" />

      {/* ── Navbar ── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <a className="land-logo" href="#">
            <span className="logo-hi">पुस्तक</span>holic
          </a>
          <div className="land-nav-links">
            <a href="#stats">About</a>
            <button className="nav-cta" onClick={() => navigate("/login")}>
              Rader Sign In
            </button>
            <button className="nav-cta" onClick={() => navigate("/login")}>
              Librarian Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="land-hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          India's Reading Revolution. Out Now!
        </div>
        <h1 className="hero-title">
          <span className="hero-hi">पुस्तक</span>
          <span className="hero-en">holic</span>
        </h1>
        <p className="hero-sub">
          Your city's libraries, digitally connected.<br />
          Discover, borrow, review — all in one place.
        </p>

        {/* ── CTA Buttons ── */}
        <div className="hero-ctas">
          <button
            className="cta-primary"
            onClick={() => navigate("/register")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Get Started as a Reader
          </button>
          <button
            className="cta-secondary"
            onClick={() => navigate("/librarian-register")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            Register Your Library With Us
          </button>
        </div>

        <p className="hero-footnote">Start your journey with us today!</p>

        {/* Decorative book spines */}
        <div className="hero-spines" aria-hidden="true">
          {["#c9a84c","#7c4f2a","#3a5a3a","#4a3a6a","#6a2a2a","#2a4a5a","#8a6a2a","#3a3a3a"].map((c, i) => (
            <div key={i} className="spine" style={{ background: c, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="land-stats" id="stats">
        {stats.map((s, i) => (
          <div className="stat-item" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="land-features" id="features">
        <div className="section-header">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Everything a reader needs</h2>
          <p className="section-sub">Built from the ground up for Indian libraries and the readers who love them.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              className="feat-card"
              key={i}
              style={{ animationDelay: `${i * 0.09}s` }}
            >
              <div className="feat-emoji">{f.emoji}</div>
              <span className="feat-tag">{f.tag}</span>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission Banner ── */}
      <section className="land-mission">
        <div className="mission-inner">
          <blockquote className="mission-quote">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </blockquote>
          <cite className="mission-cite">— George R.R. Martin</cite>
          <p className="mission-body">
            पुस्तकholic was born from one simple belief: every Indian deserves access to great books.
            We're building the infrastructure to make libraries discoverable, borrowing frictionless,
            and reading social again.
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="land-bottom-cta">
        <h2 className="bcta-title">Ready to start reading?</h2>
        <p className="bcta-sub">Join thousands of readers already on the platform.</p>
        <div className="hero-ctas">
          <button className="cta-primary" onClick={() => navigate("/register")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Get Started as a Reader
          </button>
          <button className="cta-secondary" onClick={() => navigate("/librarian-register")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            Register Your Library With Us
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="land-footer">
        <span className="land-logo"><span className="logo-hi">पुस्तक</span>holic</span>
        <span className="footer-copy">© {new Date().getFullYear()} · Made with ❤️ for Indian readers</span>
      </footer>
    </div>
  );
}