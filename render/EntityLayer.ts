import { THREATS } from '../data/threats';
import { UNITS } from '../data/units';
import { t } from '../data/locales';
import { detectionRangeKm } from '../sim/systems/detection';
import type { World } from '../sim/types';
import type { Camera } from './Camera';
import { drawObjectIcon, drawUnitGlyph } from './icons';

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

export function drawEntities(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  w: number,
  h: number,
  alpha: number,
  now: number,
  reduced: boolean,
  sel: { kind: 'unit' | 'obj'; id: number | string } | null,
  ghost: { type: keyof typeof UNITS; x: number; y: number; ok: boolean } | null,
): void {
  const toS = (x: number, y: number) => cam.toScreen(x, y, w, h);

  for (const u of world.units) {
    const def = UNITS[u.type];
    if (u.type === 'radar' || u.type === 'aew') {
      const full = detectionRangeKm(world, u, false);
      const low = detectionRangeKm(world, u, true);
      const pulse = reduced ? 0.07 : 0.05 + 0.04 * (0.5 + 0.5 * Math.sin(now / 420));
      circle(ctx, toS, u.x, u.y, cam, full, `rgba(120,220,255,${pulse})`, 'rgba(120,220,255,.45)', [6, 5]);
      circle(ctx, toS, u.x, u.y, cam, low, null, 'rgba(120,220,255,.28)', [2, 4]);
    } else if (def.rangeKm) {
      circle(ctx, toS, u.x, u.y, cam, def.rangeKm, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.35)');
    }
  }

  for (const o of world.objects) {
    const s = toS(o.x, o.y);
    drawObjectIcon(ctx, s.x, s.y, o.type, o.alive, cam.z);
    if (o.alive) {
      const barW = 34;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(s.x - barW / 2, s.y + 16, barW, 5);
      const r = o.hp / o.maxHp;
      ctx.fillStyle = r > 0.6 ? '#5fc07a' : r > 0.3 ? '#e2b93b' : '#ef6a57';
      ctx.fillRect(s.x - barW / 2, s.y + 16, barW * r, 5);
    }
    if (sel?.kind === 'obj' && sel.id === o.id) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (cam.z > 1.05) {
      ctx.textAlign = 'center';
      ctx.font = '11px system-ui,sans-serif';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.fillStyle = '#fff';
      ctx.strokeText(o.name, s.x, s.y - 22);
      ctx.fillText(o.name, s.x, s.y - 22);
    }
  }

  for (const u of world.units) {
    const def = UNITS[u.type];
    if (u.type === 'aew') {
      const a = reduced ? 0 : now / 2500;
      const s = toS(u.x, u.y);
      const R = Math.max(10, 12 * Math.min(1.4, cam.z + 0.4));
      ctx.beginPath();
      ctx.arc(s.x, s.y, R * 2, 0, Math.PI * 2);
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
      const ox = u.x + Math.cos(a) * ((R * 2) / cam.z);
      const oy = u.y + Math.sin(a) * ((R * 2) / cam.z);
      const p = toS(ox, oy);
      drawUnitGlyph(ctx, p.x, p.y, 'aew', def.color, 10);
    } else {
      const s = toS(u.x, u.y);
      drawUnitGlyph(ctx, s.x, s.y, u.type, def.color, 11);
      if (u.type === 'radar' && !reduced) {
        const ang = now / 700;
        const rr = detectionRangeKm(world, u, false) * cam.z;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.arc(s.x, s.y, rr, ang - 0.55, ang);
        ctx.closePath();
        ctx.fillStyle = 'rgba(120,220,255,.14)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + Math.cos(ang) * rr, s.y + Math.sin(ang) * rr);
        ctx.strokeStyle = 'rgba(120,220,255,.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      if (def.ammo && u.ammo === 0) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef6a57';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    if (sel?.kind === 'unit' && sel.id === u.id) {
      const s = toS(u.x, u.y);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 17, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  const droneCounts = countDetectedDrones(world);
  for (const th of world.threats) {
    if (!th.detected) continue;
    const x = lerp(th.prevX, th.x, alpha);
    const y = lerp(th.prevY, th.y, alpha);
    const s = toS(x, y);
    const tgt = world.objects.find((o) => o.id === th.targetId);
    if (tgt) {
      const ts = toS(tgt.x, tgt.y);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(ts.x, ts.y);
      ctx.strokeStyle = 'rgba(255,90,60,.18)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (th.trail.length) {
      ctx.beginPath();
      th.trail.forEach((p, i) => {
        const a = toS(p.x, p.y);
        if (i === 0) ctx.moveTo(a.x, a.y);
        else ctx.lineTo(a.x, a.y);
      });
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = th.category === 'ballistic' ? 'rgba(255,120,80,.8)' : 'rgba(255,170,90,.6)';
      ctx.lineWidth = th.category === 'ballistic' ? 2.5 : 1.5;
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(th.heading);
    ctx.fillStyle = th.category === 'drone' ? '#ffb347' : '#ff5a3c';
    ctx.beginPath();
    if (th.category === 'drone') {
      ctx.moveTo(6, 0);
      ctx.lineTo(-5, 4);
      ctx.lineTo(-5, -4);
    } else if (th.category === 'cruise') {
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, 4);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, -4);
    } else {
      ctx.moveTo(9, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-9, 0);
      ctx.lineTo(0, -5);
    }
    ctx.closePath();
    ctx.fill();
    if (th.category === 'ballistic') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
    if (cam.z > 0.85) {
      const def = THREATS[th.typeId];
      let label = def ? t(def.nameKey) : th.typeId;
      if (th.category === 'drone') {
        const n = droneCounts.get(th.typeId) ?? 1;
        if (n > 1) label = `${label} (${n})`;
      }
      ctx.fillStyle = '#fff';
      ctx.font = '10px system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.lineWidth = 3;
      ctx.strokeText(label, s.x + 9, s.y - 8);
      ctx.fillText(label, s.x + 9, s.y - 8);
    }
  }

  for (const it of world.interceptors) {
    const x = lerp(it.prevX, it.x, alpha);
    const y = lerp(it.prevY, it.y, alpha);
    const a = toS(x, y);
    const b = toS(it.prevX, it.prevY);
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const l = Math.hypot(dx, dy) || 1;
    ctx.beginPath();
    ctx.moveTo(a.x - (dx / l) * 8, a.y - (dy / l) * 8);
    ctx.lineTo(a.x, a.y);
    ctx.strokeStyle = it.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  if (ghost) {
    const def = UNITS[ghost.type];
    const col = ghost.ok ? def.color : '#ef6a57';
    const fill = ghost.ok ? 'rgba(255,255,255,.06)' : 'rgba(239,106,87,.12)';
    circle(ctx, toS, ghost.x, ghost.y, cam, def.rangeKm, fill, col, [5, 4]);
    if (def.sensor && (ghost.type === 'radar' || ghost.type === 'aew')) {
      circle(
        ctx,
        toS,
        ghost.x,
        ghost.y,
        cam,
        def.sensor.rangeKm * def.sensor.lowMultiplier,
        null,
        col,
        [2, 4],
      );
    }
    const s = toS(ghost.x, ghost.y);
    drawUnitGlyph(ctx, s.x, s.y, ghost.type, col, 11);
  }
}

function countDetectedDrones(world: World): Map<string, number> {
  const m = new Map<string, number>();
  for (const th of world.threats) {
    if (!th.detected || th.category !== 'drone') continue;
    m.set(th.typeId, (m.get(th.typeId) ?? 0) + 1);
  }
  return m;
}

function circle(
  ctx: CanvasRenderingContext2D,
  toS: (x: number, y: number) => { x: number; y: number },
  x: number,
  y: number,
  cam: Camera,
  rKm: number,
  fill: string | null,
  stroke?: string,
  dash?: number[],
): void {
  const s = toS(x, y);
  ctx.beginPath();
  ctx.arc(s.x, s.y, Math.max(0, rKm * cam.z), 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.setLineDash(dash ?? []);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
