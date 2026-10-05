import type { Camera } from './Camera';
import type { World } from '../sim/types';

/** Renderer-agnostic layer contract so Canvas 2D can later be swapped for PixiJS. */
export interface DrawFrame {
  ctx: CanvasRenderingContext2D;
  cam: Camera;
  w: number;
  h: number;
  dpr: number;
  now: number;
  alpha: number;
  reducedMotion: boolean;
}

export interface RenderLayer {
  draw(frame: DrawFrame, world: World): void;
}
