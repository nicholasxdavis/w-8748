
import { useState, useEffect } from "react";
import { Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SavedArticle {
  id: string;
  article_id: string;
  article_title: string;
  article_content: string;
  article_image: string;
  saved_at: string;
}

interface SavedArticlesPopupProps {
  onSaveAnimation?: boolean;
}

const SavedArticlesPopup = ({ onSaveAnimation = false }: SavedArticlesPopupProps) => {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (onSaveAnimation) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [onSaveAnimation]);

  useEffect(() => {
    if (isOpen && user) {
      fetchSavedArticles();
    }
  }, [isOpen, user]);

  const fetchSavedArticles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedArticles(data || []);
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleClick = (article: SavedArticle) => {
    const articleObject = {
      id: article.article_id,
      title: article.article_title,
      content: article.article_content,
      image: article.article_image,
      readTime: Math.ceil(article.article_content.split(" ").length / 200),
      views: 0
    };

    navigate(`/?q=${encodeURIComponent(article.article_title)}`, {
      state: { reorderedResults: [articleObject] }
    });
    setIsOpen(false);
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/auth')}
        className="text-gray-400 hover:text-blue-400 transition-all p-2 hover:bg-gray-800/50 rounded-xl hover:scale-105 w-8 h-8"
      >
        <Bookmark className="w-3.5 h-3.5" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`text-gray-400 hover:text-blue-400 transition-all p-2 hover:bg-gray-800/50 rounded-xl hover:scale-105 w-8 h-8 ${
          isAnimating ? 'animate-pulse text-blue-400' : ''
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 transition-colors duration-300 ${
          isAnimating ? 'text-blue-400' : ''
        }`} />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/40 rounded-xl shadow-xl w-full max-w-sm max-h-[70vh] overflow-hidden">
            <div className="p-3 border-b border-gray-700/30 flex items-center justify-between">
              <h3 className="font-medium text-white text-base flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-400" />
                Saved
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-800/60 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-400 text-xs">Loading...</p>
                </div>
              ) : savedArticles.length === 0 ? (
                <div className="p-6 text-center">
                  <Bookmark className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <h4 className="font-medium text-white text-sm mb-1">No saved articles</h4>
                  <p className="text-gray-400 text-xs">
                    Save articles to access them later
                  </p>
                </div>
              ) : (
                <div className="p-1">
                  {savedArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      {article.article_image ? (
                        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
                          <img 
                            src={article.article_image} 
                            alt={article.article_title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-300 font-medium text-xs">
                            {article.article_title[0]}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-xs group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                          {article.article_title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(article.saved_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SavedArticlesPopup;
