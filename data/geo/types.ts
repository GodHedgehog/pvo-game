export type LonLat = readonly [lon: number, lat: number];

export interface GeoRing {
  type: 'Polygon';
  coordinates: LonLat[];
}

export interface GeoCity {
  id: string;
  name: string;
  lon: number;
  lat: number;
  major: boolean;
}

export interface SpawnSet {
  drones: LonLat[];
  cruiseLand: LonLat[];
  cruiseSea: LonLat[];
  ballistic: LonLat[];
}

export interface MapDef {
  id: string;
  nameKey: string;
  projection: {
    lon0: number;
    lat0: number;
    latRefDeg: number;
  };
  view: {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
    gridStep: number;
  };
  layers: {
    sea: GeoRing[];
    occupied: GeoRing[];
    controlled: GeoRing[];
    foreign: GeoRing[];
    /** Neighboring land (Belarus, etc.) — visual only, not playable. */
    other?: GeoRing[];
  };
  cities: GeoCity[];
  spawn: SpawnSet;
}

export interface ScenarioDef {
  id: string;
  nameKey: string;
  mapId: string;
  objectFilter: 'all' | { regions: readonly string[] };
  startingMoney: number;
  waveCount: number;
  /** If true, waves never end and victory is disabled. */
  endless?: boolean;
}
