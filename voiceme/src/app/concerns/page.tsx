"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONCERNS } from "@/lib/concerns";
import type { ConcernKey } from "@/types/domain";
import { Chip, PrimaryButton, ScreenHeader, ScreenShell } from "@/components/ui";

export default function ConcernsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ConcernKey[]>([]);

  function toggle(key: ConcernKey) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function next() {
    const query = encodeURIComponent(selected.join(","));
    router.push(`/goals?concerns=${query}`);
  }

  return (
    <ScreenShell>
      <ScreenHeader
        title="声の悩みを教えてください"
        subtitle="当てはまるものを選んでください（複数選択可）"
        step={1}
        totalSteps={3}
      />
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-2.5">
          {CONCERNS.map((c) => (
            <Chip key={c.key} selected={selected.includes(c.key)} onClick={() => toggle(c.key)}>
              {c.emoji} {c.label}
            </Chip>
          ))}
        </div>
      </div>
      <PrimaryButton onClick={next} disabled={selected.length === 0}>
        次へ
      </PrimaryButton>
    </ScreenShell>
  );
}
