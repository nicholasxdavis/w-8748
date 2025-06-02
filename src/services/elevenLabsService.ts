
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
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private isUsingFallback = false;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
      this.speechSynthesis = window.speechSynthesis;
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
      // Always stop any current playback first
      this.stop();
      
      if (this.onStartCallback) {
        this.onStartCallback();
      }

      // Try ElevenLabs first
      try {
        const audioBuffer = await this.generateSpeech(text);
        await this.playAudio(audioBuffer);
        this.isUsingFallback = false;
      } catch (elevenLabsError) {
        console.warn('ElevenLabs failed, falling back to browser TTS:', elevenLabsError);
        // Fall back to browser text-to-speech
        await this.fallbackToWebSpeech(text);
        this.isUsingFallback = true;
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      throw error;
    }
  }

  private async fallbackToWebSpeech(text: string): Promise<void> {
    if (!this.speechSynthesis) {
      throw new Error('Browser speech synthesis not available');
    }

    return new Promise((resolve, reject) => {
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Configure the utterance
      this.currentUtterance.rate = 0.9;
      this.currentUtterance.pitch = 1;
      this.currentUtterance.volume = 1;
      
      // Try to use a female voice if available
      const voices = this.speechSynthesis!.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('sarah') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('alice')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (femaleVoice) {
        this.currentUtterance.voice = femaleVoice;
      }

      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
        resolve();
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
        reject(new Error(`Browser TTS error: ${event.error}`));
      };

      this.isPlaying = true;
      this.speechSynthesis!.speak(this.currentUtterance);
    });
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
    // Stop ElevenLabs audio
    if (this.currentSource && this.isPlaying) {
      try {
        this.currentSource.stop();
      } catch (error) {
        // Ignore errors when stopping (might already be stopped)
      }
      this.currentSource = null;
    }

    // Stop browser TTS
    if (this.speechSynthesis && this.currentUtterance) {
      this.speechSynthesis.cancel();
      this.currentUtterance = null;
    }

    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsUsingFallback(): boolean {
    return this.isUsingFallback;
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
