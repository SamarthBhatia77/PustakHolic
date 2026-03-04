/**
 * Run borrow_and_defaulters migration: creates return_requests, defaulters,
 * and adds markedAsRead to readHistory.
 * Run from api folder: npm run migrate   (or: node run-migration.js)
 */
import db from "./db.js";

const ALTER_MARKED_AS_READ = `
  ALTER TABLE readHistory ADD COLUMN markedAsRead TINYINT(1) DEFAULT 0
`;
const CREATE_RETURN_REQUESTS = `
  CREATE TABLE IF NOT EXISTS return_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rID INT NOT NULL,
    bID INT NOT NULL,
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    UNIQUE KEY one_request (rID, bID),
    FOREIGN KEY (rID) REFERENCES reader(rID) ON DELETE CASCADE,
    FOREIGN KEY (bID) REFERENCES books(bID) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
`;
const CREATE_DEFAULTERS = `
  CREATE TABLE IF NOT EXISTS defaulters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rID INT NOT NULL,
    bID INT NOT NULL,
    issue_date DATE NOT NULL,
    penalty_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (rID) REFERENCES reader(rID) ON DELETE CASCADE,
    FOREIGN KEY (bID) REFERENCES books(bID) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
`;

db.getConnection((err, connection) => {
  if (err) {
    console.error("Migration failed: could not get DB connection:", err.message);
    process.exit(1);
  }

  const run = (sql, label) =>
    new Promise((resolve, reject) => {
      connection.query(sql, (qerr) => {
        if (qerr) reject(qerr);
        else resolve();
      });
    });

  (async () => {
    try {
      await run(ALTER_MARKED_AS_READ, "markedAsRead").catch((e) => {
        if (e.code === "ER_DUP_FIELDNAME" || e.errno === 1060) {
          console.log("readHistory.markedAsRead already exists, skipping.");
        } else throw e;
      });
      await run(CREATE_RETURN_REQUESTS, "return_requests");
      console.log("Table return_requests created or already exists.");
      await run(CREATE_DEFAULTERS, "defaulters");
      console.log("Table defaulters created or already exists.");
      console.log("Migration completed.");
    } catch (e) {
      console.error("Migration error:", e.message);
      process.exit(1);
    } finally {
      connection.release();
      process.exit(0);
    }
  })();
});
