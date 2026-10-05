import type { ObjectType } from './objects';
import type { UnitId } from './units';

export interface ObjectEffectDef {
  commandNode?: boolean;
  aewDiscount?: number;
  aewDiscountPer?: number;
  refillDiscountPer?: number;
  refillDiscountCap?: number;
  waveBonus?: number;
  supplyRepair?: number;
  staffRadarBonus?: number;
  commsRadarBonus?: number;
  commsRadiusKm?: number;
  repairDiscount?: number;
  unitDiscount?: Partial<Record<UnitId, number>>;
}

export const OBJECT_EFFECTS: Record<ObjectType, ObjectEffectDef> = {
  hq: { commandNode: true },
  hq_reserve: { commandNode: true, aewDiscount: 0.1 },
  airfield: { aewDiscountPer: 0.05 },
  ammo: { refillDiscountPer: 0.08, refillDiscountCap: 0.4 },
  fuel: { waveBonus: 10 },
  rail: { waveBonus: 15 },
  terminal: { waveBonus: 20 },
  supply: { supplyRepair: 5 },
  staff: { staffRadarBonus: 0.05 },
  comms: { commsRadarBonus: 0.1, commsRadiusKm: 100 },
  repair: { repairDiscount: 0.2 },
  training: { unitDiscount: { mog: 0.15 } },
};
