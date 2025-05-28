
import { useState, useRef, useCallback } from 'react';
import { getMixedContent } from '../services/contentService';

export const useArticleViewer = (initialArticles: any[]) => {
  const [articles, setArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTextFullyLoaded, setIsTextFullyLoaded] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showDoubleTapHint, setShowDoubleTapHint] = useState(true);
  const [isTypingPaused, setIsTypingPaused] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentArticle = articles[currentIndex];

  const loadMoreArticles = useCallback(async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const newArticles = await getMixedContent(6);
      setArticles(prev => [...prev, ...newArticles]);
    } catch (error) {
      console.error("Failed to load more content", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const showFullText = useCallback(() => {
    if (currentArticle?.content && !isTextFullyLoaded) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setDisplayedText(currentArticle.content);
      setProgress(100);
      setIsTextFullyLoaded(true);
      setIsTypingPaused(false);
    }
  }, [currentArticle?.content, isTextFullyLoaded]);

  return {
    articles,
    setArticles,
    currentIndex,
    setCurrentIndex,
    isVisible,
    setIsVisible,
    displayedText,
    setDisplayedText,
    progress,
    setProgress,
    isLoading,
    setIsLoading,
    isTextFullyLoaded,
    setIsTextFullyLoaded,
    showActionButtons,
    setShowActionButtons,
    showDoubleTapHint,
    setShowDoubleTapHint,
    isTypingPaused,
    setIsTypingPaused,
    containerRef,
    clickCountRef,
    doubleClickTimeoutRef,
    typingIntervalRef,
    currentArticle,
    loadMoreArticles,
    showFullText
  };
};
