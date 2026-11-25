export type PixyReactiveMood =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "budget"
  | "error"
  | "delighted";

export type PixyEmotion =
  | "welcoming"
  | "flirty"
  | "joy"
  | "spin"
  | "hurray"
  | "curious"
  | "sassy"
  | "oops"
  | "neutral";

export type PixyGazeMode = "cursor" | "input" | "camera";

export interface Spring1D {
  value: number;
  velocity: number;
}

export function createSpring1D(initial = 0): Spring1D {
  return { value: initial, velocity: 0 };
}

/**
 * Frame-rate-independent second-order damped spring step.
 * Uses semi-implicit Euler clamped to safe dt <= 50ms so tab switches never explode.
 */
export function stepSpring1D(
  spring: Spring1D,
  target: number,
  stiffness: number,
  damping: number,
  dt: number
): number {
  const safeDt = Math.min(Math.max(dt, 0.001), 0.05);
  const force = (target - spring.value) * stiffness;
  const drag = spring.velocity * damping;
  spring.velocity += (force - drag) * safeDt;
  spring.value += spring.velocity * safeDt;
  return spring.value;
}

export interface Spring2D {
  x: Spring1D;
  y: Spring1D;
}

export function createSpring2D(ix = 0, iy = 0): Spring2D {
  return { x: createSpring1D(ix), y: createSpring1D(iy) };
}

export function stepSpring2D(
  s: Spring2D,
  tx: number,
  ty: number,
  stiffness: number,
  damping: number,
  dt: number
): { x: number; y: number } {
  return {
    x: stepSpring1D(s.x, tx, stiffness, damping, dt),
    y: stepSpring1D(s.y, ty, stiffness, damping, dt),
  };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
