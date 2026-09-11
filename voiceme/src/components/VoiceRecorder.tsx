"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./ui";

type Phase = "idle" | "requesting" | "recording" | "recorded" | "error";

const BAR_COUNT = 28;

export function VoiceRecorder({
  onDiagnose,
  maxSeconds = 30,
}: {
  onDiagnose: (blob: Blob) => void;
  maxSeconds?: number;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(BAR_COUNT).fill(4));
  const [errorMessage, setErrorMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function cleanupStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => cleanupStream, []);

  function pickMimeType(): string | undefined {
    if (typeof MediaRecorder === "undefined") return undefined;
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
    return candidates.find((c) => MediaRecorder.isTypeSupported?.(c));
  }

  async function startRecording() {
    setErrorMessage("");
    setPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const level = Math.min(100, Math.round(rms * 320));
        setLevels((prev) => [...prev.slice(1), Math.max(4, level)]);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        blobRef.current = recordedBlob;
        setAudioUrl(URL.createObjectURL(recordedBlob));
        setPhase("recorded");
        cleanupStream();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setElapsed(0);
      setPhase("recording");
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return next;
        });
      }, 1000);
    } catch {
      setErrorMessage("マイクを使用できませんでした。ブラウザの設定でマイクの許可をご確認ください。");
      setPhase("error");
      cleanupStream();
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }

  function reset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    blobRef.current = null;
    setElapsed(0);
    setLevels(Array(BAR_COUNT).fill(4));
    setPhase("idle");
  }

  function handleDiagnose() {
    if (!blobRef.current) return;
    setSubmitting(true);
    onDiagnose(blobRef.current);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-8">
      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="rounded-2xl bg-coral-50 px-5 py-4 text-sm leading-relaxed text-ink-700">
            普段どおりに話してください。
            <br />
            上手に話そうとしなくて大丈夫です。
          </div>
          <button
            onClick={startRecording}
            className="flex h-28 w-28 items-center justify-center rounded-full bg-coral-500 text-4xl text-white shadow-soft transition active:scale-95"
            aria-label="録音をはじめる"
          >
            🎙️
          </button>
          <p className="text-xs text-ink-500">約{maxSeconds}秒、タップして録音をはじめます</p>
        </div>
      )}

      {phase === "requesting" && (
        <div className="flex flex-1 items-center justify-center text-sm text-ink-500">
          マイクを準備しています...
        </div>
      )}

      {phase === "recording" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="flex h-24 items-end gap-1">
            {levels.map((level, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-coral-400 transition-all duration-75"
                style={{ height: `${level}%` }}
              />
            ))}
          </div>
          <p className="text-2xl font-bold text-ink-900">
            {elapsed}
            <span className="text-base font-medium text-ink-500"> / {maxSeconds}秒</span>
          </p>
          <button
            onClick={stopRecording}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-700 text-white shadow-soft"
            aria-label="録音を終了する"
          >
            <span className="h-4 w-4 rounded-sm bg-white" />
          </button>
        </div>
      )}

      {phase === "recorded" && audioUrl && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
          <div className="text-4xl">✅</div>
          <p className="text-sm text-ink-500">録音が完了しました。聞き直してみましょう。</p>
          <audio className="w-full" controls src={audioUrl} />
          <div className="w-full space-y-3">
            <PrimaryButton onClick={handleDiagnose} disabled={submitting}>
              {submitting ? "診断の準備をしています..." : "この音声で診断"}
            </PrimaryButton>
            <SecondaryButton onClick={reset} disabled={submitting}>
              もう一度録音
            </SecondaryButton>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-ink-500">{errorMessage}</p>
          <SecondaryButton onClick={startRecording}>もう一度試す</SecondaryButton>
        </div>
      )}
    </div>
  );
}
