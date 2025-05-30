
import { useState, useCallback, useRef, useEffect } from 'react';
import { elevenLabsService } from '../services/elevenLabsService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useTextToSpeech = () => {
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthLabel, setShowAuthLabel] = useState(false);
  const { user } = useAuth();
  const currentTextRef = useRef<string>('');

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

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
      console.error('Speech synthesis error:', error);
      toast({
        variant: "destructive",
        title: "Speech Error",
        description: "Unable to play audio. Please try again."
      });
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
      toast({
        variant: "destructive",
        title: "No Content",
        description: "No text available to read."
      });
      return;
    }

    // Check browser support
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Text-to-speech is not supported in this browser."
      });
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
      
      // Clean text for better speech synthesis
      const cleanText = text
        .replace(/\[[\d\s,]+\]/g, '') // Remove citation numbers
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      await elevenLabsService.speak(cleanText);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsLoading(false);
      setIsReading(false);
      toast({
        variant: "destructive",
        title: "Speech Error", 
        description: "Failed to start text-to-speech. Please try again."
      });
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
