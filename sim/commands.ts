import { PLACEMENT_MIN_KM, REPAIR_HP, SELL_RATIO, UNITS, type UnitId } from '../data/units';
import { t } from '../data/locales';
import { dist, pointInPolygon } from './geo';
import { economyMods, refillCost } from './systems/economy';
import { nextId, type World } from './types';
import { pushLog } from './log';

function nearestRegion(world: World, x: number, y: number): string {
  let best = world.objects[0]?.region ?? '';
  let bd = Infinity;
  for (const o of world.objects) {
    const d = dist({ x, y }, o);
    if (d < bd) {
      bd = d;
      best = o.region;
    }
  }
  return best;
}

export function canPlace(world: World, x: number, y: number): boolean {
  if (!world.map.controlled.some((poly) => pointInPolygon({ x, y }, poly))) return false;
  for (const u of world.units) {
    if (dist(u, { x, y }) < PLACEMENT_MIN_KM) return false;
  }
  return true;
}

export function placeUnit(world: World, type: UnitId, x: number, y: number): boolean {
  const cost = economyMods(world).unitCost[type];
  if (world.money < cost) {
    pushLog(world, t('noMoney'), 'bad');
    return false;
  }
  if (!canPlace(world, x, y)) {
    pushLog(world, t('badPlace'), 'bad');
    return false;
  }
  const def = UNITS[type];
  world.money -= cost;
  world.units.push({
    id: nextId(world),
    type,
    x,
    y,
    region: nearestRegion(world, x, y),
    ammo: def.ammo ?? 0,
    cooldown: 0,
  });
  return true;
}

export function sellUnit(world: World, unitId: number): boolean {
  const i = world.units.findIndex((u) => u.id === unitId);
  if (i < 0) return false;
  const u = world.units[i]!;
  world.money += Math.round(UNITS[u.type].cost * SELL_RATIO);
  world.units.splice(i, 1);
  return true;
}

export function refillUnit(world: World, unitId: number): boolean {
  const u = world.units.find((x) => x.id === unitId);
  if (!u) return false;
  const def = UNITS[u.type];
  if (def.ammo === undefined || u.ammo >= def.ammo) return false;
  const cost = refillCost(world, u.type);
  if (world.money < cost) {
    pushLog(world, t('noMoney'), 'bad');
    return false;
  }
  world.money -= cost;
  u.ammo = def.ammo;
  return true;
}

export function repairObject(world: World, objectId: string): boolean {
  const o = world.objects.find((x) => x.id === objectId);
  if (!o || !o.alive || o.hp >= o.maxHp) return false;
  const cost = economyMods(world).repairCost;
  if (world.money < cost) {
    pushLog(world, t('noMoney'), 'bad');
    return false;
  }
  world.money -= cost;
  o.hp = Math.min(o.maxHp, o.hp + REPAIR_HP);
  return true;
}
