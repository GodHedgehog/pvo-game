import { t } from '../data/locales';
import type { LocaleKey } from '../data/locales';
import { REPAIR_HP, SELL_RATIO, UNIT_ORDER, UNITS, type UnitId } from '../data/units';
import { economyMods, refillCost } from '../sim/systems/economy';
import type { World } from '../sim/types';
import { unitIconSvg } from './unit-icons';

export interface UiRefs {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  money: HTMLElement;
  wave: HTMLElement;
  kills: HTMLElement;
  leaks: HTMLElement;
  objects: HTMLElement;
  detected: HTMLElement;
  pause: HTMLButtonElement;
  waveBtn: HTMLButtonElement;
  bar: HTMLElement;
  log: HTMLElement;
  sel: HTMLElement;
  hint: HTMLElement;
  startOv: HTMLElement;
  endOv: HTMLElement;
  endTitle: HTMLElement;
  endText: HTMLElement;
  scores: HTMLElement;
  tutText: HTMLElement;
  tutOv: HTMLElement;
}

export function mountUi(app: HTMLElement): UiRefs {
  app.innerHTML = `
    <canvas id="cv" aria-label="${t('gameTitle')}"></canvas>
    <div id="top">
      <span class="st">${t('budget')} <b id="mny">0</b></span>
      <span class="st">${t('wave')} <b id="wv">0/10</b></span>
      <span class="st">${t('shotDown')} <b id="kl">0</b></span>
      <span class="st">${t('leaked')} <b id="lk">0</b></span>
      <span class="st">${t('objects')} <b id="ob">0</b></span>
      <span class="st">${t('detected')} <b id="dt">0</b></span>
      <span class="sp">
        <button type="button" id="bPause">${t('pause')}</button>
        <button type="button" data-sp="1" aria-label="${t('speed')} 1">×1</button>
        <button type="button" data-sp="2" aria-label="${t('speed')} 2">×2</button>
        <button type="button" data-sp="4" class="on" aria-label="${t('speed')} 4">×4</button>
        <button type="button" id="bHelp" aria-label="${t('help')}">?</button>
        <button type="button" id="bSound" aria-label="${t('sound')}">${t('soundOn')}</button>
        <button type="button" id="bWave" class="pri">${t('waveStart')}</button>
      </span>
    </div>
    <div id="hint" hidden></div>
    <div id="log" aria-live="polite"></div>
    <div id="sel" hidden></div>
    <div id="bar" role="toolbar" aria-label="${t('placing')}"></div>
    <div class="ov" id="ovStart">
      <div class="box">
        <h1>${t('gameTitle')}</h1>
        <p>${t('gameSubtitle')}</p>
        <p>${t('rules')}</p>
        <p>${t('legend')}</p>
        <div class="row">
          <span>${t('difficulty')}</span>
          <button type="button" data-diff="easy">${t('diffEasy')}</button>
          <button type="button" data-diff="normal" class="on">${t('diffNormal')}</button>
          <button type="button" data-diff="hard">${t('diffHard')}</button>
        </div>
        <ul>
          <li>${t('menuRadar')}</li>
          <li>${t('menuLow')}</li>
          <li>${t('menuWeapons')}</li>
        </ul>
        <div class="row">
          <button type="button" class="pri" id="bStart">${t('start')}</button>
        </div>
        <h2>${t('best')}</h2>
        <div id="scores">${t('noBest')}</div>
      </div>
    </div>
    <div class="ov" id="ovTut" hidden>
      <div class="box">
        <h2>${t('help')}</h2>
        <p class="steps" id="tutText"></p>
        <div class="row">
          <button type="button" id="bTutSkip">${t('tutorialSkip')}</button>
          <button type="button" class="pri" id="bTutNext">${t('tutorialNext')}</button>
        </div>
      </div>
    </div>
    <div class="ov" id="ovEnd" hidden>
      <div class="box">
        <h2 id="endT"></h2>
        <p id="endP"></p>
        <button type="button" class="pri" id="bAgain">${t('again')}</button>
      </div>
    </div>
  `;
  const canvas = app.querySelector('#cv') as HTMLCanvasElement;
  const bar = app.querySelector('#bar') as HTMLElement;
  for (const id of UNIT_ORDER) {
    const u = UNITS[id];
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.tool = id;
    b.innerHTML = `${unitIconSvg(id)}<div><div class="n">${t(u.nameKey)} · <span data-cost="${id}">${u.cost}</span></div><div class="d">${t(u.descKey)}</div></div>`;
    bar.appendChild(b);
  }
  return {
    root: app,
    canvas,
    money: app.querySelector('#mny')!,
    wave: app.querySelector('#wv')!,
    kills: app.querySelector('#kl')!,
    leaks: app.querySelector('#lk')!,
    objects: app.querySelector('#ob')!,
    detected: app.querySelector('#dt')!,
    pause: app.querySelector('#bPause')!,
    waveBtn: app.querySelector('#bWave')!,
    bar,
    log: app.querySelector('#log')!,
    sel: app.querySelector('#sel')!,
    hint: app.querySelector('#hint')!,
    startOv: app.querySelector('#ovStart')!,
    endOv: app.querySelector('#ovEnd')!,
    endTitle: app.querySelector('#endT')!,
    endText: app.querySelector('#endP')!,
    scores: app.querySelector('#scores')!,
    tutText: app.querySelector('#tutText')!,
    tutOv: app.querySelector('#ovTut')!,
  };
}

export function updateHud(
  ui: UiRefs,
  world: World,
  tool: UnitId | null,
  sel: { kind: 'unit' | 'obj'; id: number | string } | null,
): void {
  const mods = economyMods(world);
  ui.money.textContent = String(Math.floor(world.money));
  ui.wave.textContent = Number.isFinite(world.waveCount)
    ? `${world.wave}/${world.waveCount}`
    : `${world.wave}/∞`;
  ui.kills.textContent = String(world.stats.kills);
  ui.leaks.textContent = String(world.stats.leaks);
  const alive = world.objects.filter((o) => o.alive).length;
  ui.objects.textContent = `${alive}/${world.objects.length}`;
  ui.detected.textContent = String(world.threats.filter((th) => th.detected).length);
  ui.waveBtn.disabled = world.inWave || world.phase !== 'playing' || world.wave >= world.waveCount;
  ui.waveBtn.textContent = world.inWave
    ? `${t('wave')} ${world.wave} — ${t('waveRunning')}`
    : t('waveStart');
  ui.pause.textContent = world.paused ? t('resume') : t('pause');
  ui.root.querySelectorAll<HTMLButtonElement>('[data-sp]').forEach((b) => {
    b.classList.toggle('on', Number(b.dataset.sp) === world.speed);
  });
  ui.bar.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((b) => {
    const id = b.dataset.tool as UnitId;
    const cost = mods.unitCost[id];
    const span = b.querySelector('[data-cost]');
    if (span) span.textContent = String(cost);
    b.classList.toggle('on', tool === id);
    b.setAttribute('aria-pressed', tool === id ? 'true' : 'false');
    b.disabled = world.money < cost || world.phase !== 'playing';
  });
  if (tool) {
    ui.hint.hidden = false;
    ui.hint.textContent = `${t('placing')}: ${t(UNITS[tool].nameKey)}. ${t('placeHint')}`;
  } else ui.hint.hidden = true;
  ui.canvas.classList.toggle('tool', !!tool);
  renderSel(ui, world, sel);
}

function renderSel(
  ui: UiRefs,
  world: World,
  sel: { kind: 'unit' | 'obj'; id: number | string } | null,
): void {
  if (!sel) {
    ui.sel.hidden = true;
    return;
  }
  ui.sel.hidden = false;
  if (sel.kind === 'unit') {
    const u = world.units.find((x) => x.id === sel.id);
    if (!u) {
      ui.sel.hidden = true;
      return;
    }
    const def = UNITS[u.type];
    const rc = refillCost(world, u.type);
    const sell = Math.round(def.cost * SELL_RATIO);
    ui.sel.innerHTML = `<h3>${t(def.nameKey)}</h3>
      <div class="m">${t(def.descKey)}${def.ammo !== undefined ? `<br>${t('ammo')}: <b>${u.ammo}/${def.ammo}</b>` : ''}</div>
      <div class="row">
        ${def.ammo !== undefined ? `<button type="button" data-a="refill" ${u.ammo >= def.ammo || world.money < rc ? 'disabled' : ''}>${t('refill')} ${rc}</button>` : ''}
        <button type="button" data-a="sell">${t('sell')} +${sell}</button>
      </div>`;
  } else {
    const o = world.objects.find((x) => x.id === sel.id);
    if (!o) {
      ui.sel.hidden = true;
      return;
    }
    const cost = economyMods(world).repairCost;
    ui.sel.innerHTML = `<h3>${o.name}</h3>
      <div class="m">${t(('type.' + o.type) as LocaleKey)} · ${o.region}<br>${t('hp')}: <b>${Math.round(o.hp)}/${o.maxHp}</b>${o.alive ? '' : ` (${t('destroyed')})`}</div>
      <div class="row"><button type="button" data-a="repair" ${!o.alive || o.hp >= o.maxHp || world.money < cost ? 'disabled' : ''}>${t('repair')} +${REPAIR_HP} / ${cost}</button></div>`;
  }
}

const shownLogs = new Set<number>();

export function resetLogDisplay(): void {
  shownLogs.clear();
}

export function pumpLog(ui: UiRefs, world: World, onTone: (tone: string) => void): void {
  for (const ev of world.logs) {
    if (shownLogs.has(ev.id)) continue;
    shownLogs.add(ev.id);
    const el = document.createElement('div');
    el.className = ev.tone;
    el.textContent = ev.text;
    ui.log.appendChild(el);
    onTone(ev.tone);
    window.setTimeout(() => el.remove(), 9000);
  }
  while (ui.log.children.length > 7) ui.log.removeChild(ui.log.firstChild!);
}
