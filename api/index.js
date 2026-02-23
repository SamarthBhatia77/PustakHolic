import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing.js";
import readersRouter from "./routes/readers.js";
import librariansRouter from "./routes/librarians.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// UploadThing route handler
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));