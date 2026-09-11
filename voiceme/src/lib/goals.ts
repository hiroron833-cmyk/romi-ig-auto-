import type { GoalKey } from "@/types/domain";

export const GOALS: { key: GoalKey; label: string; emoji: string }[] = [
  { key: "bright_friendly", label: "明るく親しみやすい", emoji: "🌞" },
  { key: "elegant_intelligent", label: "上品で知的", emoji: "🎀" },
  { key: "easy_to_hear", label: "聞き取りやすい", emoji: "👂" },
  { key: "trustworthy", label: "信頼感がある", emoji: "🤝" },
  { key: "warm_reassuring", label: "優しく安心感がある", emoji: "🍵" },
  { key: "persuasive", label: "説得力がある", emoji: "💡" },
  { key: "customer_service", label: "接客向け", emoji: "🛎️" },
  { key: "presentation", label: "プレゼン向け", emoji: "📊" },
  { key: "interview", label: "面接向け", emoji: "💼" },
  { key: "voice_broadcast", label: "音声配信向け", emoji: "🎙️" },
];
