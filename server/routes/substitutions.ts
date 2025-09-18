// server/routes/substitutions.ts
import { Router, type Request, type Response } from "express";

export const subsRouter = Router();

/**
 * GET /api/ingredients/:ingredient/substitutions
 * - If OPENAI_API_KEY is NOT set, returns a static fallback (no openai package required).
 * - If OPENAI_API_KEY is set, lazy-imports the OpenAI SDK and returns AI-generated JSON.
 */
subsRouter.get("/ingredients/:ingredient/substitutions", async (req: Request, res: Response) => {
  try {
    const ingredient = String(req.params.ingredient || "").trim();
    if (!ingredient) return res.status(400).json({ error: "Ingredient is required" });

    // If no key, use static suggestions (keeps route working in all environments)
    if (!process.env.OPENAI_API_KEY) {
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

    // Lazy-load the SDK only when needed
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `Return concise cooking substitution suggestions as strict JSON only.
Each suggestion must include: substitute, reason (<=1 sentence), ratio (e.g. "1:1"), impact (<=1 sentence).
Provide 4–6 options spanning budget, dietary, availability. No prose outside JSON.`;

    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      input: [
        { role: "system", content: system },
        { role: "user", content: `Ingredient: ${ingredient}` },
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
});
