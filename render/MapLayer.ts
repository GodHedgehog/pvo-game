import type { Camera } from './Camera';
import type { CompiledMap } from '../sim/types';

export class MapLayer {
  private cache: HTMLCanvasElement | OffscreenCanvas;
  private cctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private sig = '';
  private w = 0;
  private h = 0;

  constructor() {
    this.cache = document.createElement('canvas');
    const ctx = this.cache.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2d context');
    this.cctx = ctx;
  }

  draw(
    target: CanvasRenderingContext2D,
    map: CompiledMap,
    cam: Camera,
    w: number,
    h: number,
    dpr: number,
  ): void {
    const sig = `${cam.signature()}|${w}x${h}|${dpr}`;
    if (sig !== this.sig || this.w !== w || this.h !== h) {
      this.rebuild(map, cam, w, h, dpr);
      this.sig = sig;
      this.w = w;
      this.h = h;
    }
    target.setTransform(1, 0, 0, 1, 0, 0);
    target.drawImage(this.cache, 0, 0, Math.floor(w * dpr), Math.floor(h * dpr));
    target.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private rebuild(map: CompiledMap, cam: Camera, w: number, h: number, dpr: number): void {
    const c = this.cache;
    c.width = Math.max(1, Math.floor(w * dpr));
    c.height = Math.max(1, Math.floor(h * dpr));
    const ctx = this.cctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#3a424c';
    ctx.fillRect(0, 0, w, h);

    const path = (poly: { x: number; y: number }[]) => {
      ctx.beginPath();
      poly.forEach((p, i) => {
        const s = cam.toScreen(p.x, p.y, w, h);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
    };

    for (const poly of map.sea) {
      path(poly);
      ctx.fillStyle = '#244a73';
      ctx.fill();
    }
    for (const poly of map.other) {
      path(poly);
      ctx.fillStyle = '#3d4654';
      ctx.fill();
      ctx.strokeStyle = '#4c5868';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (const poly of map.foreign) {
      path(poly);
      ctx.fillStyle = '#2a4a78';
      ctx.fill();
      ctx.strokeStyle = '#3d6aa8';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const v = map.def.view;
    const P = map.projector;
    for (let lo = v.minLon; lo <= v.maxLon; lo += v.gridStep) {
      const a = cam.toScreen((lo - P.lon0) * P.kx, (P.lat0 - v.maxLat) * P.ky, w, h);
      const b = cam.toScreen((lo - P.lon0) * P.kx, (P.lat0 - v.minLat) * P.ky, w, h);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    for (let la = v.minLat; la <= v.maxLat; la += v.gridStep) {
      const a = cam.toScreen((v.minLon - P.lon0) * P.kx, (P.lat0 - la) * P.ky, w, h);
      const b = cam.toScreen((v.maxLon - P.lon0) * P.kx, (P.lat0 - la) * P.ky, w, h);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();

    for (const poly of map.controlled) {
      path(poly);
      ctx.fillStyle = '#c9aa2c';
      ctx.fill();
      ctx.strokeStyle = '#f1d667';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    for (const poly of map.occupied) {
      path(poly);
      ctx.fillStyle = '#a7432f';
      ctx.fill();
      ctx.strokeStyle = '#e0715a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.font = '11px system-ui,sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (const city of map.cities) {
      if (cam.z < 0.55 && !city.major) continue;
      const s = cam.toScreen(city.x, city.y, w, h);
      ctx.fillStyle = 'rgba(12,14,18,.85)';
      ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
      if (city.major || cam.z > 0.9) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(12,14,18,.75)';
        ctx.fillStyle = '#f4f1e4';
        ctx.strokeText(city.name, s.x + 6, s.y);
        ctx.fillText(city.name, s.x + 6, s.y);
      }
    }

    if (cam.z > 0.45) {
      ctx.fillStyle = 'rgba(232,237,243,.35)';
      ctx.font = '10px ui-monospace,monospace';
      ctx.textAlign = 'left';
      for (let lo = v.minLon; lo <= v.maxLon; lo += v.gridStep * 2) {
        const a = cam.toScreen((lo - P.lon0) * P.kx, (P.lat0 - v.maxLat) * P.ky, w, h);
        ctx.fillText(`${lo}°`, a.x + 4, 16);
      }
    }
  }
}
