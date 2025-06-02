
import { useState, useRef, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ArticleDisplay from "./ArticleDisplay";
import { isNewsArticle } from "../../services/contentService";
import { getArticleImage } from "../../utils/articleHelpers";
import { getFullSections } from "../../services/wikipediaService";

interface SwipeableArticleWithSectionsProps {
  article: any;
  index: number;
  currentIndex: number;
  displayedText: string;
  progress: number;
  isVisible: boolean;
  showDoubleTapHint: boolean;
  handleContentClick: () => void;
  handleWikipediaRedirect: () => void;
  handleTextToSpeech: () => void;
  isReading: boolean;
  speechLoading: boolean;
  setShowShare: (show: boolean) => void;
}

const SwipeableArticleWithSections = (props: SwipeableArticleWithSectionsProps) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [loadedSections, setLoadedSections] = useState<any[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [hasMoreSections, setHasMoreSections] = useState(true);
  const constraintsRef = useRef(null);
  const loadingAbortController = useRef<AbortController | null>(null);
  
  const isWikipediaArticle = !isNewsArticle(props.article);
  const isCurrentlyViewed = props.index === props.currentIndex;

  // Initialize with main article content and show swipe hint
  useEffect(() => {
    if (isWikipediaArticle && isCurrentlyViewed && loadedSections.length === 0) {
      setLoadedSections([{
        title: props.article.title,
        content: props.article.content,
        image: getArticleImage(props.article)
      }]);
      setShowSwipeHint(true);
      setTimeout(() => setShowSwipeHint(false), 3000);
    }
  }, [isWikipediaArticle, isCurrentlyViewed, props.article, loadedSections.length]);

  // Cancel loading and clean up when leaving this article
  useEffect(() => {
    if (!isCurrentlyViewed) {
      if (loadingAbortController.current) {
        loadingAbortController.current.abort();
        loadingAbortController.current = null;
      }
      setIsLoadingSections(false);
      if (loadedSections.length > 1) {
        setLoadedSections(prev => prev.slice(0, 1));
        setCurrentSection(0);
        setHasMoreSections(true);
      }
    }
  }, [isCurrentlyViewed, loadedSections.length]);

  // Auto-start reading new section content when swiping if already reading
  useEffect(() => {
    if (!isCurrentlyViewed || !isWikipediaArticle) return;
    
    if (props.isReading && currentSection > 0 && loadedSections[currentSection]?.content) {
      setTimeout(() => {
        props.handleTextToSpeech();
      }, 300);
    }
  }, [currentSection, props.isReading, isCurrentlyViewed, isWikipediaArticle, loadedSections, props.handleTextToSpeech]);

  // Load sections when user swipes or is about to swipe
  useEffect(() => {
    if (!isWikipediaArticle || !isCurrentlyViewed || !hasMoreSections) return;
    
    const loadSectionsIfNeeded = async () => {
      if (currentSection === 0 && loadedSections.length === 1 && !isLoadingSections) {
        setIsLoadingSections(true);
        loadingAbortController.current = new AbortController();
        
        try {
          const sections = await getFullSections(props.article.id, props.article.title, loadingAbortController.current.signal);

          if (isCurrentlyViewed && sections.length > 0) {
            setLoadedSections(prev => [...prev, sections[0]]);
            setHasMoreSections(sections.length > 1);
          } else if (isCurrentlyViewed && sections.length === 0) {
            setHasMoreSections(false);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error loading sections:', error);
            setHasMoreSections(false);
          }
        } finally {
          if (isCurrentlyViewed) {
            setIsLoadingSections(false);
          }
          loadingAbortController.current = null;
        }
      }

      if (currentSection > 0 && currentSection === loadedSections.length - 1 && !isLoadingSections) {
        setIsLoadingSections(true);
        loadingAbortController.current = new AbortController();
        
        try {
          const sections = await getFullSections(props.article.id, props.article.title, loadingAbortController.current.signal);
          const nextSectionIndex = loadedSections.length - 1;

          if (isCurrentlyViewed && sections[nextSectionIndex]) {
            setLoadedSections(prev => [...prev, sections[nextSectionIndex]]);
            setHasMoreSections(sections.length > nextSectionIndex + 1);
          } else if (isCurrentlyViewed) {
            setHasMoreSections(false);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error loading next section:', error);
            setHasMoreSections(false);
          }
        } finally {
          if (isCurrentlyViewed) {
            setIsLoadingSections(false);
          }
          loadingAbortController.current = null;
        }
      }
    };
    
    loadSectionsIfNeeded();
  }, [currentSection, loadedSections.length, isWikipediaArticle, isCurrentlyViewed, props.article.id, props.article.title, isLoadingSections, hasMoreSections]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingAbortController.current) {
        loadingAbortController.current.abort();
      }
    };
  }, []);

  const totalSections = loadedSections.length;
  const canGoNext = currentSection < totalSections - 1 || (hasMoreSections && !isLoadingSections);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (!isWikipediaArticle || totalSections <= 1) return;

    const swipeThreshold = 100;
    if (info.offset.x < -swipeThreshold && canGoNext) {
      setSwipeDirection('left');
      setCurrentSection(prev => prev + 1);
    } else if (info.offset.x > swipeThreshold && currentSection > 0) {
      setSwipeDirection('right');
      setCurrentSection(prev => prev - 1);
    }

    setTimeout(() => setSwipeDirection(null), 300);
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setSwipeDirection('right');
      setCurrentSection(prev => prev - 1);
      setTimeout(() => setSwipeDirection(null), 300);
    }
  };

  const handleNextSection = () => {
    if (canGoNext) {
      setSwipeDirection('left');
      setCurrentSection(prev => prev + 1);
      setTimeout(() => setSwipeDirection(null), 300);
    }
  };

  const getCurrentContent = () => {
    if (loadedSections.length === 0) return props.article.content;
    const section = loadedSections[currentSection];
    return section?.content || props.article.content;
  };

  const getCurrentImage = () => {
    if (loadedSections.length === 0) return getArticleImage(props.article);
    const section = loadedSections[currentSection];
    return section?.image || getArticleImage(props.article);
  };

  const getCurrentTitle = () => {
    if (loadedSections.length === 0) return props.article.title;
    const section = loadedSections[currentSection];
    return section?.title || props.article.title;
  };

  const getAnimationVariants = () => {
    if (!swipeDirection) return {};
    return {
      initial: {
        x: swipeDirection === 'left' ? 50 : -50,
        opacity: 0.7
      },
      animate: {
        x: 0,
        opacity: 1,
        transition: {
          duration: 0.4,
          ease: "easeOut"
        }
      }
    };
  };

  const mainArticleForSaving = {
    ...props.article,
    content: props.article.content,
    image: getArticleImage(props.article),
    title: props.article.title
  };

  return (
    <div ref={constraintsRef} className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden" data-index={props.index}>
      <motion.div 
        className="w-full h-full relative" 
        drag={isWikipediaArticle && totalSections > 1 ? "x" : false} 
        dragConstraints={constraintsRef} 
        dragElastic={0.2} 
        onDragStart={() => setIsDragging(true)} 
        onDragEnd={handleDragEnd} 
        whileDrag={{ cursor: "grabbing" }} 
        {...getAnimationVariants()}
      >
        <motion.div 
          key={`${props.article.id}-${currentSection}`} 
          className="absolute inset-0 w-screen h-screen" 
          initial={swipeDirection ? { opacity: 0.8 } : false} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          <img 
            src={getCurrentImage()} 
            alt={getCurrentTitle()} 
            className="w-full h-full object-cover" 
            loading={props.index <= props.currentIndex + 1 ? "eager" : "lazy"} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        </motion.div>

        {/* Desktop Navigation Arrows - smaller size with better centering */}
        {isWikipediaArticle && (totalSections > 1 || hasMoreSections) && (
          <>
            {currentSection > 0 && (
              <button
                onClick={handlePreviousSection}
                className="hidden lg:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full items-center justify-center text-white hover:bg-black/60 hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {canGoNext && (
              <button
                onClick={handleNextSection}
                className="hidden lg:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full items-center justify-center text-white hover:bg-black/60 hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </>
        )}

        {showSwipeHint && isWikipediaArticle && (
          <div className="hidden absolute top-20 right-4 z-30 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Swipe for more content
          </div>
        )}

        {isLoadingSections && (
          <div className="absolute top-20 right-4 z-30 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Loading...
          </div>
        )}

        <ArticleDisplay 
          {...props} 
          article={{
            ...mainArticleForSaving,
            title: getCurrentTitle(),
            content: getCurrentContent(),
            image: getCurrentImage()
          }} 
        />

        {isWikipediaArticle && (totalSections > 1 || hasMoreSections) && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
            {Array.from({ length: totalSections }).map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSection ? 'bg-white scale-110' : 'bg-white/40 scale-100'
                }`} 
              />
            ))}
            {isLoadingSections && (
              <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse scale-90" />
            )}
            {hasMoreSections && !isLoadingSections && currentSection === totalSections - 1 && (
              <div className="w-2 h-2 rounded-full bg-white/60 scale-90" />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SwipeableArticleWithSections;
