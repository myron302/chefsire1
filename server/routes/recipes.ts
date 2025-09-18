// server/routes/recipes.ts
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { searchMealsByName, lookupMealById } from "../recipes-service";

export const recipesRouter = Router();

// GET /api/recipes/search  (mounted under /api later)
const searchQueryZ = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).default(0),
});

recipesRouter.get("/recipes/search", async (req: Request, res: Response) => {
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
      imageUrl: m.imageUrl ?? null,
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

recipesRouter.post("/recipes/fetch", async (req: Request, res: Response) => {
  try {
    const body = fetchBodyZ.parse(req.body);

    const normalized =
      "idMeal" in body
        ? await lookupMealById(body.idMeal)
        : (await searchMealsByName(body.name)).at(0) ?? null;

    if (!normalized) {
      return res.status(404).json({ error: "Recipe not found in TheMealDB" });
    }

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
recipesRouter.get("/recipes/:id", async (req: Request, res: Response) => {
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
