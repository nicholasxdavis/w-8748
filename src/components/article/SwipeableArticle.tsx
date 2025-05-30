
import { useState, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import ArticleDisplay from "./ArticleDisplay";
import RelatedContent from "./RelatedContent";

interface SwipeableArticleProps {
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

const SwipeableArticle = (props: SwipeableArticleProps) => {
  const [showRelated, setShowRelated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // If swiped left more than 100px, show related content
    if (info.offset.x < -100) {
      setShowRelated(true);
    }
    // If swiped right more than 100px from related view, go back to main
    else if (info.offset.x > 100 && showRelated) {
      setShowRelated(false);
    }
  };

  return (
    <div 
      ref={constraintsRef}
      className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
      data-index={props.index}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{
          x: showRelated ? "-100%" : "0%"
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        style={{
          width: "200%",
          display: "flex"
        }}
      >
        {/* Main Article */}
        <div className="w-1/2 h-full relative">
          <ArticleDisplay {...props} />
        </div>

        {/* Related Content */}
        <div className="w-1/2 h-full relative">
          <RelatedContent 
            article={props.article}
            onBack={() => setShowRelated(false)}
            isVisible={showRelated && props.currentIndex === props.index}
          />
        </div>
      </motion.div>

      {/* Swipe Indicator */}
      {!showRelated && props.currentIndex === props.index && !isDragging && (
        <motion.div
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 text-white/60 text-sm flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <span>Swipe left for more</span>
          <motion.div
            animate={{ x: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ←
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeableArticle;
