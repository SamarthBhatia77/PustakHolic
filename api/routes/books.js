import express from "express";
import db from "../db.js";

const router = express.Router();

/* ===================================================
   ADD BOOK (Librarian adds a book)
=================================================== */
router.post("/add", (req, res) => {
  const {
    lID,
    bCategory,
    bTitle,
    bAuthor,
    bQty,
    bImage,
    pName,
    pAddress,
    pPhone,
  } = req.body;

  if (!lID || !bCategory || !bTitle || !bAuthor || !bQty || !bImage || !pName) {
    return res.status(400).json({ error: "All required fields are required." });
  }

  const parsedLID = Number(lID);
  const parsedQty = Number(bQty);

  if (isNaN(parsedLID) || isNaN(parsedQty)) {
    return res.status(400).json({ error: "Invalid numeric values." });
  }

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: "Database connection failed." });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Failed to start transaction." });
      }

      /* -------- STEP 1: Check publisher -------- */
      connection.query(
        "SELECT pID FROM publisher WHERE pName = ? LIMIT 1",
        [pName],
        (err, publisherResults) => {
          if (err) return rollback(connection, res, err);

          const insertBook = (publisherId) => {
            /* -------- STEP 2: Always create new book row -------- */
            connection.query(
              "SELECT MAX(bID) AS maxID FROM books",
              (err, maxBookResult) => {
                if (err) return rollback(connection, res, err);

                const nextBID = (maxBookResult[0].maxID || 0) + 1;

                const insertBookSql = `
                  INSERT INTO books
                  (bID, lID, bCategory, bTitle, bAuthor, bImage, bQty, pID)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;

                connection.query(
                  insertBookSql,
                  [
                    nextBID,
                    parsedLID,
                    bCategory,
                    bTitle,
                    bAuthor,
                    bImage,
                    parsedQty,
                    publisherId,
                  ],
                  (err) => {
                    if (err) return rollback(connection, res, err);

                    connection.commit((err) => {
                      if (err) return rollback(connection, res, err);

                      connection.release();

                      return res.status(201).json({
                        success: true,
                        message: "Book added successfully.",
                      });
                    });
                  }
                );
              }
            );
          };

          /* -------- Publisher Exists -------- */
          if (publisherResults.length > 0) {
            insertBook(publisherResults[0].pID);
          } else {
            /* -------- Create New Publisher -------- */
            connection.query(
              "SELECT MAX(pID) AS maxID FROM publisher",
              (err, maxPubResult) => {
                if (err) return rollback(connection, res, err);

                const nextPID = (maxPubResult[0].maxID || 0) + 1;

                const insertPublisherSql = `
                  INSERT INTO publisher (pID, pName, pAddress, pPhone)
                  VALUES (?, ?, ?, ?)
                `;

                connection.query(
                  insertPublisherSql,
                  [nextPID, pName, pAddress || null, pPhone || null],
                  (err) => {
                    if (err) return rollback(connection, res, err);

                    insertBook(nextPID);
                  }
                );
              }
            );
          }
        }
      );
    });
  });
});

/* ===================================================
   GET ALL BOOKS (Reader View)
=================================================== */
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      b.bID,
      b.bCategory,
      b.bTitle,
      b.bAuthor,
      b.bImage,
      b.bQty,
      p.pName,
      p.pAddress,
      p.pPhone,
      l.lName AS librarianName,
      l.lPhone AS librarianPhone,
      l.lAddress AS librarianAddress
    FROM books b
    JOIN publisher p ON b.pID = p.pID
    JOIN librarian l ON b.lID = l.lID
    ORDER BY b.bID DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch all books error:", err);
      return res.status(500).json({ error: "Failed to fetch books." });
    }

    return res.status(200).json({ books: results });
  });
});

/* ===================================================
   GET BOOKS BY LIBRARIAN (Dashboard View)
=================================================== */
router.get("/librarian/:lID", (req, res) => {
  const lID = Number(req.params.lID);

  if (isNaN(lID)) {
    return res.status(400).json({ error: "Invalid librarian ID." });
  }

  const sql = `
    SELECT 
      b.bID,
      b.bCategory,
      b.bTitle,
      b.bAuthor,
      b.bImage,
      b.bQty,
      p.pName,
      p.pAddress,
      p.pPhone
    FROM books b
    JOIN publisher p ON b.pID = p.pID
    WHERE b.lID = ?
    ORDER BY b.bID DESC
  `;

  db.query(sql, [lID], (err, results) => {
    if (err) {
      console.error("Fetch librarian books error:", err);
      return res.status(500).json({ error: "Failed to fetch books." });
    }

    return res.status(200).json({ books: results });
  });
});

/* ===================================================
   ROLLBACK HELPER
=================================================== */
function rollback(connection, res, error) {
  connection.rollback(() => {
    connection.release();
    console.error(error);
    return res.status(500).json({ error: "Database operation failed." });
  });
}

export default router;
