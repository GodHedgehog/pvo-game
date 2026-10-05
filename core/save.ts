export interface ScoreRow {
  at: number;
  win: boolean;
  difficulty: string;
  waves: number;
  kills: number;
  leaks: number;
  alive: number;
}

const KEY = 'sky-shield-scores';

export function loadScores(): ScoreRow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addScore(row: ScoreRow): ScoreRow[] {
  const all = [...loadScores(), row]
    .sort((a, b) => {
      if (a.win !== b.win) return a.win ? -1 : 1;
      if (b.waves !== a.waves) return b.waves - a.waves;
      return b.kills - a.kills;
    })
    .slice(0, 8);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  return all;
}
