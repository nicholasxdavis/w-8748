
import { useState, useRef, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
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
  const constraintsRef = useRef(null);

  const isWikipediaArticle = !isNewsArticle(props.article);
  const isCurrentlyViewed = props.index === props.currentIndex;

  // Initialize with main article content and show swipe hint
  useEffect(() => {
    if (isWikipediaArticle && isCurrentlyViewed && loadedSections.length === 0) {
      // Start with main article as section 0
      setLoadedSections([{
        title: props.article.title,
        content: props.article.content,
        image: getArticleImage(props.article)
      }]);
      
      // Show swipe hint on load for Wikipedia articles
      setShowSwipeHint(true);
      // Hide hint after 3 seconds
      setTimeout(() => setShowSwipeHint(false), 3000);
    }
  }, [isWikipediaArticle, isCurrentlyViewed, props.article, loadedSections.length]);

  // Load sections when user swipes or is about to swipe
  useEffect(() => {
    if (!isWikipediaArticle || !isCurrentlyViewed) return;

    const loadSectionsIfNeeded = async () => {
      // Load first additional section when on main article (section 0)
      if (currentSection === 0 && loadedSections.length === 1 && !isLoadingSections) {
        setIsLoadingSections(true);
        try {
          const sections = await getFullSections(props.article.id, props.article.title);
          if (sections.length > 0) {
            setLoadedSections(prev => [...prev, sections[0]]); // Add first section only
          }
        } catch (error) {
          console.error('Error loading sections:', error);
        } finally {
          setIsLoadingSections(false);
        }
      }

      // Load next section when approaching current section boundary
      if (currentSection > 0 && currentSection === loadedSections.length - 1 && !isLoadingSections) {
        setIsLoadingSections(true);
        try {
          const sections = await getFullSections(props.article.id, props.article.title);
          const nextSectionIndex = loadedSections.length - 1; // -1 because first is main article
          if (sections[nextSectionIndex]) {
            setLoadedSections(prev => [...prev, sections[nextSectionIndex]]);
          }
        } catch (error) {
          console.error('Error loading next section:', error);
        } finally {
          setIsLoadingSections(false);
        }
      }
    };

    loadSectionsIfNeeded();
  }, [currentSection, loadedSections.length, isWikipediaArticle, isCurrentlyViewed, props.article.id, props.article.title, isLoadingSections]);

  // Clean up sections when leaving this article
  useEffect(() => {
    if (!isCurrentlyViewed && loadedSections.length > 1) {
      // Keep only the main article section when not viewing
      setLoadedSections(prev => prev.slice(0, 1));
      setCurrentSection(0);
    }
  }, [isCurrentlyViewed]);

  const totalSections = loadedSections.length;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (!isWikipediaArticle || totalSections <= 1) return;

    const swipeThreshold = 100;
    
    if (info.offset.x < -swipeThreshold && currentSection < totalSections - 1) {
      // Swipe left - next section
      setSwipeDirection('left');
      setCurrentSection(prev => prev + 1);
    } else if (info.offset.x > swipeThreshold && currentSection > 0) {
      // Swipe right - previous section
      setSwipeDirection('right');
      setCurrentSection(prev => prev - 1);
    }

    // Reset direction after animation
    setTimeout(() => setSwipeDirection(null), 300);
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

  // Animation variants for smooth transitions
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

  return (
    <div 
      ref={constraintsRef}
      className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
      data-index={props.index}
    >
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
        {/* Background Image with smooth transition */}
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

        {/* Swipe hint using loading popup style */}
        {showSwipeHint && isWikipediaArticle && (
          <div className="absolute top-20 right-4 z-30 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Swipe for more content
          </div>
        )}

        {/* Loading indicator for sections */}
        {isLoadingSections && (
          <div className="absolute top-20 right-4 z-30 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Loading...
          </div>
        )}

        <ArticleDisplay 
          {...props}
          article={{
            ...props.article,
            title: getCurrentTitle(),
            content: getCurrentContent(),
            image: getCurrentImage()
          }}
        />

        {/* Section indicators for Wikipedia articles with multiple sections */}
        {isWikipediaArticle && totalSections > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
            {Array.from({ length: totalSections }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSection ? 'bg-white scale-110' : 'bg-white/40 scale-100'
                }`}
              />
            ))}
            {/* Show loading dot if more sections are being loaded */}
            {isLoadingSections && (
              <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse scale-90" />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SwipeableArticleWithSections;
