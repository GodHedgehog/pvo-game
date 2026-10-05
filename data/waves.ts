export interface WaveComposition {
  drones: number;
  cruise: number;
  ballistic: number;
  spanSec: number;
  bonus: number;
}

export function waveComposition(n: number): WaveComposition {
  return {
    drones: 5 + 4 * n,
    cruise: Math.floor((n - 1) * 1.5),
    ballistic: Math.max(0, n - 2),
    spanSec: 14 + n,
    bonus: 180 + 30 * n,
  };
}

export const WAVE_COUNT = 10;
export const STARTING_MONEY = 800;
export const LOSE_OBJECTS = 6;
