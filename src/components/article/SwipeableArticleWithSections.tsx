
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
  const constraintsRef = useRef(null);

  const isWikipediaArticle = !isNewsArticle(props.article);
  const hasAdditionalSections = isWikipediaArticle && 
    props.article.additionalSections && 
    props.article.additionalSections.length > 0;

  const totalSections = hasAdditionalSections ? 
    1 + props.article.additionalSections.length : 1;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (!hasAdditionalSections) return;

    const swipeThreshold = 100;
    
    if (info.offset.x < -swipeThreshold && currentSection < totalSections - 1) {
      // Swipe left - next section
      setCurrentSection(prev => prev + 1);
    } else if (info.offset.x > swipeThreshold && currentSection > 0) {
      // Swipe right - previous section
      setCurrentSection(prev => prev - 1);
    }
  };

  const getCurrentContent = () => {
    if (!hasAdditionalSections || currentSection === 0) {
      return props.article.content;
    }
    
    return props.article.additionalSections[currentSection - 1];
  };

  const getCurrentImage = () => {
    if (!hasAdditionalSections || currentSection === 0) {
      return getArticleImage(props.article);
    }
    
    const additionalImages = props.article.additionalImages || [];
    return additionalImages[currentSection - 1] || getArticleImage(props.article);
  };

  const getSectionTitle = () => {
    if (currentSection === 0) {
      return props.article.title;
    }
    
    return `${props.article.title} - Section ${currentSection + 1}`;
  };

  return (
    <div 
      ref={constraintsRef}
      className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
      data-index={props.index}
    >
      <motion.div
        className="w-full h-full relative"
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 w-screen h-screen">
          <img 
            src={getCurrentImage()} 
            alt={getSectionTitle()} 
            className="w-full h-full object-cover" 
            loading={props.index <= props.currentIndex + 1 ? "eager" : "lazy"} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        </div>

        {/* Section indicators for Wikipedia articles */}
        {hasAdditionalSections && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
            {Array.from({ length: totalSections }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSection ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Swipe hint for Wikipedia articles */}
        {hasAdditionalSections && currentSection === 0 && props.showDoubleTapHint && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
            ← Swipe left for more sections
          </div>
        )}

        <ArticleDisplay 
          {...props}
          article={{
            ...props.article,
            title: getSectionTitle(),
            content: getCurrentContent(),
            image: getCurrentImage()
          }}
        />
      </motion.div>
    </div>
  );
};

export default SwipeableArticleWithSections;
