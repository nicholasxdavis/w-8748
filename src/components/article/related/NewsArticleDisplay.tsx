
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getArticleImage } from "../../../utils/articleHelpers";

interface NewsArticleDisplayProps {
  article: any;
  onBack: () => void;
  isVisible: boolean;
}

export const NewsArticleDisplay = ({ article, onBack, isVisible }: NewsArticleDisplayProps) => {
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

      <div className="relative z-10 text-white p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">News Article</h2>
        <p className="text-white/80 mb-6">
          This is a news article. Detailed sections are available for Wikipedia articles only.
        </p>
        <button
          onClick={() => window.open(article.url, '_blank')}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Read Full Article
        </button>
      </div>
    </motion.div>
  );
};
