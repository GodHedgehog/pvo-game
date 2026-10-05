import type { LogTone, World } from './types';
import { nextId } from './types';

export function pushLog(world: World, text: string, tone: LogTone): void {
  world.logs.push({ id: nextId(world), text, tone, t: world.time });
  if (world.logs.length > 40) world.logs.splice(0, world.logs.length - 40);
}
