import type { LocaleKey } from './locales';
import type { ThreatCategory } from './threats';

export type UnitId = 'mog' | 'ew' | 'iris' | 'patriot' | 'radar' | 'aew';

export interface SensorDef {
  rangeKm: number;
  lowMultiplier: number;
}

export interface UnitDef {
  id: UnitId;
  nameKey: LocaleKey;
  descKey: LocaleKey;
  letter: string;
  cost: number;
  color: string;
  rangeKm: number;
  ammo?: number;
  cooldownSec?: number;
  refillCost?: number;
  targets?: readonly ThreatCategory[];
  pk?: Partial<Record<ThreatCategory, number>>;
  interceptorKps?: number;
  sensor?: SensorDef;
  ew?: { intervalSec: number; chancePerSec: number; target: ThreatCategory };
  orbit?: boolean;
}

export const UNITS: Record<UnitId, UnitDef> = {
  mog: {
    id: 'mog',
    nameKey: 'unit.mog',
    descKey: 'unit.mog.desc',
    letter: 'М',
    cost: 40,
    color: '#6ccf6c',
    rangeKm: 10,
    ammo: 120,
    cooldownSec: 0.45,
    refillCost: 20,
    targets: ['drone'],
    pk: { drone: 0.3 },
    sensor: { rangeKm: 10, lowMultiplier: 1 },
  },
  ew: {
    id: 'ew',
    nameKey: 'unit.ew',
    descKey: 'unit.ew.desc',
    letter: 'Р',
    cost: 70,
    color: '#c08af0',
    rangeKm: 30,
    ew: { intervalSec: 1, chancePerSec: 0.1, target: 'drone' },
  },
  iris: {
    id: 'iris',
    nameKey: 'unit.iris',
    descKey: 'unit.iris.desc',
    letter: 'I',
    cost: 150,
    color: '#41d3c4',
    rangeKm: 40,
    ammo: 16,
    cooldownSec: 2,
    refillCost: 70,
    targets: ['drone', 'cruise'],
    pk: { drone: 0.95, cruise: 0.8 },
    interceptorKps: 1,
    sensor: { rangeKm: 60, lowMultiplier: 0.5 },
  },
  patriot: {
    id: 'patriot',
    nameKey: 'unit.patriot',
    descKey: 'unit.patriot.desc',
    letter: 'P',
    cost: 280,
    color: '#6aa7ff',
    rangeKm: 90,
    ammo: 16,
    cooldownSec: 2.5,
    refillCost: 120,
    targets: ['cruise', 'ballistic'],
    pk: { cruise: 0.95, ballistic: 0.7 },
    interceptorKps: 1.5,
    sensor: { rangeKm: 100, lowMultiplier: 0.5 },
  },
  radar: {
    id: 'radar',
    nameKey: 'unit.radar',
    descKey: 'unit.radar.desc',
    letter: 'R',
    cost: 60,
    color: '#9be8ff',
    rangeKm: 200,
    sensor: { rangeKm: 200, lowMultiplier: 0.3 },
  },
  aew: {
    id: 'aew',
    nameKey: 'unit.aew',
    descKey: 'unit.aew.desc',
    letter: 'A',
    cost: 220,
    color: '#ffffff',
    rangeKm: 400,
    sensor: { rangeKm: 400, lowMultiplier: 0.6 },
    orbit: true,
  },
};

export const UNIT_ORDER: UnitId[] = ['mog', 'ew', 'iris', 'patriot', 'radar', 'aew'];

export const PLACEMENT_MIN_KM = 5;
export const SELL_RATIO = 0.5;
export const REPAIR_HP = 30;
export const REPAIR_COST = 30;
export const INTERCEPT_LIMIT: Record<ThreatCategory, number> = {
  drone: 1,
  cruise: 2,
  ballistic: 2,
};
