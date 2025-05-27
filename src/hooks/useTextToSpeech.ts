
import { useState, useCallback, useRef, useEffect } from 'react';
import { elevenLabsService } from '../services/elevenLabsService';
import { useToast } from '@/hooks/use-toast';

export const useTextToSpeech = () => {
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
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
      toast({
        title: "Speech Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    });

    return () => {
      elevenLabsService.stop();
    };
  }, [toast]);

  const speak = useCallback(async (text: string) => {
    if (!text?.trim()) {
      toast({
        title: "No content available",
        description: "This article doesn't have content to read aloud.",
        variant: "destructive",
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
      await elevenLabsService.speak(text);
      
      toast({
        title: "Reading aloud",
        description: "Article is being read with ElevenLabs voice.",
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsLoading(false);
      toast({
        title: "Speech error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    }
  }, [isReading, toast]);

  const stop = useCallback(() => {
    elevenLabsService.stop();
    currentTextRef.current = '';
  }, []);

  return {
    speak,
    stop,
    isReading,
    isLoading
  };
};
