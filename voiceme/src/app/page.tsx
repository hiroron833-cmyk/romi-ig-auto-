"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, ScreenShell } from "@/components/ui";
import { ScoreRing } from "@/components/ScoreRing";
import { ProductList } from "@/components/ProductList";
import { deleteAllData, getOnboarding, listSessions } from "@/lib/store";
import { getRecommendedProducts } from "@/lib/products";
import type { RecordingSession } from "@/types/domain";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessions, setSessions] = useState<RecordingSession[]>([]);

  useEffect(() => {
    const onboarding = getOnboarding();
    if (!onboarding) {
      router.replace("/welcome");
      return;
    }
    setSessions(listSessions());
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const latest = sessions[0];
  const latestScore = latest?.after?.scores.listenability ?? latest?.before.scores.listenability;
  const todayPoint = latest?.before.todayPoint;
  const onboarding = getOnboarding();
  const products = getRecommendedProducts(onboarding?.concerns ?? [], onboarding?.goals ?? []);

  return (
    <ScreenShell>
      <div className="mb-6">
        <p className="text-sm text-ink-500">おかえりなさい</p>
        <h1 className="text-xl font-bold text-ink-900">Voice Me</h1>
      </div>

      {latest ? (
        <>
          <Card className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-500">今日の声スコア</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {latest.after ? "前回からの変化をキープできています。" : "まずは自分の声の今を知りましょう。"}
              </p>
            </div>
            <ScoreRing score={latestScore ?? 0} label="" />
          </Card>

          {todayPoint && (
            <Card className="mt-4 border border-coral-100 bg-coral-50">
              <p className="text-sm font-semibold text-ink-900">✨ 今日の課題</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{todayPoint}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push(`/lesson/${latest.id}`)}>
                今日の3分レッスンへ
              </PrimaryButton>
            </Card>
          )}

          <Card className="mt-4">
            <p className="text-sm font-semibold text-ink-900">📈 過去の成長</p>
            <ul className="mt-3 space-y-2">
              {sessions.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">
                    {new Date(s.createdAt).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-semibold text-ink-700">
                    聞き取りやすさ {s.after?.scores.listenability ?? s.before.scores.listenability}
                    {s.after ? " (After)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      ) : (
        <Card className="text-center">
          <p className="text-sm leading-relaxed text-ink-700">
            まだ診断がありません。
            <br />
            30秒の録音から、あなたの声の強みを見つけましょう。
          </p>
        </Card>
      )}

      <div className="mt-6">
        <PrimaryButton onClick={() => router.push("/record?mode=new")}>
          🎙️ 録音する
        </PrimaryButton>
      </div>

      <div className="mt-8">
        <ProductList products={products} />
      </div>

      {sessions.length > 0 && (
        <button
          className="mt-8 text-center text-xs text-ink-500 underline underline-offset-4"
          onClick={() => {
            if (window.confirm("このデバイスに保存された診断データをすべて削除します。よろしいですか？")) {
              deleteAllData();
              setSessions([]);
            }
          }}
        >
          録音・診断データをすべて削除する
        </button>
      )}
    </ScreenShell>
  );
}
