// server/recipes-service.ts
import fetch from "node-fetch";
import { storage } from "./storage.js";
// If your Node doesn't expose global crypto.randomUUID(), uncomment next line:
// import crypto from "node:crypto";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

type Ing = { name: string; measure: string | null };

function splitInstructionsToSteps(text: string | null | undefined): string[] {
  if (!text) return ["No instructions available"];
  const steps =
    text
      .replace(/\r/g, "\n")
      .split(/\n+/)
      .flatMap((line) => line.split(/\.(?:\s+|$)/))
      .map((s) => s.trim())
      .filter(Boolean) || [];
  return steps.length ? steps.map((s) => (s.endsWith(".") ? s : s + ".")) : ["No instructions available"];
}

function collectIngredients(fullMeal: any): Ing[] {
  const out: Ing[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (fullMeal[`strIngredient${i}`] || "").trim();
    const measure = (fullMeal[`strMeasure${i}`] || "").trim();
    if (name) out.push({ name, measure: measure || null });
  }
  return out.length ? out : [{ name: "Unknown ingredient", measure: null }];
}

function buildSearchText(n: {
  title?: string | null;
  category?: string | null;
  cuisine?: string | null;
  tags?: string[] | null;
  ingredients?: Ing[] | null;
  instructions?: string | null;
}): string {
  const parts = [
    n.title ?? "",
    n.category ?? "",
    n.cuisine ?? "",
    ...(n.tags ?? []),
    ...(n.ingredients ?? []).map((x) => `${x.name} ${x.measure ?? ""}`),
    n.instructions ?? "",
  ];
  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 100_000);
}

/**
 * Fetches a sample set from TheMealDB and saves to your DB.
 * Limits are kept so you don't flood local dev. Tweak as needed.
 */
export async function fetchRecipesFromTheMealDB({
  maxCategories = 3,
  maxMealsPerCategory = 5,
  sleepMsBetweenCategories = 400,
}: {
  maxCategories?: number;
  maxMealsPerCategory?: number;
  sleepMsBetweenCategories?: number;
} = {}) {
  try {
    console.log("Starting to fetch recipes from TheMealDB...");

    // 1) Get all categories
    const categoriesRes = await fetch(`${BASE_URL}categories.php`);
    const categoriesData = await categoriesRes.json();
    const categories = categoriesData?.categories ?? [];
    if (!categories.length) throw new Error("No categories found");

    console.log(`Found ${categories.length} categories`);
    const limitedCategories = categories.slice(0, maxCategories);

    let processed = 0;
    let insertedOrUpdated = 0;
    let withImages = 0;

    for (const category of limitedCategories) {
      const categoryName = category.strCategory;
      console.log(`Fetching category: ${categoryName}...`);

      try {
        // 2) Meals by category (id, name, thumb)
        const filterRes = await fetch(`${BASE_URL}filter.php?c=${encodeURIComponent(categoryName)}`);
        const filterData = await filterRes.json();
        const meals = filterData?.meals ?? [];
        console.log(`Found ${meals.length} meals in ${categoryName}`);

        const limitedMeals = meals.slice(0, maxMealsPerCategory);

        for (const meal of limitedMeals) {
          try {
            // 3) Full meal details
            const lookupRes = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
            const lookupData = await lookupRes.json();
            const fullMeal = lookupData?.meals?.[0];

            if (!fullMeal || !fullMeal.strMeal || !fullMeal.strInstructions) {
              console.warn(`Skipping incomplete meal: ${meal.idMeal}`);
              continue;
            }

            // Normalize into your schema
            const ingredients = collectIngredients(fullMeal);
            const instructions = splitInstructionsToSteps(fullMeal.strInstructions);
            const tags =
              fullMeal.strTags && typeof fullMeal.strTags === "string"
                ? fullMeal.strTags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : null;

            const title = String(fullMeal.strMeal).trim();
            const imageUrl = fullMeal.strMealThumb || null;
            const cuisine = fullMeal.strArea || null;
            const cat = fullMeal.strCategory || categoryName || null;
            const youtubeUrl = fullMeal.strYoutube || null;
            const sourceUrl = fullMeal.strSource || null;

            const searchText = buildSearchText({
              title,
              category: cat,
              cuisine,
              tags,
              ingredients,
              instructions: fullMeal.strInstructions,
            });

            // Prefer upsert (if you added the helper); otherwise fall back to create
            let saved: any;
            if ((storage as any).upsertMealDbRecipe) {
              saved = await (storage as any).upsertMealDbRecipe({
                sourceId: String(fullMeal.idMeal),
                title,
                imageUrl,
                instructionsSteps: instructions,
                ingredients,
                cuisine,
                category: cat,
                tags,
                youtubeUrl,
                sourceUrl,
                searchText,
              });
            } else {
              // Fallback: insert minimal record compatible with your earlier schema
              const recipe = {
                id: crypto.randomUUID(),
                postId: null,
                // If your recipes table already has source/sourceId columns, include them:
                // source: "mealdb" as const,
                // sourceId: String(fullMeal.idMeal),
                title,
                imageUrl,
                ingredients, // normalized array of { name, measure }
                instructions, // string[]
                cookTime: null,
                servings: null,
                difficulty: null,
                calories: null,
                protein: null,
                carbs: null,
                fat: null,
                fiber: null,
                // Optional extended fields if present in your schema:
                category: cat,
                cuisine,
                tags,
                youtubeUrl,
                sourceUrl,
                searchText,
              } as any;

              saved = await storage.createRecipe(recipe);
            }

            processed++;
            if (imageUrl) withImages++;
            console.log(`✓ Saved: ${title} ${imageUrl ? "(with image)" : "(no image)"}`);
            if (saved) insertedOrUpdated++;
          } catch (mealError) {
            console.error(`Error processing meal ${meal.idMeal}:`, mealError);
            continue;
          }
        }

        // Be respectful to the API
        if (sleepMsBetweenCategories > 0) {
          await new Promise((r) => setTimeout(r, sleepMsBetweenCategories));
        }
      } catch (categoryError) {
        console.error(`Error processing category ${categoryName}:`, categoryError);
        continue;
      }
    }

    console.log(
      `\nProcessed ${processed} recipes | inserted/updated ${insertedOrUpdated} | with images ${withImages}`
    );

    if (!processed) {
      throw new Error("No valid recipes were processed");
    }

    return {
      success: true,
      processed,
      insertedOrUpdated,
      withImages,
    };
  } catch (error) {
    console.error("Error in fetchRecipesFromTheMealDB:", error);
    throw error;
  }
}
