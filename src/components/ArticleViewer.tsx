import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";
import { Compass, Menu, X, Loader2 } from "lucide-react";
import { isNewsArticle } from "../services/contentService";
import ShareModal from "./ShareModal";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSaveArticle } from "@/hooks/useSaveArticle";
import { useNavigate, useLocation } from "react-router-dom";
import { useArticleViewer } from "../hooks/useArticleViewer";
import { getArticleImage } from "../utils/articleHelpers";
import BreakingNewsBadge from "./article/BreakingNewsBadge";
import DoubleTapHint from "./article/DoubleTapHint";
import ActionButtons from "./article/ActionButtons";
import ArticleContent from "./article/ArticleContent";

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
  } = useArticleViewer(initialArticles);

  const [showShare, setShowShare] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { toast } = useToast();
  const { speak, stop, isReading, isLoading: speechLoading } = useTextToSpeech();
  const { toggleSave } = useSaveArticle();

  // Hide double-tap hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDoubleTapHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleContentClick = useCallback(() => {
    clickCountRef.current += 1;
    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
    }
    if (clickCountRef.current === 1) {
      doubleClickTimeoutRef.current = setTimeout(() => {
        showFullText();
        clickCountRef.current = 0;
      }, 300);
    } else if (clickCountRef.current === 2) {
      if (currentArticle) {
        toggleSave({
          id: String(currentArticle.id),
          title: currentArticle.title,
          content: currentArticle.content,
          image: currentArticle.image,
          isBreakingNews: isNewsArticle(currentArticle) ? currentArticle.isBreakingNews : undefined
        });
      }
      clickCountRef.current = 0;
    }
  }, [currentArticle, toggleSave, showFullText]);

  const handleTextToSpeech = useCallback(() => {
    if (!currentArticle?.content) {
      toast({
        title: "No content available",
        description: "This article doesn't have content to read aloud.",
        variant: "destructive"
      });
      return;
    }
    speak(currentArticle.content);
  }, [currentArticle?.content, speak, toast]);

  const handleWikipediaRedirect = useCallback(() => {
    const baseUrl = "https://en.wikipedia.org/wiki/";
    const articleTitle = encodeURIComponent(currentArticle.title);
    window.open(`${baseUrl}${articleTitle}`, '_blank');
  }, [currentArticle?.title]);

  const handleDiscoverClick = () => navigate('/discover');

  // Memoized ActionButtons component
  const MemoizedActionButtons = useMemo(() => (props) => (
    <ActionButtons 
      currentArticle={currentArticle}
      handleTextToSpeech={handleTextToSpeech}
      isReading={isReading}
      speechLoading={speechLoading}
      setShowShare={setShowShare}
      {...props}
    />
  ), [currentArticle, handleTextToSpeech, isReading, speechLoading]);

  // Reset states when article changes
  useEffect(() => {
    setIsVisible(true);
    setDisplayedText("");
    setProgress(0);
    setIsTextFullyLoaded(false);
    setIsTypingPaused(false);
    clickCountRef.current = 0;
    setShowActionButtons(false);
    onArticleChange(currentArticle);

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (isReading) stop();
    if (currentIndex >= articles.length - 2) loadMoreArticles();
  }, [currentIndex, currentArticle, onArticleChange, articles.length, loadMoreArticles, isReading, stop]);

  // Typing animation effect
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
        setIsTextFullyLoaded(true);
      }
    }, typingSpeed);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [isVisible, currentArticle?.content, isTextFullyLoaded, isTypingPaused]);

  // Intersection observer for article navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            if (index !== currentIndex) {
              setCurrentIndex(index);
              setIsVisible(true);
            }
          }
        });
      },
      { threshold: 0.6, root: null, rootMargin: "-10% 0px -10% 0px" }
    );

    const articleElements = container.querySelectorAll(".article-section");
    articleElements.forEach(article => observer.observe(article));

    return () => {
      articleElements.forEach(article => observer.unobserve(article));
    };
  }, [articles, currentIndex]);

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
            <motion.div 
              key={isNewsArticle(article) ? article.id : `wiki-${article.id}`}
              data-index={index}
              className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
              onClick={handleContentClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 w-screen h-screen">
                <img 
                  src={getArticleImage(article)} 
                  alt={article.title} 
                  className="w-full h-full object-cover" 
                  loading={index <= currentIndex + 1 ? "eager" : "lazy"} 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
              </div>

              {isNewsArticle(article) && <BreakingNewsBadge />}
              
              <DoubleTapHint show={showDoubleTapHint} />

              {isHomePage && (
                <motion.div 
                  className="absolute bottom-20 left-4 z-30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <button 
                    onClick={e => {
                      e.stopPropagation();
                      handleDiscoverClick();
                    }}
                    className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <Compass className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              <motion.div 
                className="absolute bottom-20 right-4 z-30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <button 
                  onClick={e => {
                    e.stopPropagation();
                    setShowActionButtons(!showActionButtons);
                  }}
                  className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all duration-200 hover:scale-105"
                >
                  <AnimatePresence mode="wait">
                    {showActionButtons ? (
                      <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <X className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Menu className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>

              <AnimatePresence>
                {showActionButtons && (
                  <motion.div 
                    className="absolute right-4 bottom-36 bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-white/20 z-30"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MemoizedActionButtons isMobile={true} />
                  </motion.div>
                )}
              </AnimatePresence>

              <ArticleContent 
                article={article}
                displayedText={displayedText}
                progress={progress}
                currentIndex={currentIndex}
                index={index}
                isVisible={isVisible}
                onWikipediaRedirect={handleWikipediaRedirect}
              />

              {currentIndex === index && (
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <Progress 
                    value={progress} 
                    className="h-1 bg-black/30" 
                    indicatorClassName="bg-blue-500 transition-all duration-200" 
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            className="h-screen w-screen flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-white text-lg flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading more amazing content...
            </div>
          </motion.div>
        )}
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
