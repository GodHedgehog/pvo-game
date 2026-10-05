import { clamp } from '../sim/geo';
import type { World } from '../sim/types';

export class Camera {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  minZ = 0.35;
  maxZ = 12;

  constructor(x: number, y: number, z: number) {
    this.x = this.tx = x;
    this.y = this.ty = y;
    this.z = this.tz = z;
  }

  fit(world: World, viewW: number, viewH: number): void {
    const b = world.map.landBounds ?? world.map.bounds;
    this.tx = this.x = (b.minX + b.maxX) / 2;
    this.ty = this.y = (b.minY + b.maxY) / 2;
    const zw = viewW / Math.max(200, b.maxX - b.minX);
    const zh = (viewH - 150) / Math.max(200, b.maxY - b.minY);
    this.tz = this.z = clamp(Math.min(zw, zh) * 0.88, this.minZ, 1.4);
  }

  update(dt: number, reduced: boolean): void {
    const k = reduced ? 1 : 1 - Math.pow(0.001, dt);
    this.x += (this.tx - this.x) * k;
    this.y += (this.ty - this.y) * k;
    this.z += (this.tz - this.z) * k;
  }

  clampWorld(world: World): void {
    const b = world.map.bounds;
    const pad = 80;
    this.tx = clamp(this.tx, b.minX - pad, b.maxX + pad);
    this.ty = clamp(this.ty, b.minY - pad, b.maxY + pad);
    this.tz = clamp(this.tz, this.minZ, this.maxZ);
  }

  toScreen(wx: number, wy: number, w: number, h: number): { x: number; y: number } {
    return { x: (wx - this.x) * this.z + w / 2, y: (wy - this.y) * this.z + h / 2 };
  }

  toWorld(sx: number, sy: number, w: number, h: number): { x: number; y: number } {
    return { x: (sx - w / 2) / this.z + this.x, y: (sy - h / 2) / this.z + this.y };
  }

  zoomAt(sx: number, sy: number, factor: number, w: number, h: number, world: World): void {
    const before = this.toWorld(sx, sy, w, h);
    this.tz = clamp(this.tz * factor, this.minZ, this.maxZ);
    this.z = this.tz;
    this.tx = before.x - (sx - w / 2) / this.z;
    this.ty = before.y - (sy - h / 2) / this.z;
    this.x = this.tx;
    this.y = this.ty;
    this.clampWorld(world);
    this.x = this.tx;
    this.y = this.ty;
  }

  pan(dx: number, dy: number, world: World): void {
    this.tx -= dx / this.z;
    this.ty -= dy / this.z;
    this.x = this.tx;
    this.y = this.ty;
    this.clampWorld(world);
    this.x = this.tx;
    this.y = this.ty;
  }

  signature(): string {
    return `${this.x.toFixed(2)}:${this.y.toFixed(2)}:${this.z.toFixed(4)}`;
  }
}
