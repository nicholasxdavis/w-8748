
import { motion } from "framer-motion";
import { Calendar, Globe, ExternalLink } from "lucide-react";
import { isNewsArticle } from "../../services/contentService";
import { formatNewsDate } from "../../utils/articleHelpers";

interface ArticleContentProps {
  article: any;
  displayedText: string;
  progress: number;
  currentIndex: number;
  index: number;
  isVisible: boolean;
  onWikipediaRedirect: () => void;
}

const ArticleContent = ({ 
  article, 
  displayedText, 
  currentIndex, 
  index, 
  isVisible,
  onWikipediaRedirect 
}: ArticleContentProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ 
      opacity: isVisible && currentIndex === index ? 1 : 0,
      y: isVisible && currentIndex === index ? 0 : 30 
    }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="relative z-10 text-white p-4 sm:p-6 max-w-4xl mx-auto h-full flex flex-col justify-center items-center"
  >
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4 max-w-2xl min-h-[calc(20vh+30px)]">
      <div className="flex items-start justify-between">
        <h1 className="text-xl sm:text-3xl font-bold leading-tight drop-shadow-lg text-center">
          {article?.title || 'Loading...'}
        </h1>
      </div>
      
      <div className="max-h-60 sm:max-h-96 overflow-y-auto scrollbar-hide">
        <p className="text-sm sm:text-base leading-relaxed opacity-95 break-words text-center">
          {article?.content || 'Loading content...'}
        </p>
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-xs sm:text-sm text-white/80">
        {article && isNewsArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{article.source || 'Unknown'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{article.publishedAt ? formatNewsDate(article.publishedAt) : 'Recent'}</span>
            </div>
            <span>•</span>
            <button 
              onClick={e => {
                e.stopPropagation();
                if (article.url) {
                  window.open(article.url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Read Full Story</span>
            </button>
          </>
        ) : article ? (
          <>
            <span>{article.readTime || 5} min read</span>
            <span>•</span>
            <span>{article.views?.toLocaleString() || '0'} views</span>
            <span>•</span>
            <button 
              onClick={e => {
                e.stopPropagation();
                onWikipediaRedirect();
              }}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Wikipedia</span>
            </button>
          </>
        ) : null}
      </div>
    </div>
  </motion.div>
);

export default ArticleContent;
