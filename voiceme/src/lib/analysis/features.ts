import type { FrameSeries } from "./dsp";

export interface VoiceFeatures {
  durationSec: number;
  speakingRatio: number;
  pauseCount: number;
  avgPauseMs: number;
  moraRatePerSec: number;
  avgActiveVolumeDb: number;
  volumeJitter: number;
  spectralCentroidHz: number;
  spectralFlatness: number;
  pitchMeanHz: number | null;
  pitchCv: number | null;
  pitchJitter: number | null;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function std(values: number[], avg: number): number {
  if (values.length === 0) return 0;
  return Math.sqrt(mean(values.map((v) => (v - avg) ** 2)));
}

export function extractFeatures(series: FrameSeries, totalDurationSec: number): VoiceFeatures {
  const { rmsDb, zcr, spectralCentroid, spectralFlatness, f0, hopMs } = series;
  const hopSec = hopMs / 1000;

  const maxDb = Math.max(...rmsDb, -60);
  // Adaptive threshold: speech frames sit close to the loudest frames of the
  // clip, background noise/silence sits well below it.
  const activeThresholdDb = Math.max(maxDb - 30, -55);
  const active = rmsDb.map((db) => db > activeThresholdDb);

  const activeFrameCount = active.filter(Boolean).length;
  const speakingRatio = rmsDb.length > 0 ? activeFrameCount / rmsDb.length : 0;

  // Pause segmentation: runs of inactive frames longer than 250ms.
  const minPauseFrames = Math.max(1, Math.round(0.25 / hopSec));
  let pauseCount = 0;
  const pauseLengths: number[] = [];
  let runLength = 0;
  for (let i = 0; i < active.length; i++) {
    if (!active[i]) {
      runLength++;
    } else {
      if (runLength >= minPauseFrames) {
        pauseCount++;
        pauseLengths.push(runLength * hopMs);
      }
      runLength = 0;
    }
  }
  if (runLength >= minPauseFrames) {
    pauseCount++;
    pauseLengths.push(runLength * hopMs);
  }
  const avgPauseMs = pauseLengths.length > 0 ? mean(pauseLengths) : 0;

  // Onset (mora-like peak) detection on the active-region energy envelope:
  // a local rise above threshold in linear amplitude, gated by a refractory
  // period so a single syllable isn't counted twice.
  const linear = rmsDb.map((db) => 10 ** (db / 20));
  const refractoryFrames = Math.max(1, Math.round(0.12 / hopSec));
  let onsets = 0;
  let sinceLastOnset = Infinity;
  for (let i = 1; i < linear.length; i++) {
    sinceLastOnset++;
    if (!active[i]) continue;
    const rise = linear[i] - linear[i - 1];
    if (rise > 0.02 && sinceLastOnset >= refractoryFrames) {
      onsets++;
      sinceLastOnset = 0;
    }
  }
  const activeDurationSec = activeFrameCount * hopSec;
  const moraRatePerSec = activeDurationSec > 0 ? onsets / activeDurationSec : 0;

  const activeDb = rmsDb.filter((_, i) => active[i]);
  const avgActiveVolumeDb = activeDb.length > 0 ? mean(activeDb) : SILENCE_DB;
  const volumeJitter = activeDb.length > 1 ? std(activeDb, avgActiveVolumeDb) : 0;

  const activeCentroids = spectralCentroid.filter((_, i) => active[i]);
  const activeFlatness = spectralFlatness.filter((_, i) => active[i]);
  const spectralCentroidHz = activeCentroids.length > 0 ? mean(activeCentroids) : 0;
  const flatness = activeFlatness.length > 0 ? mean(activeFlatness) : 0;

  const voicedF0 = f0.filter((v): v is number => v !== null && v > 0);
  let pitchMeanHz: number | null = null;
  let pitchCv: number | null = null;
  let pitchJitter: number | null = null;
  if (voicedF0.length >= 5) {
    pitchMeanHz = mean(voicedF0);
    const pitchStd = std(voicedF0, pitchMeanHz);
    pitchCv = pitchMeanHz > 0 ? pitchStd / pitchMeanHz : 0;
    let jitterSum = 0;
    let jitterCount = 0;
    for (let i = 1; i < voicedF0.length; i++) {
      jitterSum += Math.abs(voicedF0[i] - voicedF0[i - 1]) / voicedF0[i - 1];
      jitterCount++;
    }
    pitchJitter = jitterCount > 0 ? jitterSum / jitterCount : 0;
  }

  void zcr; // reserved for future articulation refinements

  return {
    durationSec: totalDurationSec,
    speakingRatio,
    pauseCount,
    avgPauseMs,
    moraRatePerSec,
    avgActiveVolumeDb,
    volumeJitter,
    spectralCentroidHz,
    spectralFlatness: flatness,
    pitchMeanHz,
    pitchCv,
    pitchJitter,
  };
}

const SILENCE_DB = -60;
