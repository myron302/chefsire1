// server/index.ts
import OpenAI from "openai";
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

import express, { type Request, type Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

// Local modules (extensionless so esbuild resolves .ts)
import { storage } from "./storage";
import { searchMealsByName, lookupMealById } from "./recipes-service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files from the built web app
app.use(express.static(path.join(__dirname, "../dist")));

// -------------------------
// Health
// -------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Server is running" });
});

// -------------------------
// Recipes API
// -------------------------

// GET /api/recipes/search
const searchQueryZ = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).default(0),
});

app.get("/api/recipes/search", async (req: Request, res: Response) => {
  try {
    const { q = "", limit, offset } = searchQueryZ.parse(req.query);

    if (!q.trim()) {
      const local = await storage.searchRecipes("", Math.min(limit, 24), offset);
      if (local.length) {
        const items = local.map((r: any) => ({
          source: "local" as const,
          id: r.id,
          title: r.title,
          imageUrl: r.imageUrl ?? null,
          category: r.category ?? null,
          cuisine: r.cuisine ?? null,
          tags: r.tags ?? null,
        }));
        return res.json({ items, total: items.length, limit, offset });
      }
      // fallback so page isn't empty
      const defaults = await searchMealsByName("chicken");
      const items = defaults.slice(0, limit).map((m) => ({
        source: "mealdb" as const,
        sourceId: m.sourceId,
        title: m.title,
        imageUrl: m.imageUrl ?? null,
        category: m.category ?? null,
        cuisine: m.cuisine ?? null,
        tags: m.tags ?? null,
      }));
      return res.json({ items, total: items.length, limit, offset });
    }

    const meals = await searchMealsByName(q.trim());
    const total = meals.length;
    const paged = meals.slice(offset, offset + limit);
    const items = paged.map((m) => ({
      source: "mealdb" as const,
      sourceId: m.sourceId,
      title: m.title,
      imageUrl: m.imageUrl ?? null, // ✅ strMealThumb
      category: m.category ?? null,
      cuisine: m.cuisine ?? null,
      tags: m.tags ?? null,
    }));
    res.json({ items, total, limit, offset });
  } catch (err: any) {
    console.error("GET /api/recipes/search error:", err);
    res.status(500).json({ error: "Search failed", detail: err?.message ?? String(err) });
  }
});

// POST /api/recipes/fetch
const fetchBodyZ = z.union([
  z.object({ idMeal: z.string().min(1) }),
  z.object({ name: z.string().min(1) }),
]);

app.post("/api/recipes/fetch", async (req: Request, res: Response) => {
  try {
    const body = fetchBodyZ.parse(req.body);

    const normalized =
      "idMeal" in body
        ? await lookupMealById(body.idMeal)
        : (await searchMealsByName(body.name)).at(0) ?? null;

    if (!normalized) return res.status(404).json({ error: "Recipe not found in TheMealDB" });

    const saved = await storage.upsertMealDbRecipe({
      sourceId: normalized.sourceId,
      title: normalized.title,
      imageUrl: normalized.imageUrl ?? null,
      instructionsSteps: normalized.instructionsSteps,
      ingredients: normalized.ingredients,
      cuisine: normalized.cuisine ?? null,
      category: normalized.category ?? null,
      tags: normalized.tags ?? null,
      youtubeUrl: normalized.youtubeUrl ?? null,
      sourceUrl: normalized.sourceUrl ?? null,
      searchText: normalized.searchText,
    });

    res.json(saved);
  } catch (err: any) {
    console.error("POST /api/recipes/fetch error:", err);
    res.status(400).json({ error: "Import failed", detail: err?.message ?? String(err) });
  }
});

// GET /api/recipes/:id
app.get("/api/recipes/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const row = await storage.getRecipe(id);
    if (!row) return res.status(404).json({ error: "Recipe not found" });
    res.json(row);
  } catch (err: any) {
    console.error("GET /api/recipes/:id error:", err);
    res.status(500).json({ error: "Failed to fetch recipe", detail: err?.message ?? String(err) });
  }
});

// -------------------------
// Ingredient substitutions (AI-powered with fallback)
// -------------------------
app.get(
  "/api/ingredients/:ingredient/substitutions",
  async (req: Request, res: Response) => {
    try {
      const ingredient = String(req.params.ingredient || "").trim();
      if (!ingredient) return res.status(400).json({ error: "Ingredient is required" });

      // Fallback if no key present
      if (!openai) {
        return res.json({
          ingredient,
          suggestions: [
            { substitute: "Margarine", reason: "Similar fat content and texture", ratio: "1:1", impact: "Slight flavor change" },
            { substitute: "Coconut oil", reason: "Solid fat; melts like butter", ratio: "1:1", impact: "Adds coconut aroma" },
            { substitute: "Olive oil", reason: "Good for sautéing and baking", ratio: "3/4 cup per 1 cup butter", impact: "Less rich; no dairy solids" },
          ],
          note: "Set OPENAI_API_KEY to enable AI-generated suggestions.",
        });
      }

      const system = `Return concise cooking substitution suggestions as strict JSON only.
Each suggestion must include: substitute, reason (<=1 sentence), ratio (e.g. "1:1"), impact (<=1 sentence).
Provide 4–6 options spanning budget, dietary, availability. No prose outside JSON.`;

      const prompt = `Ingredient: ${ingredient}`;

      const resp = await openai.responses.create({
        model: "gpt-4.1-mini",
        temperature: 0.3,
        input: [
          { role: "system", content: system },
          { role: "user", content: prompt },
          { role: "user", content: `Respond ONLY with JSON: {"ingredient":"${ingredient}","suggestions":[{"substitute":"...","reason":"...","ratio":"...","impact":"..."}]}` },
        ],
      });

      const text = resp.output_text ?? "";
      let payload: any;
      try {
        payload = JSON.parse(text);
      } catch {
        const m = text.match(/\{[\s\S]*\}$/);
        payload = m ? JSON.parse(m[0]) : null;
      }
      if (!payload?.ingredient || !Array.isArray(payload?.suggestions)) {
        throw new Error("AI JSON missing required fields");
      }

      res.json(payload);
    } catch (err: any) {
      console.error("subs error", err);
      res.status(200).json({
        ingredient: String(req.params.ingredient || "").trim(),
        suggestions: [
          { substitute: "Greek yogurt", reason: "Creamy tang in sauces/bakes", ratio: "1:1", impact: "Tangier flavor, higher protein" },
          { substitute: "Silken tofu (blended)", reason: "Neutral creamy base, dairy-free", ratio: "1:1", impact: "Less rich; season more" },
        ],
        note: "AI response failed to parse; showing a safe fallback.",
      });
    }
  }
);

// -------------------------
// Catch-all: send React index.html
// -------------------------
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const port = parseInt(process.env.PORT || "10000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
