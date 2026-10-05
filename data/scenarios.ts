import { STARTING_MONEY, WAVE_COUNT } from './waves';
import type { ScenarioDef } from './geo/types';

export type Difficulty = 'easy' | 'normal' | 'hard';

export const SCENARIOS: Record<string, ScenarioDef> = {
  'ukraine-shield': {
    id: 'ukraine-shield',
    nameKey: 'scenario.ukraine',
    mapId: 'ukraine-2024',
    objectFilter: 'all',
    startingMoney: STARTING_MONEY,
    waveCount: WAVE_COUNT,
  },
};

export function getScenario(id: string): ScenarioDef {
  const s = SCENARIOS[id];
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
}

export function registerScenario(def: ScenarioDef): void {
  SCENARIOS[def.id] = def;
}

export function listScenarios(): ScenarioDef[] {
  return Object.values(SCENARIOS);
}

export const EASY_ZONES = new Set(['center', 'west']);
export const HARD_WEIGHT_ZONES = new Set(['east', 'south']);
export const HARD_WEIGHT_MULT = 1.6;
