"use client";

import { useRouter } from "next/navigation";
import { PrimaryButton, ScreenShell } from "@/components/ui";

export default function WelcomePage() {
  const router = useRouter();
  return (
    <ScreenShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-coral-100 text-5xl">
          🎙️
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Voice Me</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 text-balance">
            「声を変える」のではなく、
            <br />
            自分の声を好きになり、話すことに自信を持てるように。
          </p>
        </div>
        <div className="w-full space-y-3 rounded-xl2 bg-white p-5 text-left shadow-card">
          <StepRow emoji="🎤" text="30秒、普段どおりに話す" />
          <StepRow emoji="💬" text="AIコーチから前向きなフィードバック" />
          <StepRow emoji="⏱️" text="今日の3分レッスンで練習" />
          <StepRow emoji="✨" text="もう一度録音して変化を実感" />
        </div>
      </div>
      <PrimaryButton onClick={() => router.push("/concerns")}>はじめる</PrimaryButton>
    </ScreenShell>
  );
}

function StepRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <span className="text-sm text-ink-700">{text}</span>
    </div>
  );
}
