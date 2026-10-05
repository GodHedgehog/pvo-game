export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
  lang: string;
}

const KEY = 'sky-shield-settings';

export function defaultSettings(): Settings {
  const reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { sound: true, reducedMotion: reduced, lang: 'ru' };
}

export function loadSettings(): Settings {
  const base = defaultSettings();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...base, ...parsed, reducedMotion: base.reducedMotion };
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}
