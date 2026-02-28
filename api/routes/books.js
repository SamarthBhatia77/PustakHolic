import express from "express";
import db from "../db.js";

const router = express.Router();

/* ===============================
   ADD BOOK
================================ */
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

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: "Database connection failed." });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Failed to start transaction." });
      }

      connection.query(
        "SELECT pID FROM publisher WHERE pName = ? LIMIT 1",
        [pName],
        (err, publisherResults) => {
          if (err) return rollback(connection, res, err);

          const insertBook = (publisherId) => {
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

          if (publisherResults.length > 0) {
            insertBook(publisherResults[0].pID);
          } else {
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

/* ===============================
   GET ALL BOOKS (UPDATED)
================================ */
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
      l.lAge AS librarianAge,
      l.lAddress AS librarianAddress,
      l.lPhone AS librarianPhone
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

function rollback(connection, res, error) {
  connection.rollback(() => {
    connection.release();
    console.error(error);
    return res.status(500).json({ error: "Database operation failed." });
  });
}

export default router;