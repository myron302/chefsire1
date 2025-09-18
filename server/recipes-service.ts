// server/recipes-service.ts

// TheMealDB base
const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

// Shape the rest of the app expects
export type NormalizedMeal = {
  sourceId: string; // idMeal
  title: string; // strMeal
  imageUrl: string | null; // strMealThumb
  category: string | null; // strCategory
  cuisine: string | null; // strArea
  tags: string[] | null; // strTags -> array
  instructionsSteps: string[]; // split steps
  ingredients: { name: string; measure: string | null }[]; // 1..20 pairs
  youtubeUrl: string | null; // strYoutube
  sourceUrl: string | null; // strSource
  searchText: string; // for DB text search
};

// Normalize a single TheMealDB meal object into our shape
function normalizeMeal(m: any): NormalizedMeal {
  const ingredients: { name: string; measure: string | null }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (m[`strIngredient${i}`] || "").trim();
    const measureRaw = (m[`strMeasure${i}`] || "").trim();
    if (name) {
      ingredients.push({
        name,
        measure: measureRaw || null,
      });
    }
  }

  // Instructions -> steps
  let steps: string[] = [];
  const instr = (m.strInstructions || "").trim();
  if (instr) {
    steps = instr
      .split(/\r?\n+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  const tags = (m.strTags || "")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);
  const tagsArr = tags.length ? tags : null;

  const parts = [
    m.strMeal,
    m.strCategory,
    m.strArea,
    ...ingredients.map((i: any) => i.name),
    ...(tagsArr ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    sourceId: String(m.idMeal),
    title: String(m.strMeal || "").trim(),
    imageUrl: m.strMealThumb ? String(m.strMealThumb) : null,
    category: m.strCategory ? String(m.strCategory) : null,
    cuisine: m.strArea ? String(m.strArea) : null,
    tags: tagsArr,
    instructionsSteps: steps.length ? steps : ["No instructions available."],
    ingredients: ingredients.length
      ? ingredients
      : [{ name: "Unknown ingredient", measure: null }],
    youtubeUrl: m.strYoutube ? String(m.strYoutube) : null,
    sourceUrl: m.strSource ? String(m.strSource) : null,
    searchText: parts,
  };
}

/**
 * Search meals by name (TheMealDB: search.php?s=)
 * Returns a list of normalized, lightweight meals (sufficient for browse/import flows).
 */
export async function searchMealsByName(q: string): Promise<NormalizedMeal[]> {
  const url = `${BASE_URL}search.php?s=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MealDB search failed: ${res.status}`);
  const data = await res.json();
  const meals = Array.isArray(data?.meals) ? data.meals : [];
  return meals.map(normalizeMeal);
}

/**
 * Lookup full meal by id (TheMealDB: lookup.php?i=)
 * Returns a single normalized meal or null if not found.
 */
export async function lookupMealById(idMeal: string): Promise<NormalizedMeal | null> {
  const url = `${BASE_URL}lookup.php?i=${encodeURIComponent(idMeal)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MealDB lookup failed: ${res.status}`);
  const data = await res.json();
  const m = data?.meals?.[0];
  return m ? normalizeMeal(m) : null;
}
