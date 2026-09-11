"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenShell } from "@/components/ui";
import { useRecordingContext } from "@/lib/store/RecordingContext";
import { analyzeAudioBlob } from "@/lib/analysis/analyze";
import { attachAfterAnalysis, createSession } from "@/lib/store";

const MESSAGES = [
  "声の特徴を聞き取っています...",
  "話す速度とリズムを確認しています...",
  "声の強みを探しています...",
  "今日のレッスンを選んでいます...",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const { pending, setPending } = useRecordingContext();
  const [messageIndex, setMessageIndex] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // `started` also guards against the redirect-below firing a second time
    // once analysis finishes and clears `pending` back to null.
    if (started.current) return;
    if (!pending) {
      router.replace("/record?mode=new");
      return;
    }
    started.current = true;

    (async () => {
      const startedAt = Date.now();
      const result = await analyzeAudioBlob(pending.blob);
      // Keep the "analyzing" moment feeling substantial even on a fast device.
      const elapsed = Date.now() - startedAt;
      if (elapsed < 2200) await new Promise((r) => setTimeout(r, 2200 - elapsed));

      if (pending.mode === "new") {
        const session = createSession(result);
        router.replace(`/result/${session.id}`);
      } else if (pending.sessionId) {
        attachAfterAnalysis(pending.sessionId, result);
        router.replace(`/compare/${pending.sessionId}`);
      }
      setPending(null);
    })();
  }, [pending, router, setPending]);

  return (
    <ScreenShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-coral-200 opacity-60" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-coral-500 text-3xl text-white">
            🤖
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold text-ink-900">AI分析中...</p>
          <p className="mt-2 text-sm text-ink-500">{MESSAGES[messageIndex]}</p>
        </div>
      </div>
    </ScreenShell>
  );
}
