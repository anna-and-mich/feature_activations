import type { Meta, FeatureEntry } from "@/types/sae";

interface FeatureInfoProps {
  meta: Meta;
  feature: FeatureEntry;
}

export default function FeatureInfo({ meta, feature }: FeatureInfoProps) {
  const items = [
    ["Feature ID", String(feature.feature_id)],
    ["Examples", String(feature.num_examples)],
    ["Model", meta.model_path],
    ["Layer", String(meta.layer)],
    ["SAE", `${meta.sae_release} / ${meta.sae_id}`],
    ["Threshold", String(meta.activation_threshold)],
    ["Window", `${meta.max_window_width} (buf: ${meta.buffer_tokens})`],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <span className="text-info-label font-medium">{label}</span>
          <span className="font-mono text-foreground truncate" title={value}>{value}</span>
        </div>
      ))}
    </div>
  );
}
