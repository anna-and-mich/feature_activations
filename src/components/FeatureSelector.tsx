import { useState, useMemo } from "react";
import type { FeatureWindowsFile } from "@/types/sae";

type SortKey = "mention_rate" | "mean_when_active" | "mean_all";

interface FeatureSelectorProps {
  data: FeatureWindowsFile;
  selectedId: number | null;
  onSelect: (id: number) => void;
  sortKey: SortKey;
  onSortKeyChange: (k: SortKey) => void;
}

export default function FeatureSelector({
  data,
  selectedId,
  onSelect,
  sortKey,
  onSortKeyChange,
}: FeatureSelectorProps) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const entries = Object.values(data.features);
    // Get the stat from the first example of each feature
    entries.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return bVal - aVal;
    });
    return entries;
  }, [data.features, sortKey]);

  const filtered = useMemo(() => {
    if (!query) return sorted;
    return sorted.filter((e) => String(e.feature_id).includes(query));
  }, [sorted, query]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Feature ID
      </label>
      <div className="flex gap-1 mb-1">
        <button
          onClick={() => onSortKeyChange("mention_rate")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            sortKey === "mention_rate"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          Mention Rate
        </button>
        <button
          onClick={() => onSortKeyChange("mean_all")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            sortKey === "mean_all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          Mean Activation
        </button>
        <button
          onClick={() => onSortKeyChange("mean_when_active")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            sortKey === "mean_when_active"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          Mean when Active
        </button>
      </div>
      <input
        type="text"
        placeholder="Search feature…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-9 px-3 text-sm font-mono bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="max-h-48 overflow-y-auto border border-border rounded-md bg-card">
        {filtered.length === 0 && (
          <p className="p-2 text-xs text-muted-foreground">No matches</p>
        )}
        {filtered.map((entry) => {
          const mr = entry.mention_rate;
          const nnz = entry.nnz_count;
          const mwa = entry.mean_when_active;
          const ma = entry.mean_all;
          return (
            <button
              key={entry.feature_id}
              onClick={() => onSelect(entry.feature_id)}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-secondary transition-colors ${
                entry.feature_id === selectedId
                  ? "bg-secondary font-semibold"
                  : ""
              }`}
            >
              <span className="font-mono">{entry.feature_id}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                mr: {mr != null ? (mr * 100).toFixed(2) + "%" : "–"}
                {" · "}
                ma: {ma.toFixed(4) ?? "–"}
                {" · "}
                mwa: {mwa.toFixed(4) ?? "–"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
