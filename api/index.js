import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing.js";
import readersRouter from "./routes/readers.js";
import librariansRouter from "./routes/librarians.js";
import booksRouter from "./routes/books.js";
import borrowRouter from "./routes/borrow.js";   // ADD THIS LINE

dotenv.config({ path: "../.env" });

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: { token: process.env.UPLOADTHING_TOKEN },
  })
);

// App routes
app.use("/api/readers", readersRouter);
app.use("/api/librarians", librariansRouter);
app.use("/api/books", booksRouter);
app.use("/api/borrow", borrowRouter);   // ADD THIS LINE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));