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

// GET ALL READERS route
router.get("/all", (req, res) => {
  const sql = `SELECT rID, rName, rUserName, rAge, rAddress, rImage FROM reader ORDER BY rID ASC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
    return res.status(200).json({ readers: results });
  });
});

// GET SINGLE READER by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT rID, rName, rUserName, rAge, rAddress, rImage FROM reader WHERE rID = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Reader not found." });
    }
    return res.status(200).json({ reader: results[0] });
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

// UPDATE PROFILE route (name, username, age, address — not password)
router.patch("/update-profile", (req, res) => {
  const { rID, rName, rUserName, rAge, rAddress } = req.body;
  if (!rID || !rName || !rUserName) {
    return res.status(400).json({ error: "rID, name, and username are required." });
  }
  const age = rAge != null && rAge !== "" ? Number(rAge) : null;
  if (rAge !== undefined && rAge !== "" && isNaN(age)) {
    return res.status(400).json({ error: "Age must be a number." });
  }
  const sql = `
    UPDATE reader
    SET rName = ?, rUserName = ?, rAge = ?, rAddress = ?
    WHERE rID = ?
  `;
  db.query(sql, [rName, rUserName, age, rAddress || null, rID], (err) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
    return res.status(200).json({
      reader: {
        rID: Number(rID),
        rName,
        rUserName,
        rAge: age,
        rAddress: rAddress || null,
      },
    });
  });
});

export default router;