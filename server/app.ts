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
function isBuiltDir(p: string) {
  const indexHtml = path.join(p, "index.html");
  const assetsDir = path.join(p, "assets");
  return fs.existsSync(indexHtml) && fs.existsSync(assetsDir);
}

// Common build locations:
// - When bundled: __dirname (dist/)
// - Root build:  ../dist
// - Monorepo:    ../client/dist
const candidates = [
  path.join(__dirname),
  path.join(__dirname, "../dist"),
  path.join(__dirname, "../client/dist"),
];

const staticDir = candidates.find(isBuiltDir);

if (staticDir) {
  app.use(express.static(staticDir));

  // SPA fallback ONLY for real page navigations (not assets or API)
  app.get("*", (req, res, next) => {
    const wantsHtml = (req.headers.accept || "").includes("text/html");
    const isApi = req.path.startsWith("/api/");
    const looksLikeAsset = req.path.includes(".");
    if (req.method !== "GET" || isApi || looksLikeAsset || !wantsHtml) {
      return next();
    }
    res.sendFile(path.join(staticDir!, "index.html"));
  });
} else {
  // Helpful message if the build isn't found
  app.get("*", (_req, res) => {
    res
      .status(200)
      .send(
        "Frontend build not found. Run `vite build` (or `cd client && vite build`) so dist/index.html and dist/assets/ exist."
      );
  });
}
