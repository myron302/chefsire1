// client/src/lib/api.ts

export type BrowseItem =
  | {
      source: "mealdb";
      sourceId: string;
      title: string;
      imageUrl: string | null;
      category: string | null;
      cuisine: string | null;
      tags: string[] | null;
    }
  | {
      source: "local";
      id: string;
      title: string;
      imageUrl: string | null;
      category: string | null;
      cuisine: string | null;
      tags: string[] | null;
    };

export type BrowseResult = {
  items: BrowseItem[];
  total: number;
  limit: number;
  offset: number;
};

const API = import.meta.env.VITE_API_URL || ""; // leave empty if same origin

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail || data?.error || res.statusText;
    } catch {
      detail = res.statusText;
    }
    throw new Error(`${res.status} ${detail}`);
  }
  return (await res.json()) as T;
}

export async function apiGet<T>(path: string) {
  const res = await fetch(`${API}${path}`);
  return handle<T>(res);
}

export async function apiPost<T>(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}

// ----- Recipes -----

export function searchRecipes(q: string, limit = 24, offset = 0) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  sp.set("limit", String(limit));
  sp.set("offset", String(offset));
  return apiGet<BrowseResult>(`/api/recipes/search?${sp.toString()}`);
}

export function importMealById(idMeal: string) {
  return apiPost(`/api/recipes/fetch`, { idMeal });
}

export function importMealByName(name: string) {
  return apiPost(`/api/recipes/fetch`, { name });
}

export function getLocalRecipe(id: string) {
  return apiGet(`/api/recipes/${id}`);
}

// ----- Substitutions (optional endpoint; wire later if desired) -----

export type SubSuggestion = {
  substitute: string;
  reason: string;
  ratio: string;
  impact: string;
};

export type SubsPayload = {
  ingredient: string;
  suggestions: SubSuggestion[];
  note?: string;
};

export function getSubstitutions(ingredient: string) {
  return apiGet<SubsPayload>(`/api/ingredients/${encodeURIComponent(ingredient)}/substitutions`);
}
