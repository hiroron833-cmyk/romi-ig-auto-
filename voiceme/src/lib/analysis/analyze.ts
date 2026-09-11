import type { AnalysisResult } from "@/types/domain";
import { analyzeFrames } from "./dsp";
import { extractFeatures } from "./features";
import { scoreFeatures } from "./scoring";
import { generateFeedback } from "./feedback";

function toMono(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const length = buffer.length;
  const mixed = new Float32Array(length);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) mixed[i] += data[i] / buffer.numberOfChannels;
  }
  return mixed;
}

// Decodes and runs the full client-side voice analysis pipeline on a
// recorded audio Blob. This is the seam where a future server-side / LLM
// based analysis provider could be swapped in without touching callers.
export async function analyzeAudioBlob(blob: Blob): Promise<AnalysisResult> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextCtor();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const samples = toMono(audioBuffer);
    const series = analyzeFrames(samples, audioBuffer.sampleRate);
    const features = extractFeatures(series, audioBuffer.duration);
    const scores = scoreFeatures(features);
    const feedback = generateFeedback(scores);

    const result: AnalysisResult = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      durationSec: Math.round(audioBuffer.duration),
      scores,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      todayPoint: feedback.todayPoint,
      recommendedLessonId: feedback.recommendedLessonId,
    };
    return result;
  } finally {
    await audioContext.close();
  }
}
