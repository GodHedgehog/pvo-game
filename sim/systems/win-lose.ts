import { OBJECT_EFFECTS } from '../../data/object-effects';
import { LOSE_OBJECTS } from '../../data/waves';
import { t } from '../../data/locales';
import type { World } from '../types';

export function commandNodesDown(world: World): boolean {
  const nodes = world.objects.filter((o) => OBJECT_EFFECTS[o.type].commandNode);
  if (nodes.length === 0) return false;
  return nodes.every((o) => !o.alive);
}

export function checkDefeat(world: World): void {
  if (world.phase !== 'playing') return;
  if (commandNodesDown(world)) {
    world.phase = 'defeat';
    world.paused = true;
    world.endReason = t('defeatHq');
    return;
  }
  if (world.stats.lost >= LOSE_OBJECTS) {
    world.phase = 'defeat';
    world.paused = true;
    world.endReason = t('defeatObjects');
  }
}

export function checkVictory(world: World): void {
  if (world.phase !== 'playing') return;
  if (Number.isFinite(world.waveCount) && world.stats.wavesCleared >= world.waveCount) {
    world.phase = 'victory';
    world.paused = true;
    world.endReason = t('victoryWhy');
  }
}

export function winLoseSystem(world: World, _dt: number): void {
  checkDefeat(world);
  if (!world.inWave && Number.isFinite(world.waveCount) && world.stats.wavesCleared >= world.waveCount) {
    checkVictory(world);
  }
}
