import type { AffiliateProduct, ConcernKey, GoalKey } from "@/types/domain";
import raw from "./products.json";

const PRODUCTS = raw as AffiliateProduct[];

// Phase 2 will replace this with a call to an ASP API / product DB. The
// dummy JSON keeps the same AffiliateProduct shape so callers don't change.
export function getRecommendedProducts(
  concerns: ConcernKey[],
  goals: GoalKey[],
  limit = 3,
): AffiliateProduct[] {
  const scored = PRODUCTS.map((product) => {
    const concernMatches = product.matchesConcerns.filter((c) => concerns.includes(c)).length;
    const goalMatches = product.matchesGoals.filter((g) => goals.includes(g)).length;
    return { product, score: concernMatches * 2 + goalMatches };
  }).sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0).map((s) => s.product);
  if (top.length >= limit) return top.slice(0, limit);
  const rest = PRODUCTS.filter((p) => !top.includes(p));
  return [...top, ...rest].slice(0, limit);
}
