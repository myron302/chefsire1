// client/src/pages/RecipesBrowse.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchRecipes, type BrowseItem } from "../lib/api";

export default function RecipesBrowse() {
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recipes", query],
    queryFn: () => searchRecipes(query),
  });

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    refetch();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Browse Recipes</h1>

      <form onSubmit={onSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {isLoading && <p>Loading recipes…</p>}
      {isError && <p className="text-red-500">Failed to load recipes.</p>}

      {data && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item) => (
            <RecipeCard key={(item as any).id ?? (item as any).sourceId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ item }: { item: BrowseItem }) {
  const img = item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div className="border rounded shadow hover:shadow-lg overflow-hidden">
      <img src={img} alt={item.title} className="w-full h-40 object-cover" />
      <div className="p-2">
        <h3 className="font-medium text-sm">{item.title}</h3>
        {item.category && (
          <p className="text-xs text-gray-500">{item.category}</p>
        )}
      </div>
    </div>
  );
}
