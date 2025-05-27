
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
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-900 transition-colors mr-4"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Saved</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto h-full">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="bg-gray-900/50 rounded-3xl p-8 max-w-sm">
              <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Save articles for later</h3>
              <p className="text-gray-400 mb-6">Sign in to bookmark articles and access them across all your devices.</p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search saved articles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full mb-4"></div>
                  <p className="text-gray-400">Loading your saved articles...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
                  <Bookmark className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {searchQuery ? 'No results found' : 'No saved articles yet'}
                  </h3>
                  <p className="text-gray-400">
                    {searchQuery 
                      ? `No saved articles match "${searchQuery}"`
                      : 'Start exploring and save articles that interest you'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="p-4 hover:bg-gray-900/30 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white line-clamp-2 mb-2 leading-tight">
                            {article.article_title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Saved {new Date(article.saved_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        {article.article_image && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
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
