
import { useEffect } from 'react';

export const useTypingAnimation = (
  isVisible: boolean,
  currentArticle: any,
  isTextFullyLoaded: boolean,
  isTypingPaused: boolean,
  setDisplayedText: (text: string) => void,
  setProgress: (progress: number) => void,
  typingIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  useEffect(() => {
    // Immediately show full content without typing animation
    if (isVisible && currentArticle?.content && !isTextFullyLoaded) {
      setDisplayedText(currentArticle.content);
      setProgress(100);
    }
    
    // Clear any existing typing intervals since we're showing content immediately
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, [isVisible, currentArticle?.content, isTextFullyLoaded, setDisplayedText, setProgress, typingIntervalRef]);
};
