import { OBJECT_EFFECTS } from '../../data/object-effects';
import { REPAIR_COST, UNITS, type UnitId } from '../../data/units';
import { dist } from '../geo';
import type { Unit, World } from '../types';

export interface EconomyMods {
  unitCost: Record<UnitId, number>;
  refillMult: number;
  repairCost: number;
  waveBonusExtra: number;
  aewCost: number;
}

function aliveOf(world: World, type: string): number {
  return world.objects.filter((o) => o.alive && o.type === type).length;
}

export function economyMods(world: World): EconomyMods {
  let aewOff = 0;
  let refillOff = 0;
  let refillCap = 0.4;
  let waveBonusExtra = 0;
  let repairOff = 0;
  let mogOff = 0;

  for (const o of world.objects) {
    if (!o.alive) continue;
    const e = OBJECT_EFFECTS[o.type];
    if (e.aewDiscount) aewOff += e.aewDiscount;
    if (e.aewDiscountPer) aewOff += e.aewDiscountPer;
    if (e.refillDiscountPer) {
      refillOff += e.refillDiscountPer;
      if (e.refillDiscountCap) refillCap = e.refillDiscountCap;
    }
    if (e.waveBonus) waveBonusExtra += e.waveBonus;
    if (e.repairDiscount) repairOff = Math.max(repairOff, e.repairDiscount);
    if (e.unitDiscount?.mog) mogOff = Math.max(mogOff, e.unitDiscount.mog);
  }

  refillOff = Math.min(refillOff, refillCap);

  const unitCost = {} as Record<UnitId, number>;
  for (const id of Object.keys(UNITS) as UnitId[]) {
    let c = UNITS[id].cost;
    if (id === 'aew') c *= 1 - aewOff;
    if (id === 'mog') c *= 1 - mogOff;
    unitCost[id] = Math.round(c);
  }

  return {
    unitCost,
    refillMult: 1 - refillOff,
    repairCost: Math.round(REPAIR_COST * (1 - repairOff)),
    waveBonusExtra,
    aewCost: unitCost.aew,
  };
}

export function sensorMultiplier(world: World, unit: Unit): number {
  let m = 1;
  const staffBonus = world.objects.some(
    (o) => o.alive && o.type === 'staff' && o.region === unit.region,
  );
  if (staffBonus && unit.type === 'radar') {
    const e = OBJECT_EFFECTS.staff;
    m += e.staffRadarBonus ?? 0;
  }
  if (unit.type === 'radar') {
    for (const o of world.objects) {
      if (!o.alive || o.type !== 'comms') continue;
      const e = OBJECT_EFFECTS.comms;
      const r = e.commsRadiusKm ?? 100;
      if (dist(unit, o) <= r) m += e.commsRadarBonus ?? 0;
    }
  }
  return m;
}

export function refillCost(world: World, type: UnitId): number {
  const base = UNITS[type].refillCost ?? 0;
  return Math.round(base * economyMods(world).refillMult);
}

export function applySupplyRepair(world: World): void {
  const supplies = aliveOf(world, 'supply');
  if (supplies <= 0) return;
  const hp = OBJECT_EFFECTS.supply.supplyRepair ?? 5;
  for (let i = 0; i < supplies; i++) {
    const damaged = world.objects.filter((o) => o.alive && o.hp < o.maxHp);
    if (damaged.length === 0) return;
    const o = damaged[world.rng.int(damaged.length)]!;
    o.hp = Math.min(o.maxHp, o.hp + hp);
  }
}

export function economySystem(_world: World, _dt: number): void {
  // Prices are derived each time they are needed.
}
