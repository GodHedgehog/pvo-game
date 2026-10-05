import type { ObjectType } from '../data/objects';
import type { UnitId } from '../data/units';

export function drawUnitGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: UnitId,
  color: string,
  r: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#0f1822';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  if (type === 'radar') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, -0.7, 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.55, 0);
    ctx.stroke();
  } else if (type === 'aew') {
    ctx.beginPath();
    ctx.moveTo(r * 0.7, 0);
    ctx.lineTo(-r * 0.45, r * 0.35);
    ctx.lineTo(-r * 0.2, 0);
    ctx.lineTo(-r * 0.45, -r * 0.35);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'mog') {
    ctx.fillRect(-r * 0.35, -r * 0.35, r * 0.7, r * 0.7);
  } else if (type === 'ew') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, -0.8, 0.8);
    ctx.stroke();
  } else if (type === 'iris') {
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.45, r * 0.4);
    ctx.lineTo(-r * 0.45, r * 0.4);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(r * 0.22, 0);
    ctx.lineTo(0, r * 0.6);
    ctx.lineTo(-r * 0.22, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawObjectIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: ObjectType,
  alive: boolean,
  scale: number,
): void {
  const s = Math.max(10, Math.min(22, scale * 16));
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alive ? 1 : 0.35;
  ctx.fillStyle = '#101820';
  ctx.strokeStyle = alive ? '#e8edf3' : '#6a7380';
  ctx.lineWidth = 1.4;
  rounded(ctx, -s * 0.7, -s * 0.7, s * 1.4, s * 1.4, 4);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = typeColor(type);
  ctx.fillStyle = typeColor(type);
  ctx.lineWidth = 1.8;
  drawTypeMark(ctx, type, s * 0.42);
  ctx.restore();
}

function typeColor(type: ObjectType): string {
  switch (type) {
    case 'hq':
    case 'hq_reserve':
      return '#e2b93b';
    case 'airfield':
      return '#6aa7ff';
    case 'ammo':
      return '#ef6a57';
    case 'fuel':
      return '#c08af0';
    case 'rail':
      return '#9be8ff';
    case 'terminal':
      return '#41d3c4';
    case 'supply':
      return '#8dffa8';
    case 'staff':
      return '#e2b93b';
    case 'comms':
      return '#7ad0ff';
    case 'repair':
      return '#f0c36a';
    case 'training':
      return '#5fc07a';
    default:
      return '#e8edf3';
  }
}

function drawTypeMark(ctx: CanvasRenderingContext2D, type: ObjectType, r: number): void {
  ctx.beginPath();
  if (type === 'hq' || type === 'hq_reserve') {
    ctx.moveTo(0, -r);
    ctx.lineTo(r, r * 0.2);
    ctx.lineTo(r * 0.4, r * 0.2);
    ctx.lineTo(r * 0.4, r);
    ctx.lineTo(-r * 0.4, r);
    ctx.lineTo(-r * 0.4, r * 0.2);
    ctx.lineTo(-r, r * 0.2);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'airfield') {
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(-r * 0.2, -r * 0.5);
    ctx.lineTo(r * 0.6, 0);
    ctx.lineTo(-r * 0.2, r * 0.5);
    ctx.stroke();
  } else if (type === 'ammo') {
    ctx.rect(-r * 0.55, -r * 0.35, r * 1.1, r * 0.7);
    ctx.stroke();
  } else if (type === 'fuel') {
    ctx.arc(0, r * 0.15, r * 0.55, Math.PI, 0);
    ctx.lineTo(r * 0.55, r * 0.7);
    ctx.lineTo(-r * 0.55, r * 0.7);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'rail' || type === 'terminal') {
    ctx.moveTo(-r, -r * 0.2);
    ctx.lineTo(r, -r * 0.2);
    ctx.moveTo(-r, r * 0.25);
    ctx.lineTo(r, r * 0.25);
    ctx.stroke();
  } else if (type === 'comms') {
    ctx.arc(0, r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r * 0.3, r * 0.55, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
  } else if (type === 'staff') {
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.28, -r * 0.18);
    ctx.lineTo(r * 0.95, -r * 0.18);
    ctx.lineTo(r * 0.38, r * 0.18);
    ctx.lineTo(r * 0.58, r);
    ctx.lineTo(0, r * 0.45);
    ctx.lineTo(-r * 0.58, r);
    ctx.lineTo(-r * 0.38, r * 0.18);
    ctx.lineTo(-r * 0.95, -r * 0.18);
    ctx.lineTo(-r * 0.28, -r * 0.18);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'supply') {
    ctx.rect(-r * 0.6, -r * 0.45, r * 1.2, r * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.15);
    ctx.lineTo(-r * 0.2, r * 0.35);
    ctx.lineTo(r * 0.35, r * 0.35);
    ctx.stroke();
  } else if (type === 'repair') {
    ctx.moveTo(-r * 0.7, r * 0.2);
    ctx.lineTo(-r * 0.15, -r * 0.55);
    ctx.lineTo(r * 0.15, -r * 0.35);
    ctx.lineTo(r * 0.7, r * 0.35);
    ctx.stroke();
  } else if (type === 'training') {
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(0, r * 0.55);
    ctx.stroke();
  } else {
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
