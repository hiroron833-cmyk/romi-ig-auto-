export function ScoreRing({ score, label }: { score: number; label: string }) {
  const angle = Math.round((score / 100) * 360);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#FF7F68 ${angle}deg, #FDEEDD ${angle}deg)`,
        }}
      >
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-card">
          <span className="text-3xl font-bold text-ink-900">{score}</span>
          <span className="text-[11px] text-ink-500">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-ink-700">{label}</span>
    </div>
  );
}
