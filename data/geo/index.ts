import { UKRAINE_MAP } from './ukraine';
import type { MapDef } from './types';

const MAPS: Record<string, MapDef> = {
  [UKRAINE_MAP.id]: UKRAINE_MAP,
};

export function getMap(id: string): MapDef {
  const map = MAPS[id];
  if (!map) throw new Error(`Unknown map: ${id}`);
  return map;
}

export function registerMap(map: MapDef): void {
  MAPS[map.id] = map;
}

export function listMaps(): MapDef[] {
  return Object.values(MAPS);
}
