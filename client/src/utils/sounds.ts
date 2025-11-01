// Sound effects using Web Audio API
class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  // Game sounds
  unitSelect() {
    this.playTone(440, 0.1, 'sine');
  }

  unitMove() {
    this.playTone(330, 0.15, 'triangle');
  }

  attack() {
    this.playTone(200, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.15, 'sawtooth'), 50);
  }

  damage() {
    this.playTone(100, 0.3, 'sawtooth');
  }

  victory() {
    this.playTone(523, 0.15, 'sine'); // C
    setTimeout(() => this.playTone(659, 0.15, 'sine'), 150); // E
    setTimeout(() => this.playTone(784, 0.3, 'sine'), 300); // G
  }

  defeat() {
    this.playTone(400, 0.15, 'sawtooth');
    setTimeout(() => this.playTone(350, 0.15, 'sawtooth'), 150);
    setTimeout(() => this.playTone(300, 0.3, 'sawtooth'), 300);
  }

  buttonClick() {
    this.playTone(600, 0.08, 'square');
  }

  commitMoves() {
    this.playTone(500, 0.1, 'sine');
    setTimeout(() => this.playTone(600, 0.1, 'sine'), 100);
  }

  turnComplete() {
    this.playTone(400, 0.1, 'triangle');
    setTimeout(() => this.playTone(500, 0.2, 'triangle'), 100);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();