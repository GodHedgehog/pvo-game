import { OBJECTS, type ObjectDef } from '../data/objects';
import {
  EASY_ZONES,
  HARD_WEIGHT_MULT,
  HARD_WEIGHT_ZONES,
  getScenario,
  type Difficulty,
} from '../data/scenarios';
import { getMap } from '../data/geo';
import type { MapDef } from '../data/geo/types';
import { STARTING_MONEY, WAVE_COUNT } from '../data/waves';
import { makeProjector, pointInPolygon, project, projectRing } from './geo';
import { Rng } from './rng';
import type { CompiledMap, DefenseObject, World } from './types';

export const SIM_DT = 0.05;

function compileMap(def: MapDef): CompiledMap {
  const projector = makeProjector(def.projection.lon0, def.projection.lat0, def.projection.latRefDeg);
  const corners = [
    project(projector, def.view.minLon, def.view.maxLat),
    project(projector, def.view.maxLon, def.view.minLat),
  ];
  const landPts = [...def.layers.controlled, ...def.layers.occupied].flatMap((r) =>
    projectRing(projector, r.coordinates),
  );
  const landBounds = {
    minX: Math.min(...landPts.map((p) => p.x)),
    minY: Math.min(...landPts.map((p) => p.y)),
    maxX: Math.max(...landPts.map((p) => p.x)),
    maxY: Math.max(...landPts.map((p) => p.y)),
  };
  return {
    def,
    projector,
    sea: def.layers.sea.map((r) => projectRing(projector, r.coordinates)),
    occupied: def.layers.occupied.map((r) => projectRing(projector, r.coordinates)),
    controlled: def.layers.controlled.map((r) => projectRing(projector, r.coordinates)),
    foreign: def.layers.foreign.map((r) => projectRing(projector, r.coordinates)),
    other: (def.layers.other ?? []).map((r) => projectRing(projector, r.coordinates)),
    cities: def.cities.map((c) => ({
      name: c.name,
      major: c.major,
      ...project(projector, c.lon, c.lat),
    })),
    spawn: {
      drones: def.spawn.drones.map(([lo, la]) => project(projector, lo, la)),
      cruiseLand: def.spawn.cruiseLand.map(([lo, la]) => project(projector, lo, la)),
      cruiseSea: def.spawn.cruiseSea.map(([lo, la]) => project(projector, lo, la)),
      ballistic: def.spawn.ballistic.map(([lo, la]) => project(projector, lo, la)),
    },
    bounds: {
      minX: Math.min(corners[0]!.x, corners[1]!.x),
      minY: Math.min(corners[0]!.y, corners[1]!.y),
      maxX: Math.max(corners[0]!.x, corners[1]!.x),
      maxY: Math.max(corners[0]!.y, corners[1]!.y),
    },
    landBounds,
  };
}

function filterObjects(defs: ObjectDef[], difficulty: Difficulty): ObjectDef[] {
  if (difficulty === 'easy') return defs.filter((o) => EASY_ZONES.has(o.zone));
  return defs;
}

function makeObject(def: ObjectDef, map: CompiledMap, difficulty: Difficulty): DefenseObject {
  const p = project(map.projector, def.lon, def.lat);
  const inside = map.controlled.some((poly) => pointInPolygon(p, poly));
  if (!inside) {
    console.error(
      `Объект «${def.name}» (${def.id}) вне контролируемой территории: lon=${def.lon} lat=${def.lat}`,
    );
  }
  let weight = def.weight;
  if (difficulty === 'hard' && HARD_WEIGHT_ZONES.has(def.zone)) weight *= HARD_WEIGHT_MULT;
  return {
    id: def.id,
    name: def.name,
    type: def.type,
    region: def.region,
    zone: def.zone,
    x: p.x,
    y: p.y,
    hp: def.hp,
    maxHp: def.hp,
    weight,
    alive: true,
  };
}

export interface CreateWorldOpts {
  seed?: number;
  difficulty?: Difficulty;
  scenarioId?: string;
}

export function createWorld(opts: CreateWorldOpts = {}): World {
  const scenario = getScenario(opts.scenarioId ?? 'ukraine-shield');
  const map = compileMap(getMap(scenario.mapId));
  const difficulty = opts.difficulty ?? 'normal';
  let defs = filterObjects(OBJECTS, difficulty);
  if (scenario.objectFilter !== 'all') {
    const regions = new Set(scenario.objectFilter.regions);
    defs = defs.filter((o) => regions.has(o.region));
  }
  const objects = defs.map((d) => makeObject(d, map, difficulty));
  const seed = opts.seed ?? 1;
  return {
    seed,
    rng: new Rng(seed),
    time: 0,
    dt: SIM_DT,
    speed: 4,
    paused: false,
    phase: 'playing',
    difficulty,
    scenarioId: scenario.id,
    waveCount: scenario.endless ? Number.POSITIVE_INFINITY : scenario.waveCount || WAVE_COUNT,
    money: scenario.startingMoney || STARTING_MONEY,
    wave: 0,
    inWave: false,
    waveClock: 0,
    queue: [],
    units: [],
    objects,
    threats: [],
    interceptors: [],
    fx: [],
    logs: [],
    stats: { kills: 0, leaks: 0, lost: 0, wavesCleared: 0 },
    nextId: 1,
    map,
    detectFlags: {},
    endReason: '',
  };
}
