import type { ConcernKey } from "@/types/domain";

export const CONCERNS: { key: ConcernKey; label: string; emoji: string }[] = [
  { key: "small_voice", label: "声が小さい", emoji: "🔈" },
  { key: "muffled", label: "声がこもる", emoji: "🌫️" },
  { key: "fast_talking", label: "早口になる", emoji: "⚡" },
  { key: "poor_articulation", label: "滑舌が悪い", emoji: "🗣️" },
  { key: "flat_intonation", label: "抑揚がない", emoji: "➖" },
  { key: "weak_ending", label: "語尾が弱い", emoji: "🍃" },
  { key: "nervous_in_public", label: "人前だと緊張する", emoji: "😥" },
  { key: "dislike_own_voice", label: "自分の声が好きではない", emoji: "💭" },
  { key: "lack_confidence", label: "話すことに自信がない", emoji: "🙈" },
  { key: "often_asked_to_repeat", label: "聞き返されることが多い", emoji: "❓" },
];
