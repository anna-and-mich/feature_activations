import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import type { FeatureExample, Meta } from "@/types/sae";
import TokenSpan from "./TokenSpan";

interface ExampleListProps {
  examples: FeatureExample[];
  meta: Meta;
  sortBy: "score" | "mean_act";
}

function ExampleRow({ example, meta }: { example: FeatureExample; meta: Meta }) {
  const threshold = meta.activation_threshold;

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground mb-2">
        <span><strong className="text-foreground">score</strong> {example.score.toFixed(2)}</span>
        <span><strong className="text-foreground">peak</strong> {example.peak_activation.toFixed(2)}</span>
        <span><strong className="text-foreground">mean</strong> {example.highlight.mean_act_in_highlight.toFixed(2)}</span>
        <span><strong className="text-foreground">max</strong> {example.highlight.max_act_in_highlight.toFixed(2)}</span>
        {example.problem_id && (
          <span><strong className="text-foreground">problem</strong> {example.problem_id}</span>
        )}
        {example.turn_index !== null && (
          <span><strong className="text-foreground">turn</strong> {example.turn_index}</span>
        )}
        {example.solution_status && (
          <span><strong className="text-foreground">status</strong> {example.solution_status}</span>
        )}
        {example.attempt_answer != null && (
          <span><strong className="text-foreground">answer</strong> {String(example.attempt_answer)}</span>
        )}
        {example.reference_answer != null && (
          <span><strong className="text-foreground">ref</strong> {String(example.reference_answer)}</span>
        )}
      </div>

      <div className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-6">
        {example.tokens.map((tok) => (
          <TokenSpan
            key={tok.i}
            token={tok}
            peakActivation={example.peak_activation}
            threshold={threshold}
          />
        ))}
      </div>
    </div>
  );
}

const BATCH_SIZE = 20;

export default function ExampleList({ examples, meta, sortBy }: ExampleListProps) {
  const sorted = useMemo(() => {
    const arr = [...examples];
    if (sortBy === "mean_act") {
      arr.sort((a, b) => b.highlight.mean_act_in_highlight - a.highlight.mean_act_in_highlight);
    } else {
      arr.sort((a, b) => b.score - a.score);
    }
    return arr;
  }, [examples, sortBy]);

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when examples change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [sorted]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, sorted.length));
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sorted.length]);

  const visible = sorted.slice(0, visibleCount);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-card rounded-md border border-border">
      {visible.map((ex, i) => (
        <ExampleRow key={`${ex.feature_id}-${i}`} example={ex} meta={meta} />
      ))}
      {visibleCount < sorted.length && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center text-xs text-muted-foreground">
          Loading more…
        </div>
      )}
    </div>
  );
}
