
import { useState, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import ArticleDisplay from "./ArticleDisplay";
import { isNewsArticle } from "../../services/contentService";
import { getArticleImage } from "../../utils/articleHelpers";

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const constraintsRef = useRef(null);

  const isWikipediaArticle = !isNewsArticle(props.article);
  const hasSections = isWikipediaArticle && 
    props.article.sections && 
    props.article.sections.length > 0;

  // Total sections = main article + additional sections
  const totalSections = hasSections ? 1 + props.article.sections.length : 1;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (!hasSections || isTransitioning) return;

    const swipeThreshold = 100;
    
    if (info.offset.x < -swipeThreshold && currentSection < totalSections - 1) {
      // Swipe left - next section
      setSwipeDirection('left');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSection(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    } else if (info.offset.x > swipeThreshold && currentSection > 0) {
      // Swipe right - previous section
      setSwipeDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSection(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }

    // Reset direction after animation
    setTimeout(() => setSwipeDirection(null), 400);
  };

  const getCurrentContent = () => {
    if (!hasSections || currentSection === 0) {
      return props.article.content;
    }
    
    const section = props.article.sections[currentSection - 1];
    return section?.content || props.article.content;
  };

  const getCurrentImage = () => {
    if (!hasSections || currentSection === 0) {
      return getArticleImage(props.article);
    }
    
    const section = props.article.sections[currentSection - 1];
    return section?.image || getArticleImage(props.article);
  };

  const getCurrentTitle = () => {
    if (!hasSections || currentSection === 0) {
      return props.article.title;
    }
    
    const section = props.article.sections[currentSection - 1];
    return section?.title || `${props.article.title} - Section ${currentSection}`;
  };

  // Enhanced animation variants for slide-out effect
  const getAnimationVariants = () => {
    if (!swipeDirection || !isTransitioning) return {};
    
    return {
      initial: {
        x: swipeDirection === 'left' ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95
      },
      animate: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.4,
          ease: "easeOut"
        }
      },
      exit: {
        x: swipeDirection === 'left' ? '-100%' : '100%',
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: 0.3,
          ease: "easeIn"
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
        drag={hasSections && !isTransitioning ? "x" : false}
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
        key={`section-${currentSection}`}
        {...getAnimationVariants()}
      >
        {/* Background Image with smoother transition */}
        <motion.div 
          className="absolute inset-0 w-screen h-screen"
          initial={swipeDirection ? { scale: 1.1 } : {}}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img 
            src={getCurrentImage()} 
            alt={getCurrentTitle()} 
            className="w-full h-full object-cover" 
            loading={props.index <= props.currentIndex + 1 ? "eager" : "lazy"} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        </motion.div>

        {/* Swipe hint for Wikipedia articles */}
        {hasSections && totalSections > 1 && currentSection === 0 && props.showDoubleTapHint && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
            ← Swipe left for more content
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

        {/* Section indicators - positioned at bottom with improved styling */}
        {hasSections && totalSections > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
            {Array.from({ length: totalSections }).map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSection ? 'bg-white scale-125' : 'bg-white/40 scale-100'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SwipeableArticleWithSections;
