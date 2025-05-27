
import { useState, useEffect } from "react";
import { X, Bookmark } from "lucide-react";
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/20 backdrop-blur-xl bg-black/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-400/30">
              <Bookmark className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Saved Articles</h1>
              <p className="text-sm text-gray-400">Your bookmarked content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-gray-800/60 transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
              <div className="p-6 rounded-2xl bg-gray-800/40 border border-gray-700/50 backdrop-blur-xl mb-6">
                <Bookmark className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Sign in Required</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Create an account to save and access your favorite articles across all your devices.</p>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium hover:scale-105"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                <div className="animate-spin w-12 h-12 border-2 border-gray-600 border-t-blue-500 rounded-full"></div>
              </div>
              <p className="text-gray-400 mt-4 font-medium">Loading your saved articles...</p>
            </div>
          ) : savedArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
              <div className="p-6 rounded-2xl bg-gray-800/40 border border-gray-700/50 backdrop-blur-xl">
                <Bookmark className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">No Saved Articles</h3>
                <p className="text-gray-400 leading-relaxed">Start exploring and save articles that interest you. They'll appear here for easy access.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <p className="text-gray-400">
                  {savedArticles.length} saved article{savedArticles.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 cursor-pointer hover:bg-gray-700/40 transition-all duration-300 group hover:scale-105 hover:border-gray-600/50"
                  >
                    {article.article_image ? (
                      <div className="w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-800/50">
                        <img 
                          src={article.article_image} 
                          alt={article.article_title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-xl bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center mb-4 border border-gray-600/30">
                        <span className="text-gray-300 font-bold text-3xl">
                          {article.article_title[0]}
                        </span>
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-3 text-lg leading-tight">
                      {article.article_title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        {new Date(article.saved_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-400/30">
                        <Bookmark className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedArticlesFullPage;
