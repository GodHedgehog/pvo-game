import { detectionSystem } from './detection';
import { combatSystem } from './combat';
import { movementSystem } from './movement';
import { wavesSystem } from './waves';
import { economySystem } from './economy';
import { winLoseSystem } from './win-lose';
import type { World } from '../types';

export type SimSystem = (world: World, dt: number) => void;

export const SYSTEMS: readonly SimSystem[] = [
  wavesSystem,
  movementSystem,
  detectionSystem,
  combatSystem,
  economySystem,
  winLoseSystem,
];

export function stepWorld(world: World, dt: number): void {
  world.time += dt;
  for (const sys of SYSTEMS) sys(world, dt);
  world.threats = world.threats.filter((th) => !th.dead);
  world.interceptors = world.interceptors.filter((it) => !it.done);
  for (const fx of world.fx) fx.life -= dt;
  world.fx = world.fx.filter((fx) => fx.life > 0);
}

export { startWave, wavesSystem } from './waves';
export { isDetected, detectionRangeKm } from './detection';
export { killThreat, canAssignInterceptor, combatSystem } from './combat';
export { pickTarget } from './movement';
export { checkDefeat, checkVictory, commandNodesDown } from './win-lose';
export { economyMods, refillCost } from './economy';
