import { t } from '../../data/locales';
import { THREATS } from '../../data/threats';
import { dist } from '../geo';
import { pushLog } from '../log';
import { liveObjects, type Threat, type World } from '../types';
import { checkDefeat } from './win-lose';

export function pickTarget(world: World): string | null {
  const live = liveObjects(world);
  if (live.length === 0) return null;
  let sum = 0;
  for (const o of live) sum += o.weight;
  let r = world.rng.next() * sum;
  for (const o of live) {
    r -= o.weight;
    if (r <= 0) return o.id;
  }
  return live[live.length - 1]!.id;
}

export function movementSystem(world: World, dt: number): void {
  const byId = new Map(world.objects.map((o) => [o.id, o]));
  for (const th of world.threats) {
    if (th.dead) continue;
    th.prevX = th.x;
    th.prevY = th.y;
    let target = th.targetId ? byId.get(th.targetId) : undefined;
    if (!target || !target.alive) {
      th.targetId = pickTarget(world);
      target = th.targetId ? byId.get(th.targetId) : undefined;
      if (!target) {
        th.dead = true;
        continue;
      }
    }
    const dx = target.x - th.x;
    const dy = target.y - th.y;
    const d = Math.hypot(dx, dy);
    const step = th.speedKps * dt;
    th.heading = Math.atan2(dy, dx);
    if (d <= step + 0.4) {
      impact(world, th, target);
    } else {
      th.x += (dx / d) * step;
      th.y += (dy / d) * step;
      th.trailAcc += step;
      if (th.trailAcc >= 2.5) {
        th.trailAcc = 0;
        th.trail.push({ x: th.x, y: th.y });
        if (th.trail.length > 18) th.trail.shift();
      }
    }
  }
}

function impact(world: World, th: Threat, target: import('../types').DefenseObject): void {
  th.dead = true;
  world.stats.leaks += 1;
  const def = THREATS[th.typeId];
  const dmg = def?.damage ?? 8;
  target.hp = Math.max(0, target.hp - dmg);
  world.fx.push({
    kind: 'ring',
    x: target.x,
    y: target.y,
    r0: 3,
    r1: th.category === 'drone' ? 9 : 18,
    life: 0.9,
    maxLife: 0.9,
    color: '#ff5a3c',
  });
  pushLog(world, `${t('hit')}: ${target.name} (${Math.round(target.hp)}/${target.maxHp})`, 'bad');
  if (target.hp <= 0 && target.alive) {
    target.alive = false;
    world.stats.lost += 1;
    pushLog(world, `${t('objectLost')}: ${target.name}`, 'bad');
    pushLog(world, t('objectLostRegion', { region: target.region }), 'bad');
    world.fx.push({
      kind: 'ring',
      x: target.x,
      y: target.y,
      r0: 5,
      r1: 30,
      life: 1.4,
      maxLife: 1.4,
      color: '#ff3b2a',
    });
    checkDefeat(world);
  }
}

