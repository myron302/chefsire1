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

// ---------------- API ----------------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});
app.use("/api", apiRouter);

// ---------------- Frontend static serving ----------------
// Find the built frontend directory (must contain index.html)
const candidates = [
  // Case 1: server is bundled into dist alongside client build
  path.join(__dirname),
  // Case 2: running server directly from /server, client built to ../dist
  path.join(__dirname, "../dist"),
  // Case 3: monorepo with client build at client/dist
  path.join(__dirname, "../client/dist"),
];

const staticDir = candidates.find((p) =>
  fs.existsSync(path.join(p, "index.html"))
);

if (staticDir) {
  // Serve static frontend
  app.use(express.static(staticDir));

  // SPA fallback → always serve index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  // Fallback if frontend hasn’t been built yet
  app.get("*", (_req, res) => {
    res
      .status(200)
      .send(
        "Frontend not built yet. Run `vite build` so dist/index.html exists."
      );
  });
}
