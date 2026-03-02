import express from "express";
import db from "../db.js";

const router = express.Router();

/* ===================================================
   BORROW A BOOK (Reader borrows a book)
=================================================== */
router.post("/", (req, res) => {
  const { rID, bID } = req.body;

  if (!rID || !bID) {
    return res.status(400).json({ error: "rID and bID are required." });
  }

  const parsedRID = Number(rID);
  const parsedBID = Number(bID);

  if (isNaN(parsedRID) || isNaN(parsedBID)) {
    return res.status(400).json({ error: "Invalid numeric values." });
  }

  const issueDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: "Database connection failed." });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Failed to start transaction." });
      }

      // Step 1: Check if book exists and has quantity > 0
      connection.query(
        "SELECT bQty FROM books WHERE bID = ?",
        [parsedBID],
        (err, bookResults) => {
          if (err) return rollback(connection, res, err);

          if (bookResults.length === 0) {
            connection.rollback(() => {
              connection.release();
              return res.status(404).json({ error: "Book not found." });
            });
            return;
          }

          if (bookResults[0].bQty <= 0) {
            connection.rollback(() => {
              connection.release();
              return res.status(400).json({ error: "Book is out of stock." });
            });
            return;
          }

          // Step 2: Check if reader already has this book borrowed
          connection.query(
            "SELECT * FROM CurrentRead WHERE rID = ? AND bID = ?",
            [parsedRID, parsedBID],
            (err, currentResults) => {
              if (err) return rollback(connection, res, err);

              if (currentResults.length > 0) {
                connection.rollback(() => {
                  connection.release();
                  return res.status(409).json({ error: "You have already borrowed this book." });
                });
                return;
              }

              // Step 3: Insert into CurrentRead
              connection.query(
                "INSERT INTO CurrentRead (rID, bID, issueDate) VALUES (?, ?, ?)",
                [parsedRID, parsedBID, issueDate],
                (err) => {
                  if (err) return rollback(connection, res, err);

                  // Step 4: Insert into readHistory
                  connection.query(
                    "INSERT INTO readHistory (rID, bID, issueDate, returnDate) VALUES (?, ?, ?, NULL)",
                    [parsedRID, parsedBID, issueDate],
                    (err) => {
                      if (err) return rollback(connection, res, err);

                      // Step 5: Decrement book quantity
                      connection.query(
                        "UPDATE books SET bQty = bQty - 1 WHERE bID = ?",
                        [parsedBID],
                        (err) => {
                          if (err) return rollback(connection, res, err);

                          connection.commit((err) => {
                            if (err) return rollback(connection, res, err);

                            connection.release();
                            return res.status(201).json({
                              success: true,
                              message: "Book borrowed successfully.",
                              issueDate,
                            });
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
    });
  });
});

/* ===================================================
   GET CURRENT READS (Books currently borrowed by a reader)
=================================================== */
router.get("/current/:rID", (req, res) => {
  const rID = Number(req.params.rID);

  if (isNaN(rID)) {
    return res.status(400).json({ error: "Invalid reader ID." });
  }

  const sql = `
    SELECT
      b.bID,
      b.bTitle,
      b.bAuthor,
      b.bCategory,
      b.bImage,
      cr.issueDate
    FROM CurrentRead cr
    JOIN books b ON cr.bID = b.bID
    WHERE cr.rID = ?
    ORDER BY cr.issueDate DESC
  `;

  db.query(sql, [rID], (err, results) => {
    if (err) {
      console.error("Fetch current reads error:", err);
      return res.status(500).json({ error: "Failed to fetch current reads." });
    }
    return res.status(200).json({ currentReads: results });
  });
});

/* ===================================================
   GET READ HISTORY (All books ever borrowed by a reader)
=================================================== */
router.get("/history/:rID", (req, res) => {
  const rID = Number(req.params.rID);

  if (isNaN(rID)) {
    return res.status(400).json({ error: "Invalid reader ID." });
  }

  const sql = `
    SELECT
      b.bID,
      b.bTitle,
      b.bAuthor,
      b.bCategory,
      b.bImage,
      rh.issueDate,
      rh.returnDate
    FROM readHistory rh
    JOIN books b ON rh.bID = b.bID
    WHERE rh.rID = ?
    ORDER BY rh.issueDate DESC
  `;

  db.query(sql, [rID], (err, results) => {
    if (err) {
      console.error("Fetch read history error:", err);
      return res.status(500).json({ error: "Failed to fetch read history." });
    }
    return res.status(200).json({ readHistory: results });
  });
});

/* ===================================================
   RETURN A BOOK
=================================================== */
router.patch("/return", (req, res) => {
  const { rID, bID } = req.body;

  if (!rID || !bID) {
    return res.status(400).json({ error: "rID and bID are required." });
  }

  const parsedRID = Number(rID);
  const parsedBID = Number(bID);
  const returnDate = new Date().toISOString().split("T")[0];

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: "Database connection failed." });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Failed to start transaction." });
      }

      // Step 1: Delete from CurrentRead
      connection.query(
        "DELETE FROM CurrentRead WHERE rID = ? AND bID = ?",
        [parsedRID, parsedBID],
        (err, result) => {
          if (err) return rollback(connection, res, err);

          if (result.affectedRows === 0) {
            connection.rollback(() => {
              connection.release();
              return res.status(404).json({ error: "Borrow record not found." });
            });
            return;
          }

          // Step 2: Update returnDate in readHistory
          connection.query(
            "UPDATE readHistory SET returnDate = ? WHERE rID = ? AND bID = ? AND returnDate IS NULL",
            [returnDate, parsedRID, parsedBID],
            (err) => {
              if (err) return rollback(connection, res, err);

              // Step 3: Increment book quantity back
              connection.query(
                "UPDATE books SET bQty = bQty + 1 WHERE bID = ?",
                [parsedBID],
                (err) => {
                  if (err) return rollback(connection, res, err);

                  connection.commit((err) => {
                    if (err) return rollback(connection, res, err);

                    connection.release();
                    return res.status(200).json({
                      success: true,
                      message: "Book returned successfully.",
                      returnDate,
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

/* ===================================================
   ROLLBACK HELPER
=================================================== */
function rollback(connection, res, error) {
  connection.rollback(() => {
    connection.release();
    console.error(error);
    if (!res.headersSent) res.status(500).json({ error: "Database operation failed." });
  });
}

export default router;
