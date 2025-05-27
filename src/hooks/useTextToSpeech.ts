
import { useState, useCallback, useRef, useEffect } from 'react';
import { elevenLabsService } from '../services/elevenLabsService';
import { useAuth } from '@/hooks/useAuth';

export const useTextToSpeech = () => {
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthLabel, setShowAuthLabel] = useState(false);
  const { user } = useAuth();
  const currentTextRef = useRef<string>('');

  useEffect(() => {
    elevenLabsService.onStart(() => {
      setIsReading(true);
      setIsLoading(false);
    });

    elevenLabsService.onEnd(() => {
      setIsReading(false);
      setIsLoading(false);
    });

    elevenLabsService.onError((error) => {
      setIsReading(false);
      setIsLoading(false);
    });

    return () => {
      elevenLabsService.stop();
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!user) {
      setShowAuthLabel(true);
      setTimeout(() => setShowAuthLabel(false), 2000);
      return;
    }

    if (!text?.trim()) {
      return;
    }

    // If already reading, stop instead of starting again
    if (isReading) {
      elevenLabsService.stop();
      return;
    }

    try {
      setIsLoading(true);
      currentTextRef.current = text;
      await elevenLabsService.speak(text);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsLoading(false);
    }
  }, [isReading, user]);

  const stop = useCallback(() => {
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
