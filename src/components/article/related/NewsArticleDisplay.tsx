
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getArticleImage } from "../../../utils/articleHelpers";

interface NewsArticleDisplayProps {
  article: any;
  onBack: () => void;
  isVisible: boolean;
}

export const NewsArticleDisplay = ({ article, onBack, isVisible }: NewsArticleDisplayProps) => {
  const handleReadFullArticle = () => {
    if (article.url && article.url !== '#') {
      window.open(article.url, '_blank');
    } else {
      // Show a message that the article is not available
      console.log('Article URL not available');
    }
  };

  return (
    <motion.div 
      className="h-full w-full relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0">
        <img 
          src={getArticleImage(article)} 
          alt={article.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
      </div>

      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 text-white p-6 text-center max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
        <div className="text-sm text-white/60 mb-4">
          {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
        </div>
        <p className="text-white/80 mb-6 leading-relaxed">
          {article.content}
        </p>
        {article.url && article.url !== '#' && (
          <button
            onClick={handleReadFullArticle}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Read Full Article
          </button>
        )}
        {(!article.url || article.url === '#') && (
          <div className="text-white/60 text-sm">
            Full article link not available
          </div>
        )}
      </div>
    </motion.div>
  );
};
