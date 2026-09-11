"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ScreenHeader, ScreenShell } from "@/components/ui";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useRecordingContext } from "@/lib/store/RecordingContext";

function RecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPending } = useRecordingContext();

  const mode = searchParams.get("mode") === "retry" ? "retry" : "new";
  const sessionId = searchParams.get("sessionId") ?? undefined;

  function handleDiagnose(blob: Blob) {
    setPending({ blob, mode, sessionId });
    router.push("/analyzing");
  }

  return (
    <ScreenShell>
      <ScreenHeader
        title={mode === "retry" ? "もう一度録音しましょう" : "声を録音しましょう"}
        subtitle={mode === "retry" ? "レッスンで練習した内容を意識して話してみましょう" : undefined}
        step={mode === "new" ? 3 : undefined}
        totalSteps={mode === "new" ? 3 : undefined}
      />
      <VoiceRecorder onDiagnose={handleDiagnose} maxSeconds={30} />
    </ScreenShell>
  );
}

export default function RecordPage() {
  return (
    <Suspense>
      <RecordContent />
    </Suspense>
  );
}
