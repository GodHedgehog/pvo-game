import './styles.css';
import { Sfx } from './audio/sfx';
import { addScore, loadScores } from './core/save';
import { advanceFixed, createFixedStep } from './core/loop';
import { loadSettings, saveSettings } from './core/settings';
import { t } from './data/locales';
import type { Difficulty } from './data/scenarios';
import { UNIT_ORDER, type UnitId } from './data/units';
import { Input } from './input/Input';
import { economyMods } from './sim/systems/economy';
import { Renderer } from './render/Renderer';
import { canPlace, placeUnit, refillUnit, repairObject, sellUnit } from './sim/commands';
import { startWave, stepWorld } from './sim/systems';
import { SIM_DT, createWorld } from './sim/World';
import type { World } from './sim/types';
import { mountUi, pumpLog, resetLogDisplay, updateHud } from './ui/hud';

const TUTORIAL = [t('tutorial1'), t('tutorial2'), t('tutorial3'), t('tutorial4')];

function scoresHtml(): string {
  const rows = loadScores();
  if (!rows.length) return t('noBest');
  return rows
    .map((r) => {
      const d = new Date(r.at).toLocaleDateString();
      return `<div>${r.win ? t('victory') : t('defeat')} · ${r.difficulty} · ${t('wave')} ${r.waves} · ${t('shotDown')} ${r.kills} · ${d}</div>`;
    })
    .join('');
}

function main(): void {
  const app = document.querySelector('#app');
  if (!app) throw new Error('#app missing');
  const ui = mountUi(app as HTMLElement);
  ui.scores.innerHTML = scoresHtml();

  const settings = loadSettings();
  const sfx = new Sfx();
  sfx.enabled = settings.sound;

  let difficulty: Difficulty = 'normal';
  let world: World = createWorld({ difficulty, seed: Date.now() >>> 0 });
  world.paused = true;
  world.phase = 'playing';

  const ctx = ui.canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  const renderer = new Renderer(ui.canvas, ctx);
  renderer.resize();
  renderer.cam.fit(world, renderer.w, renderer.h);

  let tool: UnitId | null = null;
  let sel: { kind: 'unit' | 'obj'; id: number | string } | null = null;
  let tutStep = 0;
  let scored = false;
  const step = createFixedStep(SIM_DT);

  const input = new Input(
    ui.canvas,
    renderer.cam,
    () => ({ w: renderer.w, h: renderer.h }),
    () => world,
    (sx, sy) => onClick(sx, sy),
    () => {
      tool = null;
      sync();
    },
  );

  function restart(seed?: number): void {
    world = createWorld({ difficulty, seed: seed ?? (Date.now() >>> 0) });
    world.paused = false;
    world.speed = 4;
    tool = null;
    sel = null;
    scored = false;
    renderer.cam.fit(world, renderer.w, renderer.h);
    ui.endOv.hidden = true;
    ui.log.innerHTML = '';
    resetLogDisplay();
    sync();
  }

  function maybeScore(): void {
    if (scored) return;
    if (world.phase !== 'victory' && world.phase !== 'defeat') return;
    scored = true;
    addScore({
      at: Date.now(),
      win: world.phase === 'victory',
      difficulty,
      waves: world.stats.wavesCleared,
      kills: world.stats.kills,
      leaks: world.stats.leaks,
      alive: world.objects.filter((o) => o.alive).length,
    });
    ui.endTitle.textContent = world.phase === 'victory' ? t('victory') : t('defeat');
    ui.endText.textContent = `${world.endReason} ${t('statsLine', {
      kills: world.stats.kills,
      leaks: world.stats.leaks,
      waves: world.stats.wavesCleared,
      alive: world.objects.filter((o) => o.alive).length,
    })}`;
    ui.endOv.hidden = false;
  }

  function onClick(sx: number, sy: number): void {
    const wpos = renderer.cam.toWorld(sx, sy, renderer.w, renderer.h);
    if (tool) {
      placeUnit(world, tool, wpos.x, wpos.y);
      sync();
      return;
    }
    let best: typeof sel = null;
    let bd = 18;
    for (const u of world.units) {
      const p = renderer.cam.toScreen(u.x, u.y, renderer.w, renderer.h);
      const d = Math.hypot(p.x - sx, p.y - sy);
      if (d < bd) {
        bd = d;
        best = { kind: 'unit', id: u.id };
      }
    }
    for (const o of world.objects) {
      const p = renderer.cam.toScreen(o.x, o.y, renderer.w, renderer.h);
      const d = Math.hypot(p.x - sx, p.y - sy);
      if (d < bd) {
        bd = d;
        best = { kind: 'obj', id: o.id };
      }
    }
    sel = best;
    sync();
  }

  function sync(): void {
    updateHud(ui, world, tool, sel);
    const soundBtn = ui.root.querySelector('#bSound') as HTMLButtonElement;
    soundBtn.textContent = sfx.enabled ? t('soundOn') : t('soundOff');
  }

  ui.bar.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b?.dataset.tool || b.disabled) return;
    const id = b.dataset.tool as UnitId;
    tool = tool === id ? null : id;
    sync();
  });
  ui.sel.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b || !sel) return;
    if (b.dataset.a === 'sell' && sel.kind === 'unit') {
      sellUnit(world, sel.id as number);
      sel = null;
    }
    if (b.dataset.a === 'refill' && sel.kind === 'unit') refillUnit(world, sel.id as number);
    if (b.dataset.a === 'repair' && sel.kind === 'obj') repairObject(world, String(sel.id));
    sync();
  });
  ui.root.querySelectorAll<HTMLButtonElement>('[data-sp]').forEach((b) => {
    b.addEventListener('click', () => {
      world.speed = Number(b.dataset.sp);
      sync();
    });
  });
  ui.pause.addEventListener('click', () => {
    if (world.phase !== 'playing') return;
    world.paused = !world.paused;
    sync();
  });
  ui.waveBtn.addEventListener('click', () => {
    startWave(world);
    sync();
  });
  ui.root.querySelector('#bHelp')!.addEventListener('click', () => {
    world.paused = true;
    tutStep = 0;
    ui.tutText.textContent = TUTORIAL[0]!;
    ui.tutOv.hidden = false;
    sync();
  });
  ui.root.querySelector('#bSound')!.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    settings.sound = sfx.enabled;
    saveSettings(settings);
    sync();
  });
  ui.root.querySelectorAll<HTMLButtonElement>('[data-diff]').forEach((b) => {
    b.addEventListener('click', () => {
      difficulty = b.dataset.diff as Difficulty;
      ui.root.querySelectorAll('[data-diff]').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    });
  });
  ui.root.querySelector('#bStart')!.addEventListener('click', () => {
    ui.startOv.hidden = true;
    tutStep = 0;
    ui.tutText.textContent = TUTORIAL[0]!;
    ui.tutOv.hidden = false;
    restart();
    world.paused = true;
    sync();
  });
  ui.root.querySelector('#bTutNext')!.addEventListener('click', () => {
    tutStep += 1;
    if (tutStep >= TUTORIAL.length) {
      ui.tutOv.hidden = true;
      world.paused = false;
      sync();
      return;
    }
    ui.tutText.textContent = TUTORIAL[tutStep]!;
  });
  ui.root.querySelector('#bTutSkip')!.addEventListener('click', () => {
    ui.tutOv.hidden = true;
    world.paused = false;
    sync();
  });
  ui.root.querySelector('#bAgain')!.addEventListener('click', () => {
    ui.startOv.hidden = false;
    ui.endOv.hidden = true;
    ui.scores.innerHTML = scoresHtml();
    world.paused = true;
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      tool = null;
      sync();
    }
    if (e.key === ' ' && world.phase === 'playing') {
      e.preventDefault();
      world.paused = !world.paused;
      sync();
    }
    if (e.key === 'Enter' && world.phase === 'playing') {
      startWave(world);
      sync();
    }
    const slot = Number(e.key) - 1;
    if (slot >= 0 && slot < UNIT_ORDER.length) {
      const id = UNIT_ORDER[slot]!;
      tool = tool === id ? null : id;
      sync();
    }
  });
  window.addEventListener('resize', () => renderer.resize());

  let last = performance.now();
  let hudAcc = 0;
  function frame(now: number): void {
    const real = Math.min(0.1, (now - last) / 1000);
    last = now;
    renderer.cam.update(real, settings.reducedMotion);
    advanceFixed(step, real, world.speed, world.paused || world.phase !== 'playing', (dt) => {
      stepWorld(world, dt);
      return world.phase !== 'playing';
    });
    hudAcc += real;
    if (hudAcc > 0.2) {
      hudAcc = 0;
      pumpLog(ui, world, (tone) => {
        if (tone === 'good') sfx.kill();
        if (tone === 'warn') sfx.detect();
        if (tone === 'bad') sfx.leak();
      });
      sync();
      maybeScore();
    }
    let ghost: { type: UnitId; x: number; y: number; ok: boolean } | null = null;
    if (tool && input.mouse.in) {
      const p = renderer.cam.toWorld(input.mouse.x, input.mouse.y, renderer.w, renderer.h);
      ghost = {
        type: tool,
        x: p.x,
        y: p.y,
        ok: canPlace(world, p.x, p.y) && world.money >= economyMods(world).unitCost[tool],
      };
    }
    renderer.draw(world, step.alpha, now, {
      sel,
      ghost,
      reducedMotion: settings.reducedMotion,
      showMinimap: true,
    });
    requestAnimationFrame(frame);
  }
  sync();
  requestAnimationFrame(frame);
}

main();
