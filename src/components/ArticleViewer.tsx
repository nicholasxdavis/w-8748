import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "./ShareModal";
import { useArticleViewer } from "../hooks/useArticleViewer";
import { useArticleNavigation } from "../hooks/useArticleNavigation";
import { useArticleInteractions } from "../hooks/useArticleInteractions";
import { useTypingAnimation } from "../hooks/useTypingAnimation";
import SwipeableArticle from "./article/SwipeableArticle";
import LoadingArticle from "./article/LoadingArticle";
import { markContentAsViewed } from "../services/contentService";

const ArticleViewer = ({ articles: initialArticles, onArticleChange }) => {
  const {
    articles,
    currentIndex,
    setCurrentIndex,
    isVisible,
    setIsVisible,
    displayedText,
    setDisplayedText,
    progress,
    setProgress,
    isLoading,
    isTextFullyLoaded,
    setIsTextFullyLoaded,
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
  } = useArticleViewer(initialArticles);

  const [showShare, setShowShare] = useState(false);

  // Use custom hooks
  useArticleNavigation(articles, currentIndex, setCurrentIndex, setIsVisible, containerRef);
  
  const {
    handleTextToSpeech,
    handleWikipediaRedirect,
    handleContentClick: baseHandleContentClick,
    isReading,
    speechLoading,
    stop
  } = useArticleInteractions(currentArticle, showFullText);

  useTypingAnimation(
    isVisible,
    currentArticle,
    isTextFullyLoaded,
    isTypingPaused,
    setDisplayedText,
    setProgress,
    typingIntervalRef
  );

  // Enhanced content click handler
  const handleContentClick = useCallback(() => {
    baseHandleContentClick(clickCountRef, doubleClickTimeoutRef);
  }, [baseHandleContentClick]);

  // Hide double-tap hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDoubleTapHint(false), 3000);
    return () => clearTimeout(timer);
  }, [setShowDoubleTapHint]);

  // Enhanced article change effect with view tracking
  useEffect(() => {
    setIsVisible(true);
    
    // Mark current article as viewed for better future randomization
    if (currentArticle) {
      markContentAsViewed(currentArticle);
    }
    
    // Immediately show full content without typing animation
    if (currentArticle?.content) {
      setDisplayedText(currentArticle.content);
      setProgress(100);
      setIsTextFullyLoaded(true);
    } else {
      setDisplayedText("");
      setProgress(0);
      setIsTextFullyLoaded(false);
    }
    
    setIsTypingPaused(false);
    clickCountRef.current = 0;
    onArticleChange(currentArticle);

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (isReading) stop();
    if (currentIndex >= articles.length - 2) loadMoreArticles();
  }, [currentIndex, currentArticle, onArticleChange, articles.length, loadMoreArticles, isReading, stop, setIsVisible, setDisplayedText, setProgress, setIsTextFullyLoaded, setIsTypingPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (doubleClickTimeoutRef.current) clearTimeout(doubleClickTimeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [stop]);

  return (
    <>
      <main ref={containerRef} className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth overflow-x-hidden">
        <AnimatePresence>
          {articles.map((article, index) => (
            <SwipeableArticle
              key={`article-${article.id}-${index}`}
              article={article}
              index={index}
              currentIndex={currentIndex}
              displayedText={displayedText}
              progress={progress}
              isVisible={isVisible}
              showDoubleTapHint={showDoubleTapHint}
              handleContentClick={handleContentClick}
              handleWikipediaRedirect={handleWikipediaRedirect}
              handleTextToSpeech={handleTextToSpeech}
              isReading={isReading}
              speechLoading={speechLoading}
              setShowShare={setShowShare}
            />
          ))}
        </AnimatePresence>
        
        {isLoading && <LoadingArticle />}
      </main>

      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        title={currentArticle?.title || ''} 
        articleId={String(currentArticle?.id || '')} 
      />
    </>
  );
};

export default ArticleViewer;
