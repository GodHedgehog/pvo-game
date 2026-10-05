import type { UnitId } from '../data/units';
import type { World } from '../sim/types';
import { Camera } from './Camera';
import { drawEffects } from './EffectsLayer';
import { drawEntities } from './EntityLayer';
import { MapLayer } from './MapLayer';
import { drawMinimap } from './Minimap';

export interface RenderState {
  sel: { kind: 'unit' | 'obj'; id: number | string } | null;
  ghost: { type: UnitId; x: number; y: number; ok: boolean } | null;
  reducedMotion: boolean;
  showMinimap: boolean;
}

export class Renderer {
  readonly cam: Camera;
  private map = new MapLayer();
  private dpr = 1;
  w = 0;
  h = 0;

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly ctx: CanvasRenderingContext2D,
  ) {
    this.cam = new Camera(700, 470, 0.8);
  }

  resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  draw(world: World, alpha: number, now: number, state: RenderState): void {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.map.draw(this.ctx, world.map, this.cam, this.w, this.h, this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    drawEntities(
      this.ctx,
      world,
      this.cam,
      this.w,
      this.h,
      alpha,
      now,
      state.reducedMotion,
      state.sel,
      state.ghost,
    );
    drawEffects(this.ctx, world, this.cam, this.w, this.h, state.reducedMotion);
    if (state.showMinimap && this.w > 720) {
      drawMinimap(this.ctx, world, this.cam, this.w, this.h);
    }
  }
}
