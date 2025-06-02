
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Users, Clock, BookOpen, Volume2, Share2 } from "lucide-react";
import { isNewsArticle } from "../../services/contentService";
import SaveButton from "../SaveButton";
import DisappearingLabel from "../DisappearingLabel";
import BreakingNewsBadge from "./BreakingNewsBadge";

interface ArticleDisplayProps {
  article: any; // Article to save (always main article)
  displayArticle?: any; // Article to display (current section)
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

const ArticleDisplay = ({
  article,
  displayArticle = article, // Default to article if no displayArticle provided
  index,
  currentIndex,
  displayedText,
  progress,
  isVisible,
  showDoubleTapHint,
  handleContentClick,
  handleWikipediaRedirect,
  handleTextToSpeech,
  isReading,
  speechLoading,
  setShowShare
}: ArticleDisplayProps) => {
  const [showActionButtons, setShowActionButtons] = useState(false);
  const isCurrentlyViewed = index === currentIndex;
  const isWikipediaArticle = !isNewsArticle(article);

  // Show action buttons after content is fully loaded
  useEffect(() => {
    if (isCurrentlyViewed && isVisible) {
      const timer = setTimeout(() => setShowActionButtons(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowActionButtons(false);
    }
  }, [isCurrentlyViewed, isVisible]);

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-4 md:p-6 text-white z-20">
      {/* Top content */}
      <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Breaking news badge */}
          {article.isBreakingNews && <BreakingNewsBadge />}

          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {displayArticle.title}
          </h1>

          {/* Article metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            {isWikipediaArticle ? (
              <>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{article.views?.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{article.citations} citations</span>
                </div>
              </>
            ) : (
              <>
                <span>{article.source}</span>
                <span>•</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                {article.readTime && (
                  <>
                    <span>•</span>
                    <span>{article.readTime} min read</span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-white/20 rounded-full backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4 max-w-4xl"
          onClick={handleContentClick}
        >
          <div className="text-base md:text-lg leading-relaxed">
            {displayedText || displayArticle.content}
          </div>

          {/* Progress bar */}
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-white/20 rounded-full h-1">
              <motion.div
                className="bg-white h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}

          {/* Double tap hint */}
          {showDoubleTapHint && (
            <DisappearingLabel text="Double tap to continue reading" />
          )}
        </motion.div>
      </div>

      {/* Bottom actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={showActionButtons ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-end"
      >
        {/* Action buttons */}
        <div className="flex space-x-4">
          <SaveButton article={article} />
          
          <div className="flex flex-col items-center">
            <button
              onClick={handleTextToSpeech}
              disabled={speechLoading}
              className={`p-2 rounded-full transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110 ${
                isReading 
                  ? 'bg-blue-600/80 text-white' 
                  : 'bg-black/30 text-white hover:bg-black/50'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${speechLoading ? 'animate-pulse' : ''}`} />
            </button>
            <span className="text-white text-xs mt-1 font-medium">
              {speechLoading ? 'Loading...' : isReading ? 'Playing' : 'Listen'}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowShare(true)}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-white text-xs mt-1 font-medium">Share</span>
          </div>
        </div>

        {/* Wikipedia link */}
        {isWikipediaArticle && (
          <button
            onClick={handleWikipediaRedirect}
            className="flex items-center space-x-2 px-3 py-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">Wikipedia</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default ArticleDisplay;
