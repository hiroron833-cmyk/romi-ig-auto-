"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, ScreenHeader, ScreenShell } from "@/components/ui";
import { MetricBar } from "@/components/MetricBar";
import { ScoreRing } from "@/components/ScoreRing";
import { getSession } from "@/lib/store";
import type { RecordingSession } from "@/types/domain";
import { METRIC_KEYS } from "@/types/domain";

export default function ResultPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<RecordingSession | null | undefined>(undefined);

  useEffect(() => {
    setSession(getSession(params.sessionId) ?? null);
  }, [params.sessionId]);

  if (session === undefined) return null;
  if (session === null) {
    router.replace("/");
    return null;
  }

  const { before } = session;
  const otherMetrics = METRIC_KEYS.filter((m) => m !== "listenability");

  return (
    <ScreenShell>
      <ScreenHeader title="声カルテ" subtitle="あなたの声の今を、そのまま受け止めましょう" />

      <div className="flex flex-col items-center py-2">
        <ScoreRing score={before.scores.listenability} label="聞き取りやすさスコア" />
      </div>

      <Card className="mt-6 space-y-4">
        {otherMetrics.map((metric) => (
          <MetricBar key={metric} metric={metric} score={before.scores[metric]} />
        ))}
      </Card>

      <Card className="mt-4 space-y-3">
        <SectionLabel emoji="💛" text="あなたの強み" />
        {before.strengths.map((s, i) => (
          <p key={i} className="text-sm leading-relaxed text-ink-700">
            {s}
          </p>
        ))}
      </Card>

      <Card className="mt-4 space-y-3">
        <SectionLabel emoji="🌱" text="改善するともっと良くなるところ" />
        {before.improvements.map((s, i) => (
          <p key={i} className="text-sm leading-relaxed text-ink-700">
            {s}
          </p>
        ))}
      </Card>

      <Card className="mt-4 border border-coral-100 bg-coral-50">
        <SectionLabel emoji="✨" text="今日のポイント" />
        <p className="mt-2 text-sm leading-relaxed text-ink-700">{before.todayPoint}</p>
      </Card>

      <div className="mt-6">
        <PrimaryButton onClick={() => router.push(`/lesson/${session.id}`)}>
          今日の3分レッスンへ
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}

function SectionLabel({ emoji, text }: { emoji: string; text: string }) {
  return (
    <p className="text-sm font-semibold text-ink-900">
      {emoji} {text}
    </p>
  );
}
