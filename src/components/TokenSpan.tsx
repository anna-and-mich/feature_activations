import { useState } from "react";
import type { TokenRecord } from "@/types/sae";

interface TokenSpanProps {
  token: TokenRecord;
  peakActivation: number;
  threshold: number;
}

export default function TokenSpan({ token, peakActivation, threshold }: TokenSpanProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isActive =
    threshold > 0 ? token.act > threshold : token.act !== 0;

  const alpha = isActive
    ? Math.min(Math.max(token.act / (peakActivation || 1), 0.15), 0.85)
    : 0;

  const style: React.CSSProperties = isActive
    ? { backgroundColor: `hsla(145, 70%, 42%, ${alpha})` }
    : {};

  return (
    <span
      className="relative cursor-default rounded-[2px]"
      style={style}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {token.token_text}
      {showTooltip && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-foreground text-primary-foreground text-[10px] font-mono whitespace-nowrap pointer-events-none shadow-lg">
          i={token.i} id={token.token_id} act={token.act.toFixed(6)}{" "}
          {isActive ? "✓" : "–"}
        </span>
      )}
    </span>
  );
}
