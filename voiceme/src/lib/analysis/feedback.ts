import type { LessonId, MetricKey, MetricScores } from "@/types/domain";
import { METRIC_TO_LESSON } from "@/lib/lessons/lessons";
import { bellScore, clamp, scaleLinear } from "./util";

// Metrics used to pick "strengths" / "focus points". `listenability` is a
// composite score, so it is shown to the user but not chosen as a focus.
const PRIMARY_METRICS: MetricKey[] = [
  "speed",
  "volume",
  "clarity",
  "articulation",
  "pause",
  "intonation",
  "stability",
];

// "Goodness" re-expresses each raw score on a common 0-100 scale where
// higher always means "going well", even for metrics like speed/volume
// whose raw score is a plain magnitude rather than a quality judgement.
function goodness(metric: MetricKey, score: number): number {
  switch (metric) {
    case "speed":
      return bellScore(score, 45, 28, 10);
    case "volume":
      return clamp(scaleLinear(score, 20, 55, 25, 95), 25, 95);
    default:
      return score;
  }
}

const STRENGTH_TEMPLATES: Record<MetricKey, string> = {
  speed: "落ち着いたテンポで話せていて、聞き手が内容を追いやすい印象です。",
  volume: "声がしっかりと届いていて、安心して聞ける音量です。",
  clarity: "声の輪郭がはっきりしていて、聞き取りやすい話し方です。",
  articulation: "一つひとつの言葉がクリアに発音されています。",
  pause: "間の取り方が自然で、話の区切りがわかりやすいです。",
  intonation: "声に自然な抑揚があり、表情豊かに聞こえます。",
  stability: "声のトーンが安定していて、落ち着いた印象を与えます。",
  listenability: "全体として聞き取りやすく、耳に心地よい話し方です。",
};

const IMPROVEMENT_TEMPLATES: Record<MetricKey, string> = {
  speed: "一方で、話すスピードが少し速くなりやすいため、語尾が弱く聞こえることがあります。",
  volume: "一方で、声のボリュームが控えめになりやすい場面があるようです。",
  clarity: "一方で、言葉がやや聞き取りにくく感じられる瞬間があるようです。",
  articulation: "一方で、口の動きが小さくなり、発音がぼやけやすい瞬間があるようです。",
  pause: "一方で、間の取り方にばらつきがあり、区切りが伝わりにくい場面があるようです。",
  intonation: "一方で、声のトーンが一定になりやすく、単調に聞こえることがあるようです。",
  stability: "一方で、声のトーンにゆらぎが出やすい瞬間があるようです。",
  listenability: "一方で、聞き取りやすさがもう一歩伸びる余地がありそうです。",
};

const TODAY_POINT_TEMPLATES: Record<LessonId, string> = {
  slow_down: "今日は最後の一言を少しゆっくり話す練習をしてみましょう。",
  opening_volume: "今日は話し始めの第一声をしっかり出す練習をしてみましょう。",
  emphasize_keywords: "今日は伝えたいキーワードを強調する練習をしてみましょう。",
  hold_endings: "今日は語尾まで声を残す練習をしてみましょう。",
  articulation_drill: "今日は口を大きく動かして、はっきり発音する練習をしてみましょう。",
  pause_control: "今日は句読点で軽く間を取る練習をしてみましょう。",
  pitch_variation: "今日は声に高低の変化をつける練習をしてみましょう。",
  stability_breathing: "今日は腹式呼吸で声を安定させる練習をしてみましょう。",
};

export interface GeneratedFeedback {
  strengths: string[];
  improvements: string[];
  todayPoint: string;
  recommendedLessonId: LessonId;
}

export function generateFeedback(scores: MetricScores): GeneratedFeedback {
  const ranked = [...PRIMARY_METRICS].sort(
    (a, b) => goodness(b, scores[b]) - goodness(a, scores[a]),
  );

  const strengthMetrics = ranked.slice(0, 2);
  const focusMetric = ranked[ranked.length - 1];

  const strengths = strengthMetrics.map((metric) => STRENGTH_TEMPLATES[metric]);
  const improvements = [IMPROVEMENT_TEMPLATES[focusMetric]];
  const recommendedLessonId = METRIC_TO_LESSON[focusMetric];
  const todayPoint = TODAY_POINT_TEMPLATES[recommendedLessonId];

  return { strengths, improvements, todayPoint, recommendedLessonId };
}
