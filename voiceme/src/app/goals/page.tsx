"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { GOALS } from "@/lib/goals";
import type { ConcernKey, GoalKey } from "@/types/domain";
import { Chip, PrimaryButton, ScreenHeader, ScreenShell } from "@/components/ui";
import { saveOnboarding } from "@/lib/store";

function GoalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<GoalKey[]>([]);

  function toggle(key: GoalKey) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function next() {
    const concernsParam = searchParams.get("concerns") ?? "";
    const concerns = concernsParam
      ? (decodeURIComponent(concernsParam).split(",").filter(Boolean) as ConcernKey[])
      : [];
    saveOnboarding(concerns, selected);
    router.push("/record?mode=new");
  }

  return (
    <ScreenShell>
      <ScreenHeader
        title="なりたい話し方を教えてください"
        subtitle="目指したいイメージを選んでください（複数選択可）"
        step={2}
        totalSteps={3}
      />
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-2.5">
          {GOALS.map((g) => (
            <Chip key={g.key} selected={selected.includes(g.key)} onClick={() => toggle(g.key)}>
              {g.emoji} {g.label}
            </Chip>
          ))}
        </div>
      </div>
      <PrimaryButton onClick={next} disabled={selected.length === 0}>
        録音へ進む
      </PrimaryButton>
    </ScreenShell>
  );
}

export default function GoalsPage() {
  return (
    <Suspense>
      <GoalsContent />
    </Suspense>
  );
}
