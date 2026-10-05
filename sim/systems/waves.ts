import { THREATS } from '../../data/threats';
import { t } from '../../data/locales';
import { waveComposition } from '../../data/waves';
import { nextId, type World } from '../types';
import { applySupplyRepair, economyMods } from './economy';
import { pushLog } from '../log';
import { pickTarget } from './movement';
import { checkVictory } from './win-lose';

export function startWave(world: World): boolean {
  if (world.inWave || world.phase !== 'playing' || world.wave >= world.waveCount) return false;
  world.wave += 1;
  world.inWave = true;
  world.waveClock = 0;
  world.queue = [];
  world.detectFlags = {};
  const n = world.wave;
  const c = waveComposition(n);
  const add = (count: number, typeId: string, span: number) => {
    for (let i = 0; i < count; i++) {
      world.queue.push({ t: world.rng.next() * span, typeId });
    }
  };
  const geran5 = Math.floor(c.drones * 0.22);
  add(c.drones - geran5, 'geran2', c.spanSec);
  add(geran5, 'geran5', c.spanSec);
  add(c.cruise, 'kh101', c.spanSec + 2);
  add(c.ballistic, 'iskander', c.spanSec + 4);
  world.queue.sort((a, b) => a.t - b.t);
  pushLog(world, `${t('wave')} ${n}: ${t('waveIncoming')}`, 'warn');
  return true;
}

function spawn(world: World, typeId: string): void {
  const def = THREATS[typeId];
  if (!def) return;
  const map = world.map.spawn;
  let pool = map.drones;
  if (def.spawnPool === 'cruise') {
    pool = world.rng.chance(0.5) ? map.cruiseLand : map.cruiseSea;
  } else if (def.spawnPool === 'ballistic') {
    pool = map.ballistic;
  }
  if (pool.length === 0) return;
  const sp = pool[world.rng.int(pool.length)]!;
  const jitter = 12;
  const x = sp.x + world.rng.range(-jitter, jitter);
  const y = sp.y + world.rng.range(-jitter, jitter);
  const targetId = pickTarget(world);
  if (!targetId) return;
  const j = def.speedJitter;
  const kps = (def.speedMps / 1000) * (1 - j + world.rng.next() * 2 * j);
  world.threats.push({
    id: nextId(world),
    typeId,
    category: def.category,
    x,
    y,
    prevX: x,
    prevY: y,
    heading: 0,
    speedKps: kps,
    targetId,
    detected: false,
    assigned: 0,
    trail: [],
    trailAcc: 0,
    dead: false,
    jammed: false,
  });
}

export function wavesSystem(world: World, dt: number): void {
  if (!world.inWave || world.phase !== 'playing') return;
  world.waveClock += dt;
  while (world.queue.length && world.queue[0]!.t <= world.waveClock) {
    const job = world.queue.shift()!;
    spawn(world, job.typeId);
  }
  if (world.queue.length === 0 && world.threats.length === 0) {
    world.inWave = false;
    const c = waveComposition(world.wave);
    const extra = economyMods(world).waveBonusExtra;
    const bonus = c.bonus + extra;
    world.money += bonus;
    world.stats.wavesCleared += 1;
    applySupplyRepair(world);
    pushLog(world, `${t('waveCleared')} +${bonus}`, 'good');
    checkVictory(world);
  }
}
