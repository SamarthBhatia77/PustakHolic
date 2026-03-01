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
  const { lName, lUserName, lPassword } = req.body;

  if (!lName || !lUserName || !lPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const sql = `
    SELECT lID, lName, lUserName, lAge, lPhone, lAddress, lImage
    FROM librarian
    WHERE lName = ? AND lUserName = ? AND lPassword = ?
  `;

  db.query(sql, [lName, lUserName, lPassword], (err, results) => {
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

// UPDATE PROFILE route
router.put("/update-profile", (req, res) => {
  const { lID, lUserName, lPassword, lAge, lPhone, lAddress } = req.body;

  if (!lID || !lUserName) {
    return res.status(400).json({ error: "Username is required." });
  }

  const checkSql = `
    SELECT lID FROM librarian
    WHERE lUserName = ? AND lID != ?
  `;

  db.query(checkSql, [lUserName, lID], (err, results) => {
    if (err) return res.status(500).json({ error: "Internal server error." });

    if (results.length > 0) {
      return res.status(409).json({
        error: "Username already taken. Please choose another one."
      });
    }

    let updateSql;
    let values;

    if (lPassword && lPassword.trim() !== "") {
      updateSql = `
        UPDATE librarian
        SET lUserName = ?, lPassword = ?, lAge = ?, lPhone = ?, lAddress = ?
        WHERE lID = ?
      `;
      values = [lUserName, lPassword, lAge || null, lPhone || null, lAddress || null, lID];
    } else {
      updateSql = `
        UPDATE librarian
        SET lUserName = ?, lAge = ?, lPhone = ?, lAddress = ?
        WHERE lID = ?
      `;
      values = [lUserName, lAge || null, lPhone || null, lAddress || null, lID];
    }

    db.query(updateSql, values, (err) => {
      if (err) return res.status(500).json({ error: "Internal server error." });

      return res.status(200).json({ message: "Profile updated successfully." });
    });
  });
});

// DELETE ACCOUNT route
router.delete("/delete-account", (req, res) => {
  const { lID, password } = req.body;

  if (!lID || !password) {
    return res.status(400).json({ error: "Password is required." });
  }

  // Verify password
  db.query(
    "SELECT lPassword FROM librarian WHERE lID = ?",
    [lID],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Internal server error." });

      if (results.length === 0) {
        return res.status(404).json({ error: "Librarian not found." });
      }

      if (results[0].lPassword !== password) {
        return res.status(401).json({ error: "Incorrect password." });
      }

      // Delete books first
      db.query("DELETE FROM books WHERE lID = ?", [lID], (err) => {
        if (err) return res.status(500).json({ error: "Failed to delete books." });

        // Delete librarian
        db.query("DELETE FROM librarian WHERE lID = ?", [lID], (err) => {
          if (err) return res.status(500).json({ error: "Failed to delete account." });

          return res.status(200).json({ message: "Account deleted successfully." });
        });
      });
    }
  );
});
export default router;