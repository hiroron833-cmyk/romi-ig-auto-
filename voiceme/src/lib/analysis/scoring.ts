import type { MetricScores } from "@/types/domain";
import type { VoiceFeatures } from "./features";
import { clamp, scaleLinear, bellScore } from "./util";

export function scoreFeatures(features: VoiceFeatures): MetricScores {
  const speed = Math.round(scaleLinear(features.moraRatePerSec, 3, 11, 20, 95));
  const volume = Math.round(scaleLinear(features.avgActiveVolumeDb, -34, -9, 15, 95));

  const clarity = Math.round(
    clamp(scaleLinear(features.spectralFlatness, 0.55, 0.08, 15, 95), 15, 95),
  );

  const articulation = Math.round(
    clamp(scaleLinear(features.spectralCentroidHz, 700, 3600, 20, 92), 20, 92),
  );

  const silenceRatio = clamp(1 - features.speakingRatio, 0, 1);
  const pause = Math.round(bellScore(silenceRatio * 100, 20, 16));

  const pitchCv = features.pitchCv ?? 0.14;
  const intonation = Math.round(clamp(scaleLinear(pitchCv, 0.03, 0.3, 18, 95), 18, 95));

  const volumeJitterNorm = clamp(features.volumeJitter / 9, 0, 1);
  const pitchJitterNorm = clamp((features.pitchJitter ?? 0.06) / 0.18, 0, 1);
  const stability = Math.round(clamp(100 - volumeJitterNorm * 50 - pitchJitterNorm * 45, 15, 95));

  const speedAdequacy = bellScore(speed, 55, 30, 30);
  const volumeAdequacy = clamp(scaleLinear(volume, 25, 55, 40, 100), 40, 100);

  const listenability = Math.round(
    clamp(
      clarity * 0.28 +
        articulation * 0.18 +
        pause * 0.16 +
        stability * 0.14 +
        speedAdequacy * 0.14 +
        volumeAdequacy * 0.1,
      15,
      98,
    ),
  );

  return {
    speed,
    volume,
    clarity,
    articulation,
    pause,
    intonation,
    stability,
    listenability,
  };
}
