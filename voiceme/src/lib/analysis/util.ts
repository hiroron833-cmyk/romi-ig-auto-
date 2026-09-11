export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function scaleLinear(
  value: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 100,
): number {
  if (inMax === inMin) return (outMin + outMax) / 2;
  const t = (value - inMin) / (inMax - inMin);
  return clamp(outMin + t * (outMax - outMin), Math.min(outMin, outMax), Math.max(outMin, outMax));
}

// Bell-shaped score: peaks at `ideal`, falls off toward `min` as `value`
// moves `tolerance` away in either direction.
export function bellScore(value: number, ideal: number, tolerance: number, min = 15): number {
  const deviation = Math.abs(value - ideal) / tolerance;
  const score = 100 * Math.exp(-0.5 * deviation * deviation);
  return clamp(score, min, 100);
}
