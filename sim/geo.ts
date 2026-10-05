import type { LonLat } from '../data/geo/types';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Projector {
  lon0: number;
  lat0: number;
  kx: number;
  ky: number;
}

export function makeProjector(lon0: number, lat0: number, latRefDeg: number): Projector {
  const kx = 111.32 * Math.cos((latRefDeg * Math.PI) / 180);
  const ky = 110.57;
  return { lon0, lat0, kx, ky };
}

export function project(p: Projector, lon: number, lat: number): Vec2 {
  return { x: (lon - p.lon0) * p.kx, y: (p.lat0 - lat) * p.ky };
}

export function unproject(p: Projector, x: number, y: number): { lon: number; lat: number } {
  return { lon: x / p.kx + p.lon0, lat: p.lat0 - y / p.ky };
}

export function projectRing(p: Projector, ring: LonLat[]): Vec2[] {
  return ring.map(([lon, lat]) => project(p, lon, lat));
}

export function pointInPolygon(pt: Vec2, poly: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    const intersect =
      a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
