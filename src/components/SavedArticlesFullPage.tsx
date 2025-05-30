
import { useState, useEffect } from "react";
import { X, Bookmark, Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredArticles = savedArticles.filter(article =>
    article.article_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="flex items-center px-4 h-12">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-900 transition-colors mr-3"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-white" />
            <h1 className="text-lg font-medium text-white">Saved</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto h-full">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="bg-gray-900/40 rounded-2xl p-6 max-w-xs">
              <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">Save articles</h3>
              <p className="text-gray-400 text-sm mb-4">Sign in to bookmark articles and access them anywhere.</p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search saved articles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-700 border-t-blue-500 rounded-full mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading your articles...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
                  <Bookmark className="w-12 h-12 text-gray-600 mb-3" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {searchQuery ? 'No results found' : 'No saved articles yet'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {searchQuery 
                      ? `No articles match "${searchQuery}"`
                      : 'Start exploring and save articles you find interesting'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="p-3 hover:bg-gray-900/30 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white line-clamp-2 mb-1 leading-snug text-sm">
                            {article.article_title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Saved {new Date(article.saved_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        {article.article_image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                            <img 
                              src={article.article_image} 
                              alt={article.article_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedArticlesFullPage;
