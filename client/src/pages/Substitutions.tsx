// client/src/pages/Substitutions.tsx
import { useState } from "react";
import { getSubstitutions, type SubsPayload } from "../lib/api";

export default function Substitutions() {
  const [ingredient, setIngredient] = useState("");
  const [data, setData] = useState<SubsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ingredient.trim()) return;
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const res = await getSubstitutions(ingredient.trim());
      setData(res);
    } catch (e: any) {
      setErr(e?.message ?? "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Ingredient Substitutions</h1>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="e.g., butter, egg, sour cream…"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
        />
        <button className="rounded bg-black text-white px-4 py-2" type="submit" disabled={loading}>
          {loading ? "Thinking…" : "Find Subs"}
        </button>
      </form>

      {err && <div className="text-red-600 mt-3">Error: {err}</div>}

      {data && (
        <div className="mt-5">
          <div className="text-sm text-gray-600 mb-2">
            Ingredient: <strong>{data.ingredient}</strong>
          </div>
          <ul className="space-y-3">
            {data.suggestions.map((s, i) => (
              <li key={i} className="border rounded p-3 bg-white">
                <div className="font-medium">{s.substitute}</div>
                <div className="text-sm text-gray-700">{s.reason}</div>
                <div className="text-xs text-gray-500 mt-1">Ratio: {s.ratio}</div>
                <div className="text-xs text-gray-500">Impact: {s.impact}</div>
              </li>
            ))}
          </ul>
          {data.note && <div className="text-xs text-gray-500 mt-3">{data.note}</div>}
        </div>
      )}
    </div>
  );
}
