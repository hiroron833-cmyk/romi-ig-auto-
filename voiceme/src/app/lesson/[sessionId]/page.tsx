"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, ScreenHeader, ScreenShell, SecondaryButton } from "@/components/ui";
import { getSession, attachLesson, markLessonCompleted } from "@/lib/store";
import { getLesson } from "@/lib/lessons/lessons";
import type { RecordingSession } from "@/types/domain";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LessonPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<RecordingSession | null | undefined>(undefined);
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const found = getSession(params.sessionId) ?? null;
    setSession(found);
    if (found) {
      attachLesson(found.id, found.before.recommendedLessonId);
      setRemaining(getLesson(found.before.recommendedLessonId).durationSec);
    }
  }, [params.sessionId]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  if (session === undefined) return null;
  if (session === null) {
    router.replace("/");
    return null;
  }

  const lesson = getLesson(session.before.recommendedLessonId);

  function startTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(lesson.durationSec);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function goRecordAgain() {
    markLessonCompleted(session!.id);
    router.push(`/record?mode=retry&sessionId=${session!.id}`);
  }

  return (
    <ScreenShell>
      <ScreenHeader title="今日の3分レッスン" subtitle={lesson.summary} />

      <Card className="text-center">
        <p className="text-sm font-medium text-ink-500">{lesson.title}</p>
        <p className="mt-3 text-4xl font-bold text-coral-600">
          {remaining !== null ? formatTime(remaining) : formatTime(lesson.durationSec)}
        </p>
        {remaining === 0 ? (
          <p className="mt-2 text-sm text-mint-500">お疲れさまでした！</p>
        ) : (
          <SecondaryButton className="mt-4" onClick={startTimer}>
            タイマーをスタート
          </SecondaryButton>
        )}
      </Card>

      <Card className="mt-4 space-y-3">
        <p className="text-sm font-semibold text-ink-900">練習ステップ</p>
        <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-ink-700">
          {lesson.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-semibold text-ink-900">練習文</p>
        <p className="mt-2 rounded-xl bg-cream-100 p-3 text-sm leading-relaxed text-ink-700">
          「{lesson.practiceSentence}」
        </p>
      </Card>

      <div className="mt-6">
        <PrimaryButton onClick={goRecordAgain}>練習できたら、もう一度録音する</PrimaryButton>
      </div>
    </ScreenShell>
  );
}
