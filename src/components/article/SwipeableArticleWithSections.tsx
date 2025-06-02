
import { useState, useRef, useEffect } from "react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
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
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef(null);

  const isWikipediaArticle = !isNewsArticle(props.article);
  const hasSections = isWikipediaArticle && sections.length > 0;

  // Total sections = main article + additional sections
  const totalSections = hasSections ? 1 + sections.length : 1;

  // Lazy load sections on first swipe attempt
  const loadSections = async () => {
    if (sectionsLoaded || isLoadingSections || !isWikipediaArticle) return;
    
    setIsLoadingSections(true);
    try {
      console.log('Loading sections for:', props.article.title);
      const loadedSections = await getFullSections(props.article.id, props.article.title);
      setSections(loadedSections);
      setSectionsLoaded(true);
      console.log(`Loaded ${loadedSections.length} sections`);
    } catch (error) {
      console.error('Error loading sections:', error);
      setSectionsLoaded(true); // Prevent retry loops
    } finally {
      setIsLoadingSections(false);
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (!isWikipediaArticle) return;

    // Load sections if not loaded yet
    if (!sectionsLoaded) {
      await loadSections();
      return; // Don't navigate on first swipe - just load
    }

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
    setTimeout(() => setSwipeDirection(null), 400);
  };

  const getCurrentContent = () => {
    if (!hasSections || currentSection === 0) {
      return props.article.content;
    }
    
    const section = sections[currentSection - 1];
    return section?.content || props.article.content;
  };

  const getCurrentImage = () => {
    if (!hasSections || currentSection === 0) {
      return getArticleImage(props.article);
    }
    
    const section = sections[currentSection - 1];
    return section?.image || getArticleImage(props.article);
  };

  const getCurrentTitle = () => {
    if (!hasSections || currentSection === 0) {
      return props.article.title;
    }
    
    const section = sections[currentSection - 1];
    return section?.title || `${props.article.title} - Section ${currentSection}`;
  };

  // Instagram-style slide animations
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] // Instagram-like easing
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  // Determine animation direction
  const [direction, setDirection] = useState(0);
  
  useEffect(() => {
    if (swipeDirection === 'left') setDirection(1);
    if (swipeDirection === 'right') setDirection(-1);
  }, [swipeDirection]);

  return (
    <div 
      ref={constraintsRef}
      className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
      data-index={props.index}
    >
      <motion.div
        className="w-full h-full relative"
        drag={isWikipediaArticle ? "x" : false}
        dragConstraints={constraintsRef}
        dragElastic={0.15}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ 
          cursor: "grabbing",
          scale: 0.98
        }}
      >
        {/* Background with smooth transitions */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`bg-${currentSection}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-screen h-screen"
          >
            <img 
              src={getCurrentImage()} 
              alt={getCurrentTitle()} 
              className="w-full h-full object-cover" 
              loading={props.index <= props.currentIndex + 1 ? "eager" : "lazy"} 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint for Wikipedia articles */}
        {isWikipediaArticle && props.showDoubleTapHint && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
          >
            <span>← Swipe for more content</span>
            {isLoadingSections && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </motion.div>
        )}

        {/* Content with slide animations */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`content-${currentSection}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative z-10"
          >
            <ArticleDisplay 
              {...props}
              article={{
                ...props.article,
                title: getCurrentTitle(),
                content: getCurrentContent(),
                image: getCurrentImage()
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Section indicators - Instagram style */}
        {totalSections > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1.5"
          >
            {Array.from({ length: totalSections }).map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  scale: index === currentSection ? 1.2 : 1,
                  opacity: index === currentSection ? 1 : 0.5
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSection 
                    ? 'bg-white w-6' 
                    : 'bg-white/60 w-1.5'
                }`}
              />
            ))}
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoadingSections && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm"
          >
            Loading sections...
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SwipeableArticleWithSections;
