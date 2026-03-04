import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./YourReaders.css";

export default function YourReaders() {
  const navigate = useNavigate();
  const [librarian, setLibrarian] = useState(null);
  const [readers, setReaders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaulterModal, setDefaulterModal] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [defaulterLoading, setDefaulterLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("librarian");
    if (!stored) {
      navigate("/librarian-login");
      return;
    }
    setLibrarian(JSON.parse(stored));
  }, [navigate]);

  const refetch = () => {
    if (!librarian?.lID) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/librarians/your-readers?lID=${librarian.lID}`).then((r) => r.json()),
      fetch(`/api/librarians/return-requests?lID=${librarian.lID}`).then((r) => r.json()),
    ])
      .then(([readersRes, returnsRes]) => {
        setReaders(readersRes.readers || []);
        setReturnRequests(returnsRes.returnRequests || []);
      })
      .catch(() => {
        setReaders([]);
        setReturnRequests([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!librarian?.lID) return;
    refetch();
  }, [librarian?.lID]);

  const handleVerifyReturn = async (rID, bID) => {
    if (!librarian) return;
    setVerifyLoading(`${rID}-${bID}`);
    try {
      const res = await fetch("/api/librarians/verify-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lID: librarian.lID, rID, bID }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to verify return.");
      refetch();
    } catch (e) {
      alert(e.message || "Could not verify return.");
    } finally {
      setVerifyLoading(null);
    }
  };

  const openDefaulterModal = (row) => {
    setDefaulterModal(row);
    // Pre-fill with existing penalty so the librarian can edit it
    setPenaltyAmount(row.penaltyAmount != null ? String(row.penaltyAmount) : "");
  };

  const closeDefaulterModal = () => {
    setDefaulterModal(null);
    setPenaltyAmount("");
  };

  const handleMarkDefaulter = async (e) => {
    e.preventDefault();
    if (!defaulterModal || !librarian) return;
    const amount = Number(penaltyAmount);
    if (isNaN(amount) || amount < 0) {
      alert("Enter a valid penalty amount (0 or more).");
      return;
    }
    setDefaulterLoading(true);
    try {
      const res = await fetch("/api/librarians/mark-defaulter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lID: librarian.lID,
          rID: defaulterModal.rID,
          bID: defaulterModal.bID,
          issueDate: defaulterModal.issueDate?.slice(0, 10) || defaulterModal.issueDate,
          penaltyAmount: amount,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to mark defaulter.");
      closeDefaulterModal();
      refetch();
    } catch (e) {
      alert(e.message || "Could not mark defaulter.");
    } finally {
      setDefaulterLoading(false);
    }
  };

  const isReturnPending = (rID, bID) =>
    returnRequests.some((r) => r.rID === rID && r.bID === bID);

  if (!librarian) return null;

  return (
    <div className="yr-root">
      <div className="yr-bg-grid" />
      <div className="yr-blob yr-blob-1" />
      <div className="yr-blob yr-blob-2" />

      <main className="yr-main">
        <div className="yr-header">
          <h1 className="yr-title">Your readers</h1>
          <p className="yr-subtitle">Readers who have borrowed books from your library.</p>
        </div>

        {loading ? (
          <div className="yr-loading">
            <span className="yr-spinner" />
            <span>Loading…</span>
          </div>
        ) : readers.length === 0 ? (
          <div className="yr-empty">
            <div className="yr-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="yr-empty-title">No readers currently holding your books</p>
            <p className="yr-empty-sub">When readers borrow your books, they will appear here.</p>
          </div>
        ) : (
          <div className="yr-cards">
            {readers.map((row) => {
              const pending = isReturnPending(row.rID, row.bID);
              return (
                <div key={`${row.rID}-${row.bID}`} className="yr-card">
                  <div className="yr-card-book">
                    <div className="yr-book-cover">
                      {row.bImage ? (
                        <img src={row.bImage} alt={row.bookTitle} className="yr-book-img" />
                      ) : (
                        <div className="yr-book-no-img">No Cover</div>
                      )}
                    </div>
                    <div className="yr-book-info">
                      <h3 className="yr-book-title">{row.bookTitle}</h3>
                      <p className="yr-book-author">{row.bAuthor}</p>
                      {row.bCategory && (
                        <span className="yr-book-category">{row.bCategory}</span>
                      )}
                    </div>
                  </div>
                  <div className="yr-card-reader">
                    <p className="yr-reader-name">{row.readerName}</p>
                    <p className="yr-reader-username">@{row.readerUserName}</p>
                    <p className="yr-reader-date">Borrowed: {row.issueDate?.slice(0, 10)}</p>
                    {row.penaltyAmount != null && (
                      <p className="yr-reader-defaulter">
                        Marked as defaulter — ₹{Number(row.penaltyAmount)}
                      </p>
                    )}
                  </div>
                  <div className="yr-card-actions">
                    {pending && (
                      <button
                        type="button"
                        className="yr-btn yr-btn-verify"
                        onClick={() => handleVerifyReturn(row.rID, row.bID)}
                        disabled={verifyLoading === `${row.rID}-${row.bID}`}
                      >
                        {verifyLoading === `${row.rID}-${row.bID}` ? "…" : "Verify return"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="yr-btn yr-btn-defaulter"
                      onClick={() => openDefaulterModal(row)}
                    >
                      {row.penaltyAmount != null ? "Edit penalty" : "Mark as defaulter"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {defaulterModal && (
          <div className="yr-modal-overlay" onClick={closeDefaulterModal} role="dialog" aria-modal="true" aria-label="Mark defaulter">
            <div className="yr-modal" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="yr-modal-close" onClick={closeDefaulterModal} aria-label="Close">×</button>
              <h2 className="yr-modal-title">
                {defaulterModal.penaltyAmount != null ? "Edit defaulter penalty" : "Mark as defaulter"}
              </h2>
              <p className="yr-modal-info">
                {defaulterModal.readerName} (@{defaulterModal.readerUserName}) — {defaulterModal.bookTitle}
              </p>
              <form onSubmit={handleMarkDefaulter} className="yr-modal-form">
                <label className="yr-modal-label">Penalty amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  placeholder="0"
                  required
                />
                <div className="yr-modal-actions">
                  <button type="button" className="yr-btn yr-btn-cancel" onClick={closeDefaulterModal}>Cancel</button>
                  <button type="submit" className="yr-btn yr-btn-save" disabled={defaulterLoading}>
                    {defaulterLoading ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
