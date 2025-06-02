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
}: ArticleContentProps) => <motion.div initial={{
  opacity: 0,
  y: 30
}} animate={{
  opacity: isVisible && currentIndex === index ? 1 : 0,
  y: isVisible && currentIndex === index ? 0 : 30
}} transition={{
  duration: 0.5,
  ease: "easeOut"
}} className="relative z-10 text-white p-4 sm:p-6 max-w-4xl mx-auto h-full flex flex-col justify-center items-center">
    <div className="w-[800px] max-sm:w-[350px] max-w-none mx-auto bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-12 border border-white/10 space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8 min-h-[calc(0vh+30px)] lg:min-h-0">
      <div className="flex items-start justify-center">
        <h1 className="text-lg sm:text-xl lg:text-3xl xl:text-4xl font-bold leading-tight drop-shadow-lg text-center break-words hyphens-auto max-w-full">
          {article?.title || 'Loading...'}
        </h1>
      </div>
      
      <div className="max-h-48 sm:max-h-64 lg:max-h-96 xl:max-h-[500px] overflow-y-auto scrollbar-hide">
        <p className="text-xs sm:text-sm lg:text-base xl:text-lg leading-relaxed opacity-95 break-words hyphens-auto text-center max-w-full">
          {article?.content || 'Loading content...'}
        </p>
      </div>
      
      <div className="flex items-center justify-center flex-wrap gap-2 text-xs lg:text-sm xl:text-base text-white/80">
        {article && isNewsArticle(article) ? <>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate max-w-20">{article.source || 'Unknown'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">{article.publishedAt ? formatNewsDate(article.publishedAt) : 'Recent'}</span>
            </div>
            <span>•</span>
            <button onClick={e => {
          e.stopPropagation();
          if (article.url) {
            window.open(article.url, '_blank', 'noopener,noreferrer');
          }
        }} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm">Read Full</span>
            </button>
          </> : article ? <>
            <span className="truncate">{article.readTime || 5} min read</span>
            <span>•</span>
            <span className="truncate">{article.views?.toLocaleString() || '0'} views</span>
            <span>•</span>
            <button onClick={e => {
          e.stopPropagation();
          onWikipediaRedirect();
        }} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm">Wikipedia</span>
            </button>
          </> : null}
      </div>
    </div>
  </motion.div>;
export default ArticleContent;
