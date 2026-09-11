// Lightweight DSP primitives used by the client-side voice analysis engine.
// No external dependencies: runs entirely in the browser on decoded PCM data.

export interface FrameSeries {
  frameMs: number;
  hopMs: number;
  sampleRate: number;
  rmsDb: number[];
  zcr: number[];
  spectralCentroid: number[];
  spectralFlatness: number[];
  f0: (number | null)[];
}

const SILENCE_FLOOR_DB = -60;

function rmsToDb(rms: number): number {
  if (rms <= 0) return SILENCE_FLOOR_DB;
  const db = 20 * Math.log10(rms);
  return Math.max(db, SILENCE_FLOOR_DB);
}

function frameRms(frame: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / frame.length);
}

function frameZcr(frame: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < frame.length; i++) {
    if ((frame[i] >= 0) !== (frame[i - 1] >= 0)) crossings++;
  }
  return crossings / frame.length;
}

// Iterative radix-2 FFT. `input` length must be a power of two.
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curWr = 1;
      let curWi = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curWr - im[i + k + len / 2] * curWi;
        const vIm = re[i + k + len / 2] * curWi + im[i + k + len / 2] * curWr;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextWr = curWr * wr - curWi * wi;
        curWi = curWr * wi + curWi * wr;
        curWr = nextWr;
      }
    }
  }
}

function spectralFeatures(
  frame: Float32Array,
  sampleRate: number,
  fftSize: number,
): { centroid: number; flatness: number } {
  const re = new Float64Array(fftSize);
  const im = new Float64Array(fftSize);
  const n = Math.min(frame.length, fftSize);
  for (let i = 0; i < n; i++) {
    // Hann window reduces spectral leakage from the frame edges.
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    re[i] = frame[i] * w;
  }
  fft(re, im);

  const half = fftSize / 2;
  const mags = new Float64Array(half);
  let magSum = 0;
  let weightedFreqSum = 0;
  let logSum = 0;
  for (let k = 0; k < half; k++) {
    const mag = Math.hypot(re[k], im[k]) + 1e-9;
    mags[k] = mag;
    const freq = (k * sampleRate) / fftSize;
    magSum += mag;
    weightedFreqSum += mag * freq;
    logSum += Math.log(mag);
  }
  const centroid = magSum > 0 ? weightedFreqSum / magSum : 0;
  const geoMean = Math.exp(logSum / half);
  const arithMean = magSum / half;
  const flatness = arithMean > 0 ? geoMean / arithMean : 0;
  return { centroid, flatness };
}

// Autocorrelation-based pitch (F0) estimate for a single frame.
function estimateF0(
  frame: Float32Array,
  sampleRate: number,
  minHz = 75,
  maxHz = 400,
): number | null {
  const maxLag = Math.floor(sampleRate / minHz);
  const minLag = Math.floor(sampleRate / maxHz);
  const n = frame.length;
  if (maxLag >= n) return null;

  let bestLag = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i + lag < n; i++) {
      corr += frame[i] * frame[i + lag];
      norm1 += frame[i] * frame[i];
      norm2 += frame[i + lag] * frame[i + lag];
    }
    const denom = Math.sqrt(norm1 * norm2) + 1e-9;
    const normalized = corr / denom;
    if (normalized > bestCorr) {
      bestCorr = normalized;
      bestLag = lag;
    }
  }
  if (bestLag <= 0 || bestCorr < 0.35) return null;
  return sampleRate / bestLag;
}

export function analyzeFrames(
  samples: Float32Array,
  sampleRate: number,
  frameMs = 25,
  hopMs = 10,
): FrameSeries {
  const frameSize = Math.round((frameMs / 1000) * sampleRate);
  const hopSize = Math.round((hopMs / 1000) * sampleRate);
  const fftSize = 512;

  const rmsDb: number[] = [];
  const zcr: number[] = [];
  const spectralCentroid: number[] = [];
  const spectralFlatness: number[] = [];
  const f0: (number | null)[] = [];

  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    const frame = samples.subarray(start, start + frameSize);
    const rms = frameRms(frame);
    rmsDb.push(rmsToDb(rms));
    zcr.push(frameZcr(frame));
    const { centroid, flatness } = spectralFeatures(frame, sampleRate, fftSize);
    spectralCentroid.push(centroid);
    spectralFlatness.push(flatness);
    f0.push(rms > 0.01 ? estimateF0(frame, sampleRate) : null);
  }

  return { frameMs, hopMs, sampleRate, rmsDb, zcr, spectralCentroid, spectralFlatness, f0 };
}
