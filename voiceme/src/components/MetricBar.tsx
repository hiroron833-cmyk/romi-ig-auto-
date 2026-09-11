import { METRIC_LABELS } from "@/lib/analysis/metricLabels";
import type { MetricKey } from "@/types/domain";

export function MetricBar({ metric, score }: { metric: MetricKey; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{METRIC_LABELS[metric]}</span>
        <span className="font-semibold text-coral-600">{score}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral-400 to-coral-500"
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
    </div>
  );
}

export function CompareMetricBar({
  metric,
  before,
  after,
}: {
  metric: MetricKey;
  before: number;
  after: number;
}) {
  const delta = after - before;
  const improved = metric === "speed" ? Math.abs(after - 45) < Math.abs(before - 45) : delta > 0;
  const deltaLabel = delta === 0 ? "変化なし" : `${delta > 0 ? "+" : ""}${delta}`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{METRIC_LABELS[metric]}</span>
        <span className={`font-semibold ${improved ? "text-mint-500" : "text-ink-500"}`}>
          {deltaLabel}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-xs text-ink-500">Before</span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div className="h-full rounded-full bg-ink-500/40" style={{ width: `${Math.max(4, before)}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-xs text-ink-500">After</span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mint-400 to-mint-500"
              style={{ width: `${Math.max(4, after)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
