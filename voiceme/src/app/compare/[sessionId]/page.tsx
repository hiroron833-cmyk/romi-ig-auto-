"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, ScreenHeader, ScreenShell } from "@/components/ui";
import { CompareMetricBar } from "@/components/MetricBar";
import { getSession, track } from "@/lib/store";
import type { RecordingSession } from "@/types/domain";
import { METRIC_KEYS } from "@/types/domain";

function buildHeadline(session: RecordingSession): string {
  const before = session.before.scores.listenability;
  const after = session.after!.scores.listenability;
  const delta = after - before;
  if (delta > 0) return `前回より聞き取りやすさが${delta}ポイント上がりました！`;
  if (delta === 0) return "聞き取りやすさは前回と同じレベルをキープできています。";
  return "録音を重ねるたびに、自分の声への理解が深まっています。";
}

export default function ComparePage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<RecordingSession | null | undefined>(undefined);

  useEffect(() => {
    const found = getSession(params.sessionId) ?? null;
    setSession(found);
    if (found?.after) track("compare_view", { sessionId: found.id });
  }, [params.sessionId]);

  if (session === undefined) return null;
  if (session === null || !session.after) {
    router.replace("/");
    return null;
  }

  const after = session.after;

  return (
    <ScreenShell>
      <ScreenHeader title="Before / After" subtitle="自分の耳で、変化を確かめてみましょう" />

      <Card className="border border-mint-100 bg-mint-100/40 text-center">
        <p className="text-lg font-semibold text-ink-900">{buildHeadline(session)}</p>
      </Card>

      <Card className="mt-4 space-y-4">
        {METRIC_KEYS.map((metric) => (
          <CompareMetricBar
            key={metric}
            metric={metric}
            before={session.before.scores[metric]}
            after={after.scores[metric]}
          />
        ))}
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-semibold text-ink-900">🎧 聞き比べてみましょう</p>
        <p className="mt-2 text-sm text-ink-500">
          もう一度録音を聞き返して、自分の声の変化を耳でも確認してみてください。
        </p>
      </Card>

      <div className="mt-6 space-y-3">
        <PrimaryButton onClick={() => router.push("/")}>ホームへ</PrimaryButton>
      </div>
    </ScreenShell>
  );
}
