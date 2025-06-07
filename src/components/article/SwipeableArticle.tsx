
import { motion } from "framer-motion";
import { Progress } from "../ui/progress";
import { getArticleImage } from "../../utils/articleHelpers";
import BreakingNewsBadge from "./BreakingNewsBadge";
import ArticleContent from "./ArticleContent";
import FloatingActionButtons from "./FloatingActionButtons";
import FactBadge from "./FactBadge";
import QuoteBadge from "./QuoteBadge";
import RightSidebar from "../RightSidebar";
import { isNewsArticle, isFactArticle, isQuoteArticle } from "../../services/contentService";

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
  onNeverShow?: () => void;
}

const SwipeableArticle = ({
  article,
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
  setShowShare,
  onNeverShow
}: SwipeableArticleProps) => (
  <motion.div 
    key={isNewsArticle(article) ? article.id : `article-${article.id}`}
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
    {isFactArticle(article) && <FactBadge />}
    {isQuoteArticle(article) && <QuoteBadge />}

    <FloatingActionButtons
      currentArticle={article}
      handleTextToSpeech={handleTextToSpeech}
      isReading={isReading}
      speechLoading={speechLoading}
      setShowShare={setShowShare}
    />

    {currentIndex === index && (
      <RightSidebar 
        article={article} 
        onNeverShow={onNeverShow}
      />
    )}

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
);

export default SwipeableArticle;
