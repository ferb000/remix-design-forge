/**
 * Procedural ambient architectural soundscape generator using Web Audio API.
 * Creates an ultra-deep, calming cinematic architectural drone with gentle chord resonance.
 */

class AmbientDroneGenerator {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private filter: BiquadFilterNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      // Gentle swell to comfortable ambient level
      this.masterGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 3.0);

      // Low-pass filter for velvety warmth
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Deep cinematic triad (D1, A1, D2, F#2)
      const freqs = [36.71, 55.0, 73.42, 92.5];

      this.oscillators = freqs.map((freq, idx) => {
        if (!this.ctx) return null as unknown as OscillatorNode;
        const osc = this.ctx.createOscillator();
        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        const oscGain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Detune slightly for lush chorus
        osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);

        oscGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

        if (panner) {
          panner.pan.setValueAtTime((idx - 1.5) * 0.4, this.ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(panner);
          panner.connect(this.filter!);
        } else {
          osc.connect(oscGain);
          oscGain.connect(this.filter!);
        }

        osc.start();
        return osc;
      }).filter(Boolean);

      this.isPlaying = true;
    } catch {
      // AudioContext could be blocked or unsupported
      this.isPlaying = false;
    }
  }

  public stop() {
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
        setTimeout(() => {
          this.oscillators.forEach(osc => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // ignore
            }
          });
          this.oscillators = [];
          this.isPlaying = false;
        }, 1300);
      } catch {
        this.isPlaying = false;
      }
    } else {
      this.isPlaying = false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundscape = new AmbientDroneGenerator();
