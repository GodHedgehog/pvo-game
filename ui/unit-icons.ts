import type { UnitId } from '../data/units';
import { UNITS } from '../data/units';

const PATH: Record<UnitId, string> = {
  mog: '<rect x="9" y="9" width="14" height="14" rx="2"/>',
  ew: '<circle cx="16" cy="16" r="4"/><path d="M20 12.5a7 7 0 0 1 0 7" fill="none" stroke="currentColor"/>',
  iris: '<path d="M16 6l8 16H8z"/>',
  patriot: '<path d="M16 5l4 11-4 11-4-11z"/>',
  radar: '<path d="M16 16h8" fill="none" stroke="currentColor"/><path d="M16 10a10 10 0 0 1 7 10" fill="none" stroke="currentColor"/>',
  aew: '<path d="M26 16L8 22l4-6-4-6z"/>',
};

export function unitIconSvg(id: UnitId): string {
  const color = UNITS[id].color;
  return `<svg class="ico" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="#0f1822" stroke="${color}" stroke-width="2"/>
    <g fill="${color}" stroke="${color}" stroke-width="1.6">${PATH[id]}</g>
  </svg>`;
}
