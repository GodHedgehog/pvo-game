export interface FixedStep {
  dt: number;
  accumulator: number;
  alpha: number;
}

export function createFixedStep(dt: number): FixedStep {
  return { dt, accumulator: 0, alpha: 0 };
}

export function advanceFixed(
  step: FixedStep,
  realDt: number,
  speed: number,
  paused: boolean,
  tick: (dt: number) => boolean,
): void {
  if (paused) {
    step.alpha = 1;
    return;
  }
  step.accumulator += Math.min(0.25, realDt) * speed;
  let guard = 0;
  while (step.accumulator >= step.dt && guard < 40) {
    const stop = tick(step.dt);
    step.accumulator -= step.dt;
    guard += 1;
    if (stop) {
      step.accumulator = 0;
      break;
    }
  }
  step.alpha = step.accumulator / step.dt;
}
