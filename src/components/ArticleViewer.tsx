import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";
import { Volume2, VolumeX, Share2, Calendar, Globe, Menu, X, ExternalLink, Loader2 } from "lucide-react";
import { getMixedContent, isNewsArticle, isDidYouKnowFact, isHistoricQuote } from "../services/contentService";
import SaveButton from "./SaveButton";
import ShareModal from "./ShareModal";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSaveArticle } from "@/hooks/useSaveArticle";

const ArticleViewer = ({
  articles: initialArticles,
  onArticleChange
}) => {
  const [articles, setArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isTextFullyLoaded, setIsTextFullyLoaded] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showDoubleTapHint, setShowDoubleTapHint] = useState(true);
  const [isTypingPaused, setIsTypingPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentArticle = articles[currentIndex];
  const {
    toast
  } = useToast();
  const {
    speak,
    stop,
    isReading,
    isLoading: speechLoading
  } = useTextToSpeech();
  const {
    toggleSave
  } = useSaveArticle();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDoubleTapHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
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
          image: currentArticle.image
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
  const formatNewsDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  }, []);
  const handleWikipediaRedirect = useCallback(() => {
    const baseUrl = "https://en.wikipedia.org/wiki/";
    const articleTitle = encodeURIComponent(currentArticle.title);
    window.open(`${baseUrl}${articleTitle}`, '_blank');
  }, [currentArticle?.title]);

  const ActionButtons = useMemo(() => ({
    isMobile = false
  }) => <motion.div className={`flex ${isMobile ? 'flex-row justify-around' : 'flex-col'} space-y-0 ${isMobile ? 'space-x-3' : 'space-y-2'} z-20`} initial={{
    opacity: 0,
    scale: 0.9
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    duration: 0.2
  }}>
      <SaveButton article={{
      id: String(currentArticle?.id || ''),
      title: currentArticle?.title || '',
      content: currentArticle?.content,
      image: currentArticle?.image
    }} />
      
      <div className="flex flex-col items-center">
        <button onClick={e => {
        e.stopPropagation();
        handleTextToSpeech();
      }} disabled={speechLoading} className={`p-2 rounded-full transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110 ${isReading ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' : 'bg-black/30 text-white hover:bg-black/50'} ${speechLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {speechLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <span className="text-white text-xs mt-1 font-medium">
          {speechLoading ? 'Loading...' : isReading ? 'Stop' : 'Listen'}
        </span>
      </div>
      
      {!isMobile && <div className="flex flex-col items-center">
          <button onClick={e => {
        e.stopPropagation();
        setShowShare(true);
      }} className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110">
            <Share2 className="w-4 h-4" />
          </button>
          <span className="text-white text-xs mt-1 font-medium">Share</span>
        </div>}
    </motion.div>, [currentArticle, handleTextToSpeech, isReading, speechLoading]);

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
    if (isReading) {
      stop();
    }
    if (currentIndex >= articles.length - 2) {
      loadMoreArticles();
    }
  }, [currentIndex, currentArticle, onArticleChange, articles.length, loadMoreArticles, isReading, stop]);

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index") || "0");
          if (index !== currentIndex) {
            setCurrentIndex(index);
            setIsVisible(true);
          }
        }
      });
    }, {
      threshold: 0.6,
      root: null,
      rootMargin: "-10% 0px -10% 0px"
    });
    const articleElements = container.querySelectorAll(".article-section");
    articleElements.forEach(article => observer.observe(article));
    return () => {
      articleElements.forEach(article => observer.unobserve(article));
    };
  }, [articles, currentIndex]);

  useEffect(() => {
    return () => {
      stop();
      if (doubleClickTimeoutRef.current) {
        clearTimeout(doubleClickTimeoutRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [stop]);

  return (
    <>
      <main ref={containerRef} className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth overflow-x-hidden">
        <AnimatePresence>
          {articles.map((article, index) => {
            return (
              <motion.div 
                key={isNewsArticle(article) ? article.id : `content-${article.id}`} 
                data-index={index} 
                className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden" 
                onClick={handleContentClick} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 w-screen h-screen">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" loading={index <= currentIndex + 1 ? "eager" : "lazy"} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
                </div>

                {isNewsArticle(article) && <motion.div className="absolute top-20 left-4 z-20" initial={{
              x: -50,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} transition={{
              delay: 0.2,
              duration: 0.4
            }}>
                    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-red-400/30">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      BREAKING NEWS
                    </div>
                  </motion.div>}

                {isDidYouKnowFact(article) && <motion.div className="absolute top-20 left-4 z-20" initial={{
              x: -50,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} transition={{
              delay: 0.2,
              duration: 0.4
            }}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-blue-400/30">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      DID YOU KNOW
                    </div>
                  </motion.div>}

                {isHistoricQuote(article) && <motion.div className="absolute top-20 left-4 z-20" initial={{
              x: -50,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} transition={{
              delay: 0.2,
              duration: 0.4
            }}>
                    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-purple-400/30">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      HISTORIC QUOTE
                    </div>
                  </motion.div>}

                <AnimatePresence>
                  {showDoubleTapHint && <motion.div className="absolute top-20 right-4 z-20" initial={{
                x: 50,
                opacity: 0
              }} animate={{
                x: 0,
                opacity: 1
              }} exit={{
                x: 50,
                opacity: 0
              }} transition={{
                duration: 0.4
              }}>
                    <div className="bg-black/40 text-white px-3 py-1 rounded-xl text-xs backdrop-blur-md border border-white/20">
                      Double-tap to save
                    </div>
                  </motion.div>}
                </AnimatePresence>

                <motion.div className="absolute bottom-20 right-4 z-30" initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              delay: 0.3,
              duration: 0.3
            }}>
                  <button onClick={e => {
                e.stopPropagation();
                setShowActionButtons(!showActionButtons);
              }} className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all duration-200 hover:scale-105">
                    <AnimatePresence mode="wait">
                      {showActionButtons ? <motion.div key="close" initial={{
                  rotate: -90,
                  opacity: 0
                }} animate={{
                  rotate: 0,
                  opacity: 1
                }} exit={{
                  rotate: 90,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }}>
                        <X className="w-5 h-5" />
                      </motion.div> : <motion.div key="menu" initial={{
                  rotate: 90,
                  opacity: 0
                }} animate={{
                  rotate: 0,
                  opacity: 1
                }} exit={{
                  rotate: -90,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }}>
                        <Menu className="w-5 h-5" />
                      </motion.div>}
                    </AnimatePresence>
                  </button>
                </motion.div>

                <AnimatePresence>
                  {showActionButtons && <motion.div className="absolute right-4 bottom-36 bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-white/20 z-30" initial={{
                opacity: 0,
                scale: 0.8,
                y: 20
              }} animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }} exit={{
                opacity: 0,
                scale: 0.8,
                y: 20
              }} transition={{
                duration: 0.2
              }}>
                    <ActionButtons isMobile={true} />
                  </motion.div>}
                </AnimatePresence>

                <motion.div initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: isVisible && currentIndex === index ? 1 : 0,
              y: isVisible && currentIndex === index ? 0 : 30
            }} transition={{
              duration: 0.5,
              ease: "easeOut"
            }} className="relative z-10 text-white p-4 sm:p-6 max-w-4xl mx-auto h-full flex flex-col justify-center items-center">
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4 max-w-2xl min-h-[calc(20vh+30px)]">
                    <div className="flex items-start justify-between">
                      <h1 className="text-xl sm:text-3xl font-bold leading-tight drop-shadow-lg text-center">{article.title}</h1>
                    </div>
                    <div className="max-h-60 sm:max-h-96 overflow-y-auto scrollbar-hide">
                      <p className="text-sm sm:text-base leading-relaxed opacity-95 break-words text-center">
                        {currentIndex === index ? displayedText : article.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-xs sm:text-sm text-white/80">
                      {isNewsArticle(article) ? <>
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{article.source}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{formatNewsDate(article.publishedAt)}</span>
                          </div>
                        </> : isDidYouKnowFact(article) ? <>
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.source}</span>
                        </> : isHistoricQuote(article) ? <>
                          <span>by {article.author}</span>
                          <span>•</span>
                          <span>{article.category}</span>
                        </> : <>
                          <span>{article.readTime} min read</span>
                          <span>•</span>
                          <span>{article.views.toLocaleString()} views</span>
                          <span>•</span>
                          <button onClick={e => {
                      e.stopPropagation();
                      handleWikipediaRedirect();
                    }} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Wikipedia</span>
                      </button>
                    </>}
                    </div>
                  </div>
                </motion.div>

                {currentIndex === index && <div className="absolute bottom-0 left-0 right-0 z-20">
                    <Progress value={progress} className="h-1 bg-black/30" indicatorClassName="bg-blue-500 transition-all duration-200" />
                  </div>}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isLoading && <motion.div className="h-screen w-screen flex items-center justify-center bg-black" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.3
      }}>
            <div className="text-white text-lg flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading more amazing content...
            </div>
          </motion.div>}
      </main>

      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        title={currentArticle?.title || (isDidYouKnowFact(currentArticle) ? 'Did You Know Fact' : isHistoricQuote(currentArticle) ? 'Historic Quote' : '')} 
        articleId={String(currentArticle?.id || '')} 
      />
    </>
  );
};

export default ArticleViewer;
