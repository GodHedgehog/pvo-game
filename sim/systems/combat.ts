import { t } from '../../data/locales';
import { THREATS } from '../../data/threats';
import { INTERCEPT_LIMIT, UNITS } from '../../data/units';
import { dist } from '../geo';
import { pushLog } from '../log';
import { chancePerSecond } from '../rng';
import { nextId, type Threat, type World } from '../types';

export function killThreat(world: World, th: Threat, why: 'ew' | 'gun' | 'int'): void {
  if (th.dead) return;
  th.dead = true;
  world.stats.kills += 1;
  const def = THREATS[th.typeId];
  const reward = def?.reward ?? 0;
  world.money += why === 'ew' ? Math.round(reward / 2) : reward;
  world.fx.push({
    kind: 'ring',
    x: th.x,
    y: th.y,
    r0: 3,
    r1: 8,
    life: 0.6,
    maxLife: 0.6,
    color: why === 'ew' ? '#c08af0' : '#8dffa8',
  });
  if (th.category !== 'drone') {
    const name = def ? t(def.nameKey) : th.typeId;
    pushLog(world, `${t('intercept')}: ${name}`, 'good');
  }
}

export function combatSystem(world: World, dt: number): void {
  ewTick(world, dt);
  fireTick(world, dt);
  interceptorsTick(world, dt);
}

function ewTick(world: World, dt: number): void {
  for (const u of world.units) {
    const def = UNITS[u.type];
    if (!def.ew) continue;
    for (const th of world.threats) {
      if (th.dead || !th.detected || th.category !== def.ew.target) continue;
      if (dist(u, th) > def.rangeKm) continue;
      if (chancePerSecond(world.rng, def.ew.chancePerSec, dt)) {
        th.jammed = true;
        killThreat(world, th, 'ew');
      }
    }
  }
}

function fireTick(world: World, dt: number): void {
  for (const u of world.units) {
    const def = UNITS[u.type];
    if (!def.targets || def.ammo === undefined) continue;
    u.cooldown -= dt;
    if (u.cooldown > 0 || u.ammo <= 0) continue;
    let best: Threat | null = null;
    let bestD = 1e9;
    const limitFor = (th: Threat) => INTERCEPT_LIMIT[th.category];
    for (const th of world.threats) {
      if (th.dead || !th.detected) continue;
      if (!def.targets.includes(th.category)) continue;
      if (dist(u, th) > def.rangeKm) continue;
      if (th.assigned >= limitFor(th)) continue;
      const obj = world.objects.find((o) => o.id === th.targetId);
      const d = obj ? dist(th, obj) : dist(u, th);
      if (d < bestD) {
        bestD = d;
        best = th;
      }
    }
    if (!best) continue;
    u.cooldown = def.cooldownSec ?? 1;
    u.ammo -= 1;
    const pk = def.pk?.[best.category] ?? 0;
    if (!def.interceptorKps) {
      world.fx.push({
        kind: 'line',
        x: u.x,
        y: u.y,
        x2: best.x,
        y2: best.y,
        life: 0.15,
        maxLife: 0.15,
        color: '#ffe27a',
      });
      if (world.rng.chance(pk)) killThreat(world, best, 'gun');
    } else {
      best.assigned += 1;
      world.interceptors.push({
        id: nextId(world),
        x: u.x,
        y: u.y,
        prevX: u.x,
        prevY: u.y,
        threatId: best.id,
        speedKps: def.interceptorKps,
        pk,
        color: def.color,
        done: false,
      });
    }
    if (u.ammo === 0) {
      pushLog(world, `${t(def.nameKey)}: ${t('ammoEmpty')}`, 'bad');
    }
  }
}

function interceptorsTick(world: World, dt: number): void {
  const byId = new Map(world.threats.map((th) => [th.id, th]));
  for (const it of world.interceptors) {
    const th = byId.get(it.threatId);
    if (!th || th.dead) {
      it.done = true;
      continue;
    }
    it.prevX = it.x;
    it.prevY = it.y;
    const dx = th.x - it.x;
    const dy = th.y - it.y;
    const d = Math.hypot(dx, dy);
    const step = it.speedKps * dt;
    if (d <= step + 0.35) {
      it.done = true;
      if (world.rng.chance(it.pk)) killThreat(world, th, 'int');
      else {
        th.assigned = Math.max(0, th.assigned - 1);
        world.fx.push({
          kind: 'ring',
          x: it.x,
          y: it.y,
          r0: 2,
          r1: 6,
          life: 0.4,
          maxLife: 0.4,
          color: '#9aa8b8',
        });
        if (th.category !== 'drone') pushLog(world, t('miss'), 'bad');
      }
    } else {
      it.x += (dx / d) * step;
      it.y += (dy / d) * step;
    }
  }
}

export function canAssignInterceptor(th: Threat): boolean {
  return th.assigned < INTERCEPT_LIMIT[th.category];
}
