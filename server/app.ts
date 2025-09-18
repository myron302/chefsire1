// server/app.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { apiRouter } from "./routes/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json());

// ---- API under /api
app.use("/api", apiRouter);

// ---- Figure out where your built frontend lives
// Tries repo-root /dist first (what your current Vite build outputs), then /client/dist
const rootDist = path.join(__dirname, "../dist");
const clientDist = path.join(__dirname, "../client/dist");
const staticDir = fs.existsSync(rootDist) ? rootDist : clientDist;

// ---- Serve static frontend if it exists
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get("*", (_req, res) => res.sendFile(path.join(staticDir, "index.html")));
} else {
  // Helpful message during dev if you haven’t built the client yet
  app.get("*", (_req, res) => {
    res
      .status(200)
      .send("Frontend not built yet. Run your client build so dist/ or client/dist/ exists.");
  });
}
