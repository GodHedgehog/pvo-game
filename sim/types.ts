import type { ObjectType } from '../data/objects';
import type { Difficulty } from '../data/scenarios';
import type { ThreatCategory } from '../data/threats';
import type { UnitId } from '../data/units';
import type { MapDef } from '../data/geo/types';
import type { Rng } from './rng';
import type { Projector, Vec2 } from './geo';

export type GamePhase = 'menu' | 'playing' | 'victory' | 'defeat';

export interface DefenseObject {
  id: string;
  name: string;
  type: ObjectType;
  region: string;
  zone: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  weight: number;
  alive: boolean;
}

export interface Unit {
  id: number;
  type: UnitId;
  x: number;
  y: number;
  region: string;
  ammo: number;
  cooldown: number;
}

export interface Threat {
  id: number;
  typeId: string;
  category: ThreatCategory;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  heading: number;
  speedKps: number;
  targetId: string | null;
  detected: boolean;
  assigned: number;
  trail: Vec2[];
  trailAcc: number;
  dead: boolean;
  jammed: boolean;
}

export interface Interceptor {
  id: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  threatId: number;
  speedKps: number;
  pk: number;
  color: string;
  done: boolean;
}

export interface FxRing {
  kind: 'ring';
  x: number;
  y: number;
  r0: number;
  r1: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface FxLine {
  kind: 'line';
  x: number;
  y: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  color: string;
}

export type Fx = FxRing | FxLine;

export type LogTone = 'info' | 'warn' | 'good' | 'bad';

export interface LogEvent {
  id: number;
  text: string;
  tone: LogTone;
  t: number;
}

export interface SpawnJob {
  t: number;
  typeId: string;
}

export interface WorldStats {
  kills: number;
  leaks: number;
  lost: number;
  wavesCleared: number;
}

export interface CompiledMap {
  def: MapDef;
  projector: Projector;
  sea: Vec2[][];
  occupied: Vec2[][];
  controlled: Vec2[][];
  foreign: Vec2[][];
  other: Vec2[][];
  cities: { name: string; x: number; y: number; major: boolean }[];
  spawn: {
    drones: Vec2[];
    cruiseLand: Vec2[];
    cruiseSea: Vec2[];
    ballistic: Vec2[];
  };
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  landBounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface World {
  seed: number;
  rng: Rng;
  time: number;
  dt: number;
  speed: number;
  paused: boolean;
  phase: GamePhase;
  difficulty: Difficulty;
  scenarioId: string;
  waveCount: number;
  money: number;
  wave: number;
  inWave: boolean;
  waveClock: number;
  queue: SpawnJob[];
  units: Unit[];
  objects: DefenseObject[];
  threats: Threat[];
  interceptors: Interceptor[];
  fx: Fx[];
  logs: LogEvent[];
  stats: WorldStats;
  nextId: number;
  map: CompiledMap;
  detectFlags: Record<string, boolean>;
  endReason: string;
}

export function liveObjects(world: World): DefenseObject[] {
  return world.objects.filter((o) => o.alive);
}

export function nextId(world: World): number {
  world.nextId += 1;
  return world.nextId;
}
