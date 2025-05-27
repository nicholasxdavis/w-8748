
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface LikeButtonProps {
  articleId: string;
  articleTitle: string;
}

// Helper function to convert any string to a valid UUID format
const generateUUIDFromString = (str: string): string => {
  // Create a simple hash-based UUID v4 format
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and pad
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Format as UUID v4
  return `${positiveHash.slice(0, 8)}-${positiveHash.slice(0, 4)}-4${positiveHash.slice(1, 4)}-a${positiveHash.slice(0, 3)}-${positiveHash.slice(0, 12)}`.slice(0, 36);
};

const LikeButton = ({ articleId, articleTitle }: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Convert articleId to UUID format
  const uuidArticleId = generateUUIDFromString(articleId);

  useEffect(() => {
    fetchLikeCount();
    if (user) {
      fetchLikeStatus();
    }
  }, [uuidArticleId, user]);

  const fetchLikeStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', uuidArticleId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error fetching like status:', error);
      setIsLiked(false);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', uuidArticleId);

      setLikeCount(count || 0);
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like articles",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', uuidArticleId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            article_id: uuidArticleId,
            user_id: user.id,
          });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Like error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`p-2 rounded-full transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110 ${
          isLiked 
            ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' 
            : 'bg-black/30 text-white hover:bg-black/50'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      </button>
      <span className="text-white text-xs mt-1 font-medium">{likeCount}</span>
    </div>
  );
};

export default LikeButton;
