import type { World } from '../sim/types';
import type { Camera } from './Camera';

export function drawEffects(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  w: number,
  h: number,
  reduced: boolean,
): void {
  for (const f of world.fx) {
    const k = 1 - f.life / f.maxLife;
    if (reduced && k > 0.2) continue;
    if (f.kind === 'ring') {
      const s = cam.toScreen(f.x, f.y, w, h);
      const r = (f.r0 + (f.r1 - f.r0) * k) * Math.max(1, cam.z * 1.2);
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = f.color;
      ctx.globalAlpha = 1 - k;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = f.color;
      ctx.globalAlpha = (1 - k) * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      const a = cam.toScreen(f.x, f.y, w, h);
      const b = cam.toScreen(f.x2, f.y2, w, h);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = f.color;
      ctx.globalAlpha = f.life / f.maxLife;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
