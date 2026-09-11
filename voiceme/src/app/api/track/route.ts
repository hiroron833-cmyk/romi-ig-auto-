import { NextResponse } from "next/server";
import type { AnalyticsEvent } from "@/types/domain";

const VALID_EVENTS: AnalyticsEvent[] = [
  "onboarding_complete",
  "record_complete",
  "analysis_complete",
  "re_record",
  "lesson_start",
  "lesson_complete",
  "compare_view",
  "product_click",
];

// MVP stub: the app tracks KPIs on-device (see src/lib/store#track).
// This route exists so the client seam is already in place for when
// events should be aggregated server-side instead.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const event = body?.event as AnalyticsEvent | undefined;
  if (!event || !VALID_EVENTS.includes(event)) {
    return NextResponse.json({ ok: false, error: "invalid event" }, { status: 400 });
  }
  console.info("[voiceme:track]", event, body?.meta ?? {});
  return NextResponse.json({ ok: true });
}
