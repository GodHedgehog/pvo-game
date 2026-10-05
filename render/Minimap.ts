import type { World } from '../sim/types';
import type { Camera } from './Camera';

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  viewW: number,
  viewH: number,
): void {
  const mw = 168;
  const mh = 120;
  const x = viewW - mw - 12;
  const y = 12 + 54;
  ctx.fillStyle = 'rgba(13,20,28,.82)';
  ctx.strokeStyle = '#2b3b4d';
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, mw, mh);
  ctx.strokeRect(x, y, mw, mh);

  const b = world.map.bounds;
  const sx = mw / (b.maxX - b.minX);
  const sy = mh / (b.maxY - b.minY);
  const s = Math.min(sx, sy);
  const ox = x + (mw - (b.maxX - b.minX) * s) / 2;
  const oy = y + (mh - (b.maxY - b.minY) * s) / 2;
  const px = (wx: number, wy: number) => ({ x: ox + (wx - b.minX) * s, y: oy + (wy - b.minY) * s });

  const path = (poly: { x: number; y: number }[]) => {
    ctx.beginPath();
    poly.forEach((p, i) => {
      const q = px(p.x, p.y);
      if (i === 0) ctx.moveTo(q.x, q.y);
      else ctx.lineTo(q.x, q.y);
    });
    ctx.closePath();
  };
  for (const p of world.map.other) {
    path(p);
    ctx.fillStyle = '#3d4654';
    ctx.fill();
  }
  for (const p of world.map.foreign) {
    path(p);
    ctx.fillStyle = '#2a4a78';
    ctx.fill();
  }
  for (const p of world.map.controlled) {
    path(p);
    ctx.fillStyle = '#c9aa2c';
    ctx.fill();
  }
  for (const p of world.map.occupied) {
    path(p);
    ctx.fillStyle = '#a7432f';
    ctx.fill();
  }
  ctx.fillStyle = '#5fc07a';
  for (const o of world.objects) {
    if (!o.alive) continue;
    const q = px(o.x, o.y);
    ctx.fillRect(q.x - 1, q.y - 1, 2, 2);
  }
  ctx.fillStyle = '#ff5a3c';
  for (const th of world.threats) {
    if (!th.detected) continue;
    const q = px(th.x, th.y);
    ctx.fillRect(q.x - 1, q.y - 1, 2, 2);
  }
  const tl = cam.toWorld(0, 0, viewW, viewH);
  const br = cam.toWorld(viewW, viewH, viewW, viewH);
  const a = px(tl.x, tl.y);
  const c = px(br.x, br.y);
  ctx.strokeStyle = '#e2b93b';
  ctx.strokeRect(a.x, a.y, c.x - a.x, c.y - a.y);
}
