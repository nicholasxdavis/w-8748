
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, Eye } from "lucide-react";

interface RelatedContentDisplayProps {
  article: any;
  sectionContent: any;
  sectionImages: string[];
  loading: boolean;
  onBack: () => void;
  isVisible: boolean;
  displayImage: string;
}

export const RelatedContentDisplay = ({
  article,
  sectionContent,
  sectionImages,
  loading,
  onBack,
  isVisible,
  displayImage
}: RelatedContentDisplayProps) => {
  return (
    <motion.div 
      className="h-full w-full relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0">
        <img 
          src={displayImage} 
          alt={article.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90" />
      </div>

      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 text-white p-6 max-w-2xl mx-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-6 bg-white/20 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
            </div>
          ) : sectionContent ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{sectionContent.title}</h2>
                <h3 className="text-xl text-blue-300 mb-4">{article.title}</h3>
              </div>

              <div className="text-white/90 leading-relaxed">
                <p>{sectionContent.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>{article.views?.toLocaleString() || 'Unknown'} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{article.readTime || 5} min read</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`, '_blank')}
                  className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Wikipedia Article
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No additional content</h2>
              <p className="text-white/80 mb-6">
                Unable to load additional sections for this article.
              </p>
              <button
                onClick={() => window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`, '_blank')}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Read Full Wikipedia Article
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
