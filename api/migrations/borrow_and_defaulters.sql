-- Run this once. Adds: markedAsRead to readHistory, return_requests table, defaulters table.
-- Uses existing table names: CurrentRead, readHistory, books, reader.

-- 1. Already Read = only books reader has marked as read
-- Run once; if column exists, skip this line or run: ALTER TABLE readHistory ADD COLUMN markedAsRead TINYINT(1) DEFAULT 0;
ALTER TABLE readHistory ADD COLUMN markedAsRead TINYINT(1) DEFAULT 0;

-- 2. Return requests: reader requests return -> librarian verifies -> then stock updated
CREATE TABLE IF NOT EXISTS return_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rID INT NOT NULL,
  bID INT NOT NULL,
  requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  UNIQUE KEY one_request (rID, bID),
  FOREIGN KEY (rID) REFERENCES reader(rID) ON DELETE CASCADE,
  FOREIGN KEY (bID) REFERENCES books(bID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Defaulters: librarian marks reader as defaulter for a book (penalty)
CREATE TABLE IF NOT EXISTS defaulters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rID INT NOT NULL,
  bID INT NOT NULL,
  issue_date DATE NOT NULL,
  penalty_amount DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (rID) REFERENCES reader(rID) ON DELETE CASCADE,
  FOREIGN KEY (bID) REFERENCES books(bID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
