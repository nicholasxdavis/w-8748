
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
        className="text-gray-400 hover:text-blue-400 transition-all p-2 hover:bg-gray-800/50 rounded-xl hover:scale-105 w-10 h-10"
      >
        <Bookmark className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`text-gray-400 hover:text-blue-400 transition-all p-2 hover:bg-gray-800/50 rounded-xl hover:scale-105 w-10 h-10 ${
          isAnimating ? 'animate-pulse text-blue-400' : ''
        }`}
      >
        <Bookmark className={`w-4 h-4 transition-colors duration-300 ${
          isAnimating ? 'text-blue-400' : ''
        }`} />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl max-h-[80vh]">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-blue-400" />
                  Saved Articles
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-800/60 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm">Loading saved articles...</p>
                </div>
              ) : savedArticles.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">No saved articles yet</h4>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Articles you save will appear here for easy access
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {savedArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-800/60 transition-all duration-300 group mb-1"
                    >
                      <div className="flex items-center w-full space-x-3">
                        {article.article_image ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 relative">
                            <img 
                              src={article.article_image} 
                              alt={article.article_title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-300 font-bold text-lg">
                              {article.article_title[0]}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                            {article.article_title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                            {article.article_content}
                          </p>
                          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                            Saved {new Date(article.saved_at).toLocaleDateString()}
                          </span>
                        </div>
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
