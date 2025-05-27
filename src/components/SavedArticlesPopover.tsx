
import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SavedArticle {
  id: string;
  article_id: string;
  article_title: string;
  article_content: string;
  article_image: string;
  saved_at: string;
}

const SavedArticlesPopover = () => {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSavedArticles();
    }
  }, [user]);

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
      toast({
        title: "Error loading saved articles",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleClick = (article: SavedArticle) => {
    // Create a proper article object to pass to the search
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
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/auth')}
        className="text-gray-400 hover:text-blue-400 transition-all p-1 sm:p-1.5 hover:bg-gray-800/50 rounded-xl hover:scale-105"
      >
        <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-blue-400 transition-all p-1 sm:p-1.5 hover:bg-gray-800/50 rounded-xl hover:scale-105 relative"
        >
          <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
          {savedArticles.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white">
              {savedArticles.length > 9 ? '9+' : savedArticles.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 sm:w-96 p-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl"
        align="end"
      >
        <div className="p-4 border-b border-gray-700/30">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-400" />
            Saved Articles
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        
        <div className="max-h-80 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Loading saved articles...</p>
            </div>
          ) : savedArticles.length === 0 ? (
            <div className="p-6 text-center">
              <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h4 className="font-medium text-white mb-2">No saved articles yet</h4>
              <p className="text-gray-400 text-sm">
                Articles you save will appear here for easy access
              </p>
            </div>
          ) : (
            <div className="p-2">
              {savedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-800/60 transition-all duration-200 group"
                >
                  {article.article_image ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                      <img 
                        src={article.article_image} 
                        alt={article.article_title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-300 font-bold text-sm">
                        {article.article_title[0]}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {article.article_title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Saved {new Date(article.saved_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SavedArticlesPopover;
