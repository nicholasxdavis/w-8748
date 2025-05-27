
import { useState, useEffect } from "react";
import { X } from "lucide-react";
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

interface SavedArticlesFullPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const SavedArticlesFullPage = ({ isOpen, onClose }: SavedArticlesFullPageProps) => {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
        .order('saved_at', { ascending: false });

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Saved Articles
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800/60 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-xl font-medium text-white mb-2">Sign in to see saved articles</h3>
              <p className="text-gray-400 mb-4">Create an account to save and access your favorite articles</p>
              <button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mb-4"></div>
              <p className="text-gray-400">Loading saved articles...</p>
            </div>
          ) : savedArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-xl font-medium text-white mb-2">No saved articles yet</h3>
              <p className="text-gray-400">Articles you save will appear here for easy access</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="bg-gray-800/60 rounded-xl p-4 cursor-pointer hover:bg-gray-700/60 transition-all duration-200 group"
                >
                  {article.article_image ? (
                    <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-800">
                      <img 
                        src={article.article_image} 
                        alt={article.article_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center mb-4">
                      <span className="text-gray-300 font-bold text-2xl">
                        {article.article_title[0]}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                    {article.article_title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Saved {new Date(article.saved_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedArticlesFullPage;
