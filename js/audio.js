export class Sfx {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.22 : 0;
  }

  tone(freq, dur, type = 'square', vol = 0.25, slideTo = null, delay = 0) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  doorChime() {
    this.tone(880, 0.16, 'sine', 0.3);
    this.tone(660, 0.22, 'sine', 0.26, null, 0.14);
  }

  doorWarning() {
    this.tone(1040, 0.09, 'square', 0.18);
    this.tone(1040, 0.09, 'square', 0.16, null, 0.13);
  }

  bell() {
    this.tone(1320, 0.35, 'sine', 0.22);
    this.tone(1980, 0.3, 'sine', 0.1);
  }

  horn() {
    this.tone(220, 0.5, 'sawtooth', 0.24);
    this.tone(277, 0.5, 'sawtooth', 0.18);
  }

  buzz() {
    this.tone(130, 0.3, 'square', 0.24);
  }

  chime() {
    this.tone(1046, 0.18, 'triangle', 0.28);
    this.tone(1568, 0.18, 'triangle', 0.22, null, 0.16);
    this.tone(2093, 0.3, 'triangle', 0.16, null, 0.32);
  }
}
