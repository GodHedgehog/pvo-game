export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  int(maxExclusive: number): number {
    if (maxExclusive <= 0) return 0;
    return Math.floor(this.next() * maxExclusive);
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick empty');
    return arr[this.int(arr.length)]!;
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  getSeedState(): number {
    return this.state;
  }
}

export function chancePerSecond(rng: Rng, chance: number, dt: number): boolean {
  if (chance <= 0 || dt <= 0) return false;
  if (chance >= 1) return true;
  return rng.chance(1 - Math.pow(1 - chance, dt));
}
