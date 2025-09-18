// server/app.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json());

// ---- API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});
app.use("/api", apiRouter);

// ---- Static frontend (built by Vite into ../dist)
const staticDir = path.join(__dirname, "../dist");
app.use(express.static(staticDir));

// ---- SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});
