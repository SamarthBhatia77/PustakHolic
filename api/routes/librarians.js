import express from "express";
import db from "../db.js";

const router = express.Router();

// REGISTER route
router.post("/register", (req, res) => {
  const { lName, lAge, lPhone, lPassword, lUserName, lAddress } = req.body;

  if (!lName || !lAge || !lPhone || !lPassword || !lUserName || !lAddress) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if librarian already exists
  const checkSql = `SELECT lID FROM librarian WHERE lUserName = ? OR lName = ?`;
  db.query(checkSql, [lUserName, lName], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(409).json({
        error: "A librarian with this name or username already exists. Please login instead.",
      });
    }

    // Get next lID
    db.query("SELECT MAX(lID) AS maxID FROM librarian", (err, maxResult) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      const nextID = (maxResult[0].maxID || 0) + 1;

      const insertSql = `
        INSERT INTO librarian (lID, lName, lUserName, lAge, lPhone, lAddress, lPassword, lImage)
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
      `;

      db.query(
        insertSql,
        [nextID, lName, lUserName, Number(lAge), Number(lPhone), lAddress, lPassword],
        (err) => {
          if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ error: "Internal server error." });
          }

          return res.status(201).json({
            librarian: {
              lID: nextID,
              lName,
              lUserName,
              lAge: Number(lAge),
              lPhone: Number(lPhone),
              lAddress,
              lImage: null,
            },
          });
        }
      );
    });
  });
});

// LOGIN route
router.post("/login", (req, res) => {
  const { lUserName, lPassword } = req.body;

  if (!lUserName || !lPassword) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const sql = `
    SELECT lID, lName, lUserName, lAge, lPhone, lAddress, lImage
    FROM librarian
    WHERE lUserName = ? AND lPassword = ?
  `;

  db.query(sql, [lUserName, lPassword], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({
        error: "No account found. Please register your library first before logging in.",
      });
    }

    return res.status(200).json({ librarian: results[0] });
  });
});

// UPDATE IMAGE route
router.patch("/update-image", (req, res) => {
  const { lID, imageUrl } = req.body;
  if (!lID || !imageUrl) {
    return res.status(400).json({ error: "lID and imageUrl are required." });
  }
  db.query("UPDATE librarian SET lImage = ? WHERE lID = ?", [imageUrl, lID], (err) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
    return res.status(200).json({ imageUrl });
  });
});

// UPDATE PROFILE route (name, username, age, phone, address — not password)
router.patch("/update-profile", (req, res) => {
  const { lID, lName, lUserName, lAge, lPhone, lAddress } = req.body;
  if (!lID || !lName || !lUserName) {
    return res.status(400).json({ error: "lID, name, and username are required." });
  }
  const age = lAge != null && lAge !== "" ? Number(lAge) : null;
  const phone = lPhone != null && lPhone !== "" ? String(lPhone) : null;
  if (lAge !== undefined && lAge !== "" && isNaN(age)) {
    return res.status(400).json({ error: "Age must be a number." });
  }
  const sql = `
    UPDATE librarian
    SET lName = ?, lUserName = ?, lAge = ?, lPhone = ?, lAddress = ?
    WHERE lID = ?
  `;
  db.query(sql, [lName, lUserName, age, phone, lAddress || null, lID], (err) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
    return res.status(200).json({
      librarian: {
        lID: Number(lID),
        lName,
        lUserName,
        lAge: age,
        lPhone: phone,
        lAddress: lAddress || null,
      },
    });
  });
});

/* ===================================================
   YOUR READERS (Readers currently holding books from this librarian)
=================================================== */
router.get("/your-readers", (req, res) => {
  const lID = Number(req.query.lID);
  if (!lID || isNaN(lID)) {
    return res.status(400).json({ error: "lID is required." });
  }

  const sql = `
    SELECT
      cr.rID,
      cr.bID,
      cr.issueDate,
      r.rName AS readerName,
      r.rUserName AS readerUserName,
      b.bTitle AS bookTitle,
      b.bAuthor AS bookAuthor,
      b.bImage,
      b.bCategory,
      d.penalty_amount AS penaltyAmount
    FROM CurrentRead cr
    JOIN books b ON cr.bID = b.bID
    JOIN reader r ON cr.rID = r.rID
    LEFT JOIN (
      SELECT rID, bID, MAX(penalty_amount) AS penalty_amount
      FROM defaulters
      GROUP BY rID, bID
    ) d ON d.rID = cr.rID AND d.bID = cr.bID
    WHERE b.lID = ?
    ORDER BY cr.issueDate DESC
  `;

  db.query(sql, [lID], (err, results) => {
    if (err) {
      console.error("your-readers error:", err);
      return res.status(500).json({ error: "Failed to fetch readers." });
    }
    return res.status(200).json({ readers: results || [] });
  });
});

/* ===================================================
   RETURN REQUESTS (Pending returns for this librarian's books)
=================================================== */
router.get("/return-requests", (req, res) => {
  const lID = Number(req.query.lID);
  if (!lID || isNaN(lID)) {
    return res.status(400).json({ error: "lID is required." });
  }

  const sql = `
    SELECT
      rr.id AS requestId,
      rr.rID,
      rr.bID,
      rr.requestedAt,
      r.rName AS readerName,
      r.rUserName AS readerUserName,
      b.bTitle AS bookTitle,
      cr.issueDate
    FROM return_requests rr
    JOIN CurrentRead cr ON rr.rID = cr.rID AND rr.bID = cr.bID
    JOIN books b ON cr.bID = b.bID
    JOIN reader r ON rr.rID = r.rID
    WHERE b.lID = ? AND rr.status = 'pending'
    ORDER BY rr.requestedAt ASC
  `;

  db.query(sql, [lID], (err, results) => {
    if (err) {
      console.error("return-requests error:", err);
      return res.status(500).json({ error: "Failed to fetch return requests." });
    }
    return res.status(200).json({ returnRequests: results || [] });
  });
});

/* ===================================================
   VERIFY RETURN (Librarian confirms return -> remove from CurrentRead, update readHistory, restore stock)
=================================================== */
router.post("/verify-return", (req, res) => {
  const { lID, rID, bID } = req.body || {};
  const lid = Number(lID);
  const rid = Number(rID);
  const bid = Number(bID);

  if (!lid || !rid || !bid || isNaN(lid) || isNaN(rid) || isNaN(bid)) {
    return res.status(400).json({ error: "lID, rID, and bID are required." });
  }

  const returnDate = new Date().toISOString().split("T")[0];

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: "Database connection failed." });

    connection.beginTransaction((errTr) => {
      if (errTr) {
        connection.release();
        return res.status(500).json({ error: "Transaction failed." });
      }

      connection.query(
        "SELECT bID FROM books WHERE bID = ? AND lID = ?",
        [bid, lid],
        (err, rows) => {
          if (err) return rollback(connection, res, err);
          if (!rows || rows.length === 0) {
            connection.rollback(() => {
              connection.release();
              res.status(403).json({ error: "Book not found or not yours." });
            });
            return;
          }

          connection.query(
            "DELETE FROM CurrentRead WHERE rID = ? AND bID = ?",
            [rid, bid],
            (err, delResult) => {
              if (err) return rollback(connection, res, err);
              if (delResult.affectedRows === 0) {
                connection.rollback(() => {
                  connection.release();
                  res.status(404).json({ error: "Borrow record not found." });
                });
                return;
              }

              connection.query(
                "UPDATE readHistory SET returnDate = ? WHERE rID = ? AND bID = ? AND returnDate IS NULL",
                [returnDate, rid, bid],
                (err) => {
                  if (err) return rollback(connection, res, err);
                  connection.query(
                    "UPDATE books SET bQty = bQty + 1 WHERE bID = ?",
                    [bid],
                    (err) => {
                      if (err) return rollback(connection, res, err);
                      connection.query(
                        "DELETE FROM return_requests WHERE rID = ? AND bID = ?",
                        [rid, bid],
                        (err) => {
                          if (err) return rollback(connection, res, err);
                          connection.query(
                            "DELETE FROM defaulters WHERE rID = ? AND bID = ?",
                            [rid, bid],
                            (err) => {
                              if (err) return rollback(connection, res, err);
                              connection.commit((err) => {
                                if (err) return rollback(connection, res, err);
                                connection.release();
                                res.status(200).json({ success: true, message: "Return verified. Stock updated." });
                              });
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});

function rollback(connection, res, error) {
  connection.rollback(() => {
    connection.release();
    console.error(error);
    if (!res.headersSent) res.status(500).json({ error: "Database operation failed." });
  });
}

/* ===================================================
   MARK / EDIT DEFaulter
   - First call for a given (rID, bID) borrow: INSERT
   - Subsequent calls (edit penalty): UPDATE
   - After a verified return the record is wiped, so a
     re-issue creates a brand-new defaulter entry
=================================================== */
router.post("/mark-defaulter", (req, res) => {
  const { lID, rID, bID, issueDate, penaltyAmount } = req.body || {};

  const lid = Number(lID);
  const rid = Number(rID);
  const bid = Number(bID);

  if (!lid || !rid || !bid || !issueDate || penaltyAmount == null || penaltyAmount === "") {
    return res.status(400).json({ error: "lID, rID, bID, issueDate, and penaltyAmount are required." });
  }

  const penalty = Number(penaltyAmount);
  if (isNaN(penalty) || penalty < 0) {
    return res.status(400).json({ error: "penaltyAmount must be a non-negative number." });
  }

  // Verify the book belongs to this librarian
  db.query(
    "SELECT bID FROM books WHERE bID = ? AND lID = ?",
    [bid, lid],
    (err, rows) => {
      if (err) {
        console.error("mark-defaulter check book:", err);
        return res.status(500).json({ error: "Database error." });
      }
      if (!rows || rows.length === 0) {
        return res.status(403).json({ error: "Book not found or you are not the owner." });
      }

      // Check if a defaulter record already exists for this active borrow
      db.query(
        "SELECT rID FROM defaulters WHERE rID = ? AND bID = ?",
        [rid, bid],
        (err, existing) => {
          if (err) {
            console.error("mark-defaulter check existing:", err);
            return res.status(500).json({ error: "Database error." });
          }

          if (existing && existing.length > 0) {
            // Update the penalty for the existing record
            db.query(
              "UPDATE defaulters SET penalty_amount = ?, issue_date = ? WHERE rID = ? AND bID = ?",
              [penalty, issueDate, rid, bid],
              (errUpdate) => {
                if (errUpdate) {
                  console.error("mark-defaulter update:", errUpdate);
                  return res.status(500).json({ error: "Failed to update defaulter." });
                }
                return res.status(200).json({ success: true, message: "Defaulter penalty updated." });
              }
            );
          } else {
            // Fresh borrow (or first time) — insert new record
            db.query(
              "INSERT INTO defaulters (rID, bID, issue_date, penalty_amount) VALUES (?, ?, ?, ?)",
              [rid, bid, issueDate, penalty],
              (errInsert) => {
                if (errInsert) {
                  console.error("mark-defaulter insert:", errInsert);
                  return res.status(500).json({ error: "Failed to add defaulter." });
                }
                return res.status(201).json({ success: true, message: "Defaulter recorded. Reader will be notified." });
              }
            );
          }
        }
      );
    }
  );
});

export default router;