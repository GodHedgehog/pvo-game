import { ru, type LocaleKey, type LocaleTable } from './ru';

const tables: Record<string, LocaleTable> = { ru };

let lang = 'ru';

export function setLang(code: string): void {
  if (tables[code]) lang = code;
}

export function t(key: LocaleKey, vars?: Record<string, string | number>): string {
  const table = tables[lang] ?? ru;
  let s: string = table[key] ?? ru[key] ?? String(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export function registerLocale(code: string, table: LocaleTable): void {
  tables[code] = table;
}
