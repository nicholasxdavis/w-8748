
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
    if (!isVisible || !currentArticle?.content || isTextFullyLoaded || isTypingPaused) return;
    
    let currentChar = 0;
    const text = currentArticle.content;
    const totalChars = text.length;
    const typingSpeed = Math.max(5, Math.min(30, 2000 / totalChars));
    
    typingIntervalRef.current = setInterval(() => {
      if (currentChar <= totalChars && !isTypingPaused) {
        const newText = text.slice(0, currentChar);
        setDisplayedText(newText);
        setProgress(currentChar / totalChars * 100);
        currentChar += Math.ceil(typingSpeed / 5);
      } else if (currentChar > totalChars) {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;
        // Note: setIsTextFullyLoaded would need to be passed as a parameter if needed
      }
    }, typingSpeed);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [isVisible, currentArticle?.content, isTextFullyLoaded, isTypingPaused, setDisplayedText, setProgress, typingIntervalRef]);
};
