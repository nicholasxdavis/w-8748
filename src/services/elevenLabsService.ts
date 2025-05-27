
interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model: string;
}

const config: ElevenLabsConfig = {
  apiKey: 'sk_a18c9fb46e43f32e5b3364dd7df27ae2fbb9c4854febb64a',
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
  model: 'eleven_turbo_v2_5'
};

export class ElevenLabsService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying = false;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async speak(text: string): Promise<void> {
    if (!text.trim()) {
      throw new Error('No text provided for speech synthesis');
    }

    try {
      this.stop(); // Stop any currently playing audio
      
      if (this.onStartCallback) {
        this.onStartCallback();
      }

      const audioBuffer = await this.generateSpeech(text);
      await this.playAudio(audioBuffer);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      throw error;
    }
  }

  private async generateSpeech(text: string): Promise<ArrayBuffer> {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + config.voiceId, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': config.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: config.model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return await response.arrayBuffer();
  }

  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      await this.initAudioContext();
    }

    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);
      
      this.currentSource.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.isPlaying = true;
      this.currentSource.start(0);
    } catch (error) {
      this.isPlaying = false;
      throw new Error(`Audio playback error: ${error}`);
    }
  }

  stop(): void {
    if (this.currentSource && this.isPlaying) {
      this.currentSource.stop();
      this.currentSource = null;
      this.isPlaying = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
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
