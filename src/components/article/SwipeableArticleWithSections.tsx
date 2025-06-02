
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
  const constraintsRef = useRef(null);

  const isWikipediaArticle = !isNewsArticle(props.article);
  const hasSections = isWikipediaArticle && 
    props.article.sections && 
    props.article.sections.length > 0;

  // Total sections = main article + additional sections
  const totalSections = hasSections ? 1 + props.article.sections.length : 1;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (!hasSections) return;

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

  // Animation variants for smooth transitions
  const getAnimationVariants = () => {
    if (!swipeDirection) return {};
    
    return {
      initial: {
        y: swipeDirection === 'left' ? 20 : -20,
        opacity: 0.8
      },
      animate: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.3,
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
        drag={hasSections ? "x" : false}
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
        {...getAnimationVariants()}
      >
        {/* Background Image */}
        <div className="absolute inset-0 w-screen h-screen">
          <img 
            src={getCurrentImage()} 
            alt={getCurrentTitle()} 
            className="w-full h-full object-cover" 
            loading={props.index <= props.currentIndex + 1 ? "eager" : "lazy"} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        </div>

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

        {/* Section indicators for Wikipedia articles with multiple sections - moved to bottom */}
        {hasSections && totalSections > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
            {Array.from({ length: totalSections }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSection ? 'bg-white scale-110' : 'bg-white/40 scale-100'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SwipeableArticleWithSections;
