export type ConcernKey =
  | "small_voice"
  | "muffled"
  | "fast_talking"
  | "poor_articulation"
  | "flat_intonation"
  | "weak_ending"
  | "nervous_in_public"
  | "dislike_own_voice"
  | "lack_confidence"
  | "often_asked_to_repeat";

export type GoalKey =
  | "bright_friendly"
  | "elegant_intelligent"
  | "easy_to_hear"
  | "trustworthy"
  | "warm_reassuring"
  | "persuasive"
  | "customer_service"
  | "presentation"
  | "interview"
  | "voice_broadcast";

export const METRIC_KEYS = [
  "speed",
  "volume",
  "clarity",
  "articulation",
  "pause",
  "intonation",
  "stability",
  "listenability",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

export type MetricScores = Record<MetricKey, number>;

export type LessonId =
  | "slow_down"
  | "opening_volume"
  | "emphasize_keywords"
  | "hold_endings"
  | "articulation_drill"
  | "pause_control"
  | "pitch_variation"
  | "stability_breathing";

export interface Lesson {
  id: LessonId;
  targetMetric: MetricKey;
  title: string;
  durationSec: number;
  summary: string;
  steps: string[];
  practiceSentence: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  durationSec: number;
  scores: MetricScores;
  strengths: string[];
  improvements: string[];
  todayPoint: string;
  recommendedLessonId: LessonId;
}

export interface RecordingSession {
  id: string;
  createdAt: string;
  concerns: ConcernKey[];
  goals: GoalKey[];
  before: AnalysisResult;
  after?: AnalysisResult;
  lessonId?: LessonId;
  lessonCompletedAt?: string;
}

export interface AffiliateProduct {
  id: string;
  category: string;
  name: string;
  description: string;
  imageEmoji: string;
  price: string;
  affiliateUrl: string;
  matchesConcerns: ConcernKey[];
  matchesGoals: GoalKey[];
}

export type AnalyticsEvent =
  | "onboarding_complete"
  | "record_complete"
  | "analysis_complete"
  | "re_record"
  | "lesson_start"
  | "lesson_complete"
  | "compare_view"
  | "product_click";
