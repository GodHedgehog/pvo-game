import type { Camera } from '../render/Camera';
import type { World } from '../sim/types';

export class Input {
  mouse = { x: -999, y: -999, in: false };
  private ptrs = new Map<number, { x: number; y: number }>();
  private pinch = 0;
  private moved = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private cam: Camera,
    private size: () => { w: number; h: number },
    private world: () => World,
    private onClick: (sx: number, sy: number) => void,
    private onCancel: () => void,
  ) {
    canvas.addEventListener('pointerdown', (e) => this.down(e));
    canvas.addEventListener('pointermove', (e) => this.move(e));
    canvas.addEventListener('pointerup', (e) => this.up(e));
    canvas.addEventListener('pointercancel', (e) => this.ptrs.delete(e.pointerId));
    canvas.addEventListener('pointerleave', () => {
      this.mouse.in = false;
    });
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.onCancel();
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const { w, h } = this.size();
        this.cam.zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12, w, h, this.world());
      },
      { passive: false },
    );
  }

  private down(e: PointerEvent): void {
    this.canvas.setPointerCapture(e.pointerId);
    this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.moved = 0;
    if (this.ptrs.size === 2) {
      const [a, b] = [...this.ptrs.values()];
      this.pinch = Math.hypot(a!.x - b!.x, a!.y - b!.y);
    }
  }

  private move(e: PointerEvent): void {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.in = true;
    const p = this.ptrs.get(e.pointerId);
    if (!p) return;
    if (this.ptrs.size === 1) {
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      this.moved += Math.abs(dx) + Math.abs(dy);
      if (this.moved > 6) this.cam.pan(dx, dy, this.world());
      p.x = e.clientX;
      p.y = e.clientY;
    } else if (this.ptrs.size === 2) {
      p.x = e.clientX;
      p.y = e.clientY;
      this.moved = 99;
      const [a, b] = [...this.ptrs.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (this.pinch > 0) {
        const { w, h } = this.size();
        this.cam.zoomAt((a!.x + b!.x) / 2, (a!.y + b!.y) / 2, d / this.pinch, w, h, this.world());
      }
      this.pinch = d;
    }
  }

  private up(e: PointerEvent): void {
    const wasSingle = this.ptrs.size === 1;
    this.ptrs.delete(e.pointerId);
    if (wasSingle && this.moved <= 6 && e.button === 0) this.onClick(e.clientX, e.clientY);
    if (e.button === 2) this.onCancel();
  }
}
