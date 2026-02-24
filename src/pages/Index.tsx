import { useState, useMemo, useCallback } from "react";
import type { FeatureWindowsFile } from "@/types/sae";
import FileLoader from "@/components/FileLoader";
import FeatureSelector from "@/components/FeatureSelector";
import FeatureInfo from "@/components/FeatureInfo";
import ExampleList from "@/components/ExampleList";

const Index = () => {
  const [data, setData] = useState<FeatureWindowsFile | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "mean_act">("score");
  const [featureSortKey, setFeatureSortKey] = useState<"mention_rate" | "mean_when_active" | "mean_all">("mention_rate");

  const handleLoaded = useCallback((d: FeatureWindowsFile) => {
    setData(d);
    const ids = Object.keys(d.features).map(Number).sort((a, b) => a - b);
    if (ids.length > 0) setSelectedFeatureId(ids[0]);
  }, []);

  const selectedFeature = data && selectedFeatureId !== null
    ? data.features[String(selectedFeatureId)]
    : null;

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <FileLoader onLoaded={handleLoaded} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          SAE Viewer
        </h1>

        <FeatureSelector
          data={data}
          selectedId={selectedFeatureId}
          onSelect={setSelectedFeatureId}
          sortKey={featureSortKey}
          onSortKeyChange={setFeatureSortKey}
        />

        {selectedFeature && (
          <div className="border-t border-border pt-3">
            <FeatureInfo meta={data.meta} feature={selectedFeature} />
          </div>
        )}

        <div className="border-t border-border pt-3 flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sort by
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => setSortBy("score")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortBy === "score"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              Score
            </button>
            <button
              onClick={() => setSortBy("mean_act")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortBy === "mean_act"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              Mean Act
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col p-4 min-w-0">
        {selectedFeature ? (
          <>
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="text-base font-semibold font-mono text-foreground">
                Feature {selectedFeature.feature_id}
              </h2>
              <span className="text-xs text-muted-foreground">
                {selectedFeature.num_examples} examples
              </span>
            </div>
            <ExampleList
              examples={selectedFeature.examples}
              meta={data.meta}
              sortBy={sortBy}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select a feature from the sidebar.</p>
        )}
      </main>
    </div>
  );
};

export default Index;
