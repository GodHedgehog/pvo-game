import type { LocaleKey } from './locales';

export type ThreatCategory = 'drone' | 'cruise' | 'ballistic';
export type SpawnPool = 'drones' | 'cruise' | 'ballistic';

export interface ThreatDef {
  id: string;
  nameKey: LocaleKey;
  shortKey: LocaleKey;
  category: ThreatCategory;
  speedMps: number;
  damage: number;
  reward: number;
  speedJitter: number;
  spawnPool: SpawnPool;
}

export function isLowFlying(category: ThreatCategory): boolean {
  return category !== 'ballistic';
}

export const THREATS: Record<string, ThreatDef> = {
  geran2: {
    id: 'geran2',
    nameKey: 'threat.geran2',
    shortKey: 'threat.geran2.short',
    category: 'drone',
    speedMps: 41.5,
    damage: 8,
    reward: 6,
    speedJitter: 0.1,
    spawnPool: 'drones',
  },
  geran5: {
    id: 'geran5',
    nameKey: 'threat.geran5',
    shortKey: 'threat.geran5.short',
    category: 'drone',
    speedMps: 166.6,
    damage: 8,
    reward: 6,
    speedJitter: 0.1,
    spawnPool: 'drones',
  },
  kh101: {
    id: 'kh101',
    nameKey: 'threat.kh101',
    shortKey: 'threat.kh101.short',
    category: 'cruise',
    speedMps: 240,
    damage: 30,
    reward: 25,
    speedJitter: 0.1,
    spawnPool: 'cruise',
  },
  iskander: {
    id: 'iskander',
    nameKey: 'threat.iskander',
    shortKey: 'threat.iskander.short',
    category: 'ballistic',
    speedMps: 2300,
    damage: 55,
    reward: 45,
    speedJitter: 0.1,
    spawnPool: 'ballistic',
  },
};

export const THREAT_LIST = Object.values(THREATS);
