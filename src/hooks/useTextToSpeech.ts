
import { useState, useCallback, useRef, useEffect } from 'react';
import { elevenLabsService } from '../services/elevenLabsService';
import { useAuth } from '@/hooks/useAuth';

export const useTextToSpeech = () => {
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthLabel, setShowAuthLabel] = useState(false);
  const { user } = useAuth();
  const currentTextRef = useRef<string>('');
  const isStoppingRef = useRef(false);

  useEffect(() => {
    elevenLabsService.onStart(() => {
      if (!isStoppingRef.current) {
        setIsReading(true);
        setIsLoading(false);
        console.log('TTS started successfully');
      }
    });

    elevenLabsService.onEnd(() => {
      setIsReading(false);
      setIsLoading(false);
      isStoppingRef.current = false;
      console.log('TTS ended');
    });

    elevenLabsService.onError((error) => {
      setIsReading(false);
      setIsLoading(false);
      isStoppingRef.current = false;
      console.error('TTS error in hook:', error);
    });

    // Cleanup function
    return () => {
      elevenLabsService.stop();
    };
  }, []);

  // Periodic check to sync state with actual service state
  useEffect(() => {
    const interval = setInterval(() => {
      const actuallyPlaying = elevenLabsService.getIsPlaying();
      if (isReading !== actuallyPlaying && !isLoading) {
        console.log(`State sync: isReading ${isReading} -> ${actuallyPlaying}`);
        setIsReading(actuallyPlaying);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReading, isLoading]);

  const speak = useCallback(async (text: string) => {
    if (!user) {
      setShowAuthLabel(true);
      setTimeout(() => setShowAuthLabel(false), 2000);
      return;
    }

    if (!text?.trim()) {
      console.warn('No text provided for TTS');
      return;
    }

    // If already reading the same text, stop instead of starting again
    if (isReading && currentTextRef.current === text) {
      console.log('Stopping current TTS playback');
      isStoppingRef.current = true;
      elevenLabsService.stop();
      return;
    }

    // If reading different text, stop current and start new
    if (isReading) {
      console.log('Switching to new text, stopping current playback');
      elevenLabsService.stop();
      // Small delay to ensure stop completes
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      console.log('Starting TTS for new text:', text.substring(0, 50) + '...');
      setIsLoading(true);
      isStoppingRef.current = false;
      currentTextRef.current = text;
      
      await elevenLabsService.speak(text);
    } catch (error) {
      console.error('Text-to-speech error in hook:', error);
      setIsLoading(false);
      setIsReading(false);
      isStoppingRef.current = false;
    }
  }, [isReading, user]);

  const stop = useCallback(() => {
    console.log('Manual stop requested');
    isStoppingRef.current = true;
    elevenLabsService.stop();
    currentTextRef.current = '';
  }, []);

  return {
    speak,
    stop,
    isReading,
    isLoading,
    showAuthLabel
  };
};
