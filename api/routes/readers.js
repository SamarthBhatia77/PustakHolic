import express from "express";
import db from "../db.js";

const router = express.Router();

// LOGIN route
router.post("/login", (req, res) => {
  const { rUserName, rPassword, rName } = req.body;

  if (!rUserName || !rPassword || !rName) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const sql = `
    SELECT rID, rName, rUserName, rAge, rAddress, rImage
    FROM reader
    WHERE rUserName = ? AND rPassword = ? AND rName = ?
  `;

  db.query(sql, [rUserName, rPassword, rName], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({
        error: "No account found. Please register first before logging in.",
      });
    }

    // Return reader profile (never return password)
    return res.status(200).json({ reader: results[0] });
  });
});

// REGISTER route
router.post("/register", (req, res) => {
  const { rUserName, rPassword, rName } = req.body;

  if (!rUserName || !rPassword || !rName) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if reader already exists
  const checkSql = `SELECT rID FROM reader WHERE rUserName = ? OR rName = ?`;
  db.query(checkSql, [rUserName, rName], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(409).json({
        error: "You are already a registered reader! Please Login.",
      });
    }

    // Get the max rID so we can increment it
    db.query("SELECT MAX(rID) AS maxID FROM reader", (err, maxResult) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      const nextID = (maxResult[0].maxID || 0) + 1;

      const insertSql = `
        INSERT INTO reader (rID, rName, rUserName, rPassword, rAge, rAddress, rImage)
        VALUES (?, ?, ?, ?, NULL, NULL, NULL)
      `;

      db.query(insertSql, [nextID, rName, rUserName, rPassword], (err) => {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ error: "Internal server error." });
        }

        // Return new reader profile (no password)
        return res.status(201).json({
          reader: {
            rID: nextID,
            rName,
            rUserName,
            rAge: null,
            rAddress: null,
            rImage: null,
          },
        });
      });
    });
  });
});

// UPDATE IMAGE route
router.patch("/update-image", (req, res) => {
  const { rID, imageUrl } = req.body;

  if (!rID || !imageUrl) {
    return res.status(400).json({ error: "rID and imageUrl are required." });
  }

  db.query(
    "UPDATE reader SET rImage = ? WHERE rID = ?",
    [imageUrl, rID],
    (err) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error." });
      }
      return res.status(200).json({ imageUrl });
    }
  );
});

// UPDATE PROFILE route
router.put("/update-profile", (req, res) => {
  const { rID, rUserName, rPassword, rAge, rAddress } = req.body;

  if (!rID || !rUserName) {
    return res.status(400).json({ error: "Username is required." });
  }

  const checkSql = `
    SELECT rID FROM reader
    WHERE rUserName = ? AND rID != ?
  `;

  db.query(checkSql, [rUserName, rID], (err, results) => {
    if (err) return res.status(500).json({ error: "Internal server error." });

    if (results.length > 0) {
      return res.status(409).json({
        error: "Username already taken. Please choose another one."
      });
    }

    let updateSql;
    let values;

    if (rPassword && rPassword.trim() !== "") {
      updateSql = `
        UPDATE reader
        SET rUserName = ?, rPassword = ?, rAge = ?, rAddress = ?
        WHERE rID = ?
      `;
      values = [rUserName, rPassword, rAge || null, rAddress || null, rID];
    } else {
      updateSql = `
        UPDATE reader
        SET rUserName = ?, rAge = ?, rAddress = ?
        WHERE rID = ?
      `;
      values = [rUserName, rAge || null, rAddress || null, rID];
    }

    db.query(updateSql, values, (err) => {
      if (err) return res.status(500).json({ error: "Internal server error." });

      return res.status(200).json({ message: "Profile updated successfully." });
    });
  });
});

// DELETE ACCOUNT route
router.delete("/delete-account", (req, res) => {
  const { rID, password } = req.body;

  if (!rID || !password) {
    return res.status(400).json({ error: "Password is required." });
  }

  db.query(
    "SELECT rPassword FROM reader WHERE rID = ?",
    [rID],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Internal server error." });

      if (results.length === 0) {
        return res.status(404).json({ error: "Reader not found." });
      }

      if (results[0].rPassword !== password) {
        return res.status(401).json({ error: "Incorrect password." });
      }

      db.query("DELETE FROM reader WHERE rID = ?", [rID], (err) => {
        if (err) return res.status(500).json({ error: "Failed to delete account." });

        return res.status(200).json({ message: "Account deleted successfully." });
      });
    }
  );
});
export default router;