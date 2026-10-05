export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;

  private audio(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    }
    return this.ctx;
  }

  beep(freq: number, dur = 0.08, vol = 0.04, type: OscillatorType = 'sine'): void {
    const c = this.audio();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.stop(c.currentTime + dur);
  }

  detect(): void {
    this.beep(880, 0.07, 0.03);
  }
  kill(): void {
    this.beep(520, 0.09, 0.04, 'triangle');
  }
  leak(): void {
    this.beep(180, 0.18, 0.05, 'sawtooth');
  }
}
