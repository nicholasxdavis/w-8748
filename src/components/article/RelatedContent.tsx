
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, Eye } from "lucide-react";
import { isNewsArticle } from "../../services/contentService";
import { getArticleImage } from "../../utils/articleHelpers";

interface RelatedContentProps {
  article: any;
  onBack: () => void;
  isVisible: boolean;
}

const RelatedContent = ({ article, onBack, isVisible }: RelatedContentProps) => {
  const [relatedInfo, setRelatedInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && article && !isNewsArticle(article)) {
      fetchRelatedInfo();
    }
  }, [isVisible, article]);

  const fetchRelatedInfo = async () => {
    if (loading || !article || isNewsArticle(article)) return;
    
    setLoading(true);
    try {
      // Fetch additional information about the Wikipedia article
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        prop: 'extracts|info|categories',
        pageids: article.id.toString(),
        exsectionformat: 'wiki',
        explaintext: '1',
        exlimit: '1',
        inprop: 'url'
      });

      const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      const data = await response.json();
      
      if (data.query?.pages) {
        const page = Object.values(data.query.pages)[0] as any;
        
        // Get categories for this article
        const categories = page.categories?.slice(0, 5).map((cat: any) => 
          cat.title.replace('Category:', '')
        ) || [];

        setRelatedInfo({
          fullUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`,
          categories,
          lastModified: page.touched,
          pageLength: page.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching related info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isNewsArticle(article)) {
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
            This is a news article. Related content is available for Wikipedia articles only.
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
  }

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
          <div>
            <h2 className="text-2xl font-bold mb-2">About this article</h2>
            <h3 className="text-xl text-blue-300">{article.title}</h3>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>{article.views?.toLocaleString() || 'Unknown'} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{article.readTime || 5} min read</span>
                </div>
              </div>

              {relatedInfo?.categories && relatedInfo.categories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-blue-300">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedInfo.categories.map((category: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs border border-white/20"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/20">
                <button
                  onClick={() => window.open(relatedInfo?.fullUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`, '_blank')}
                  className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Wikipedia Article
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RelatedContent;
