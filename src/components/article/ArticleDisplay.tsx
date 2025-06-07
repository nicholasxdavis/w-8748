import { motion } from "framer-motion";
import { Progress } from "../ui/progress";
import { isNewsArticle, isFactArticle, isQuoteArticle, isMovieArticle, isMusicArticle, isStockArticle, isWeatherArticle, isHistoryArticle } from "../../services/contentService";
import { getArticleImage } from "../../utils/articleHelpers";
import BreakingNewsBadge from "./BreakingNewsBadge";
import ArticleContent from "./ArticleContent";
import FloatingActionButtons from "./FloatingActionButtons";
import FactBadge from "./FactBadge";
import QuoteBadge from "./QuoteBadge";
import MovieBadge from "./MovieBadge";
import TVShowBadge from "./TVShowBadge";
import MusicBadge from "./MusicBadge";
import StockBadge from "./StockBadge";
import WeatherBadge from "./WeatherBadge";
import HistoryBadge from "./HistoryBadge";

interface ArticleDisplayProps {
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

const ArticleDisplay = ({
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
  setShowShare
}: ArticleDisplayProps) => (
  <motion.div 
    key={isNewsArticle(article) ? article.id : `wiki-${article.id}`}
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
    {isMovieArticle(article) && article.type === 'movie' && <MovieBadge />}
    {isMovieArticle(article) && article.type === 'tvshow' && <TVShowBadge />}
    {isMusicArticle(article) && <MusicBadge type={article.type} />}
    {isStockArticle(article) && <StockBadge />}
    {isWeatherArticle(article) && <WeatherBadge />}
    {isHistoryArticle(article) && <HistoryBadge />}

    <FloatingActionButtons
      currentArticle={article}
      handleTextToSpeech={handleTextToSpeech}
      isReading={isReading}
      speechLoading={speechLoading}
      setShowShare={setShowShare}
    />

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

export default ArticleDisplay;
