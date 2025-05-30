
interface SpeechConfig {
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export class ElevenLabsService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;
  private config: SpeechConfig = {
    rate: 1,
    pitch: 1,
    volume: 1
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      throw new Error('Speech synthesis not supported in this browser');
    }
  }

  async speak(text: string): Promise<void> {
    if (!text.trim()) {
      throw new Error('No text provided for speech synthesis');
    }

    try {
      // Stop any current speech
      this.stop();
      
      // Create new utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      this.currentUtterance.rate = this.config.rate;
      this.currentUtterance.pitch = this.config.pitch;
      this.currentUtterance.volume = this.config.volume;
      
      // Set voice if available
      if (this.config.voice) {
        this.currentUtterance.voice = this.config.voice;
      }

      // Set up event listeners
      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
        if (this.onStartCallback) {
          this.onStartCallback();
        }
      };

      this.currentUtterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.currentUtterance.onerror = (event) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        const error = new Error(`Speech synthesis error: ${event.error}`);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      };

      // Start speaking
      this.synthesis.speak(this.currentUtterance);
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      throw error;
    }
  }

  stop(): void {
    if (this.synthesis && this.isPlaying) {
      this.synthesis.cancel();
      this.isPlaying = false;
      this.currentUtterance = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  setVoice(voice: SpeechSynthesisVoice): void {
    this.config.voice = voice;
  }

  setRate(rate: number): void {
    this.config.rate = Math.max(0.1, Math.min(2, rate));
  }

  setPitch(pitch: number): void {
    this.config.pitch = Math.max(0, Math.min(2, pitch));
  }

  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }
}

export const elevenLabsService = new ElevenLabsService();
