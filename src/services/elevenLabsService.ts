
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
  private currentText = '';
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
      this.speechSynthesis = window.speechSynthesis;
      this.isInitialized = true;
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
    if (!this.isInitialized || !text.trim()) {
      throw new Error('Service not initialized or no text provided');
    }

    // Store current text for reference
    this.currentText = text;

    try {
      // Always stop any current playback first
      this.stop();
      
      console.log('Starting TTS for text:', text.substring(0, 50) + '...');
      
      if (this.onStartCallback) {
        this.onStartCallback();
      }

      // Try ElevenLabs first
      try {
        const audioBuffer = await this.generateSpeech(text);
        await this.playAudio(audioBuffer);
        this.isUsingFallback = false;
        console.log('ElevenLabs TTS completed successfully');
      } catch (elevenLabsError) {
        console.warn('ElevenLabs failed, falling back to browser TTS:', elevenLabsError);
        // Fall back to browser text-to-speech
        await this.fallbackToWebSpeech(text);
        this.isUsingFallback = true;
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      this.isPlaying = false;
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

    // Cancel any existing speech first
    this.speechSynthesis.cancel();
    
    // Wait a bit for the cancel to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      try {
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Configure the utterance
        this.currentUtterance.rate = 0.9;
        this.currentUtterance.pitch = 1;
        this.currentUtterance.volume = 1;
        
        // Try to use a female voice if available
        const voices = this.speechSynthesis.getVoices();
        if (voices.length === 0) {
          // Voices might not be loaded yet, wait a bit
          setTimeout(() => {
            const newVoices = this.speechSynthesis!.getVoices();
            this.setVoice(newVoices);
          }, 100);
        } else {
          this.setVoice(voices);
        }

        this.currentUtterance.onstart = () => {
          this.isPlaying = true;
          console.log('Browser TTS started');
          resolve();
        };

        this.currentUtterance.onend = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
          console.log('Browser TTS ended');
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };

        this.currentUtterance.onerror = (event) => {
          this.isPlaying = false;
          this.currentUtterance = null;
          console.error('Browser TTS error:', event);
          
          // Don't treat 'interrupted' as a real error if we're stopping intentionally
          if (event.error === 'interrupted' && !this.isPlaying) {
            resolve(); // Resolve instead of reject for interruptions
            return;
          }
          
          reject(new Error(`Browser TTS error: ${event.error}`));
        };

        this.currentUtterance.onpause = () => {
          console.log('Browser TTS paused');
        };

        this.currentUtterance.onresume = () => {
          console.log('Browser TTS resumed');
        };

        this.isPlaying = true;
        this.speechSynthesis.speak(this.currentUtterance);
        
        // Timeout fallback in case onstart never fires
        setTimeout(() => {
          if (this.isPlaying && this.currentUtterance) {
            resolve();
          }
        }, 500);
        
      } catch (error) {
        this.isPlaying = false;
        this.currentUtterance = null;
        reject(error);
      }
    });
  }

  private setVoice(voices: SpeechSynthesisVoice[]) {
    if (!this.currentUtterance || !voices.length) return;
    
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('sarah') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('alice') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('susan')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (femaleVoice) {
      this.currentUtterance.voice = femaleVoice;
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
    console.log('Stopping TTS playback');
    
    // Stop ElevenLabs audio
    if (this.currentSource && this.isPlaying) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (error) {
        // Ignore errors when stopping (might already be stopped)
        console.warn('Error stopping audio source:', error);
      }
      this.currentSource = null;
    }

    // Stop browser TTS
    if (this.speechSynthesis && (this.currentUtterance || this.speechSynthesis.speaking)) {
      try {
        this.speechSynthesis.cancel();
      } catch (error) {
        console.warn('Error canceling speech synthesis:', error);
      }
      this.currentUtterance = null;
    }

    // Update state
    if (this.isPlaying) {
      this.isPlaying = false;
      this.currentText = '';
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }

  getIsPlaying(): boolean {
    // Double-check with browser API for browser TTS
    if (this.isUsingFallback && this.speechSynthesis) {
      const actuallyPlaying = this.speechSynthesis.speaking && !this.speechSynthesis.paused;
      if (this.isPlaying !== actuallyPlaying) {
        this.isPlaying = actuallyPlaying;
      }
    }
    return this.isPlaying;
  }

  getIsUsingFallback(): boolean {
    return this.isUsingFallback;
  }

  getCurrentText(): string {
    return this.currentText;
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
