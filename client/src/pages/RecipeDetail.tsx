// client/src/pages/RecipeDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { getLocalRecipe, importMealById } from "../lib/api";

type LocalRecipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  ingredients: { name: string; measure: string | null }[];
  instructions: string[];
  category?: string | null;
  cuisine?: string | null;
  tags?: string[] | null;
  youtubeUrl?: string | null;
  sourceUrl?: string | null;
};

export default function RecipeDetail() {
  const { mode, id } = useMemo(() => {
    // Expect paths like: /recipes/local/<id> OR /recipes/mealdb/<idMeal>
    const parts = window.location.pathname.split("/").filter(Boolean);
    // ["recipes","local","<id>"] or ["recipes","mealdb","<idMeal>"]
    const mode = parts[1] as "local" | "mealdb" | undefined;
    const id = parts[2];
    return { mode, id };
  }, []);

  const [data, setData] = useState<LocalRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!mode || !id) {
          setErr("Invalid URL");
          setLoading(false);
          return;
        }
        setLoading(true);
        setErr(null);

        if (mode === "local") {
          const row = await getLocalRecipe(id);
          setData(row as LocalRecipe);
        } else if (mode === "mealdb") {
          // Import then load local copy
          const saved = await importMealById(id);
          const row = await getLocalRecipe(saved.id);
          setData(row as LocalRecipe);
          // Optionally update URL to the local id (not required)
          window.history.replaceState(null, "", `/recipes/local/${saved.id}`);
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <a href="/recipes" className="text-sm text-blue-600">&larr; Back to browse</a>

      <h1 className="text-2xl font-semibold mt-2">{data.title}</h1>
      <div className="text-sm text-gray-500 mt-1">
        {(data.category ?? "—")} · {(data.cuisine ?? "—")}
      </div>

      <img
        src={
          data.imageUrl ||
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23eee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif'>No Image</text></svg>"
        }
        alt={data.title}
        className="w-full h-72 object-cover rounded mt-4"
      />

      {data.tags && data.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded">
              #{t}
            </span>
          ))}
        </div>
      )}

      <section className="mt-6">
        <h2 className="font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc pl-5 space-y-1">
          {data.ingredients.map((ing, i) => (
            <li key={`${ing.name}-${i}`}>
              {ing.name}
              {ing.measure ? ` — ${ing.measure}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          {data.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {(data.youtubeUrl || data.sourceUrl) && (
        <section className="mt-6">
          <h2 className="font-semibold mb-2">References</h2>
          <div className="space-x-3">
            {data.youtubeUrl && (
              <a className="text-blue-600 underline" href={data.youtubeUrl} target="_blank" rel="noreferrer">
                YouTube
              </a>
            )}
            {data.sourceUrl && (
              <a className="text-blue-600 underline" href={data.sourceUrl} target="_blank" rel="noreferrer">
                Source
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
