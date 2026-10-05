import { THREATS, isLowFlying } from '../../data/threats';
import { UNITS } from '../../data/units';
import { t } from '../../data/locales';
import { dist } from '../geo';
import { pushLog } from '../log';
import type { Threat, Unit, World } from '../types';
import { sensorMultiplier } from './economy';

export function detectionRangeKm(world: World, unit: Unit, lowFlying: boolean): number {
  const def = UNITS[unit.type];
  if (!def.sensor) return 0;
  const base = def.sensor.rangeKm * sensorMultiplier(world, unit);
  return lowFlying ? base * def.sensor.lowMultiplier : base;
}

export function isDetectedBy(world: World, unit: Unit, threat: Threat): boolean {
  const def = UNITS[unit.type];
  if (!def.sensor) return false;
  const low = isLowFlying(threat.category);
  return dist(unit, threat) <= detectionRangeKm(world, unit, low);
}

export function isDetected(world: World, threat: Threat): boolean {
  for (const u of world.units) {
    if (isDetectedBy(world, u, threat)) return true;
  }
  return false;
}

export function detectionSystem(world: World, _dt: number): void {
  for (const th of world.threats) {
    if (th.dead) continue;
    const was = th.detected;
    th.detected = isDetected(world, th);
    if (th.detected && !was) {
      const def = THREATS[th.typeId];
      if (th.category === 'drone') {
        if (!world.detectFlags.drones) {
          world.detectFlags.drones = true;
          pushLog(world, t('detectedGroup'), 'warn');
        }
      } else if (def && !world.detectFlags[th.typeId]) {
        world.detectFlags[th.typeId] = true;
        pushLog(world, `${t('detectedTarget')}: ${t(def.nameKey)}`, 'warn');
      }
    }
  }
}
