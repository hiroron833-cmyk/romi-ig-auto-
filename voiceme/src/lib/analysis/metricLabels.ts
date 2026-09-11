import type { MetricKey } from "@/types/domain";

export const METRIC_LABELS: Record<MetricKey, string> = {
  speed: "話す速度",
  volume: "音量",
  clarity: "明瞭度",
  articulation: "滑舌",
  pause: "間の取り方",
  intonation: "抑揚",
  stability: "声の安定性",
  listenability: "聞き取りやすさ",
};
