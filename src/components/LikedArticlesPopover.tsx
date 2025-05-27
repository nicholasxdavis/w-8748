
import { useState, useEffect } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LikedArticle {
  id: string;
  article_id: string;
  article_title: string;
  created_at: string;
}

const LikedArticlesPopover = () => {
  const [likedArticles, setLikedArticles] = useState<LikedArticle[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && user) {
      fetchLikedArticles();
    }
  }, [open, user]);

  const fetchLikedArticles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        article_id: item.article_id,
        article_title: item.article_id, // Using article_id as title for now
        created_at: item.created_at
      }));

      setLikedArticles(transformedData);
    } catch (error) {
      console.error('Error fetching liked articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (articleTitle: string) => {
    setOpen(false);
    navigate(`/?q=${encodeURIComponent(articleTitle)}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <Heart className="w-5 h-5 text-gray-300 hover:text-red-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-gray-900 border border-gray-700 shadow-xl rounded-lg" align="end">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Liked Articles</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-red-500 rounded-full mx-auto"></div>
            </div>
          ) : !user ? (
            <div className="p-8 text-center">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Sign in to see liked articles</p>
            </div>
          ) : likedArticles.length === 0 ? (
            <div className="p-8 text-center">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No liked articles yet</p>
            </div>
          ) : (
            likedArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => handleArticleClick(article.article_title)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{article.article_title}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Liked {new Date(article.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LikedArticlesPopover;
