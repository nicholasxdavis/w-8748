
import { useState, useEffect, useCallback } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { generateUUIDFromString } from '@/utils/uuidUtils';

interface LikeButtonProps {
  articleId: string;
  articleTitle: string;
}

const LikeButton = ({ articleId, articleTitle }: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const uuidArticleId = generateUUIDFromString(articleId || 'unknown');

  const fetchLikeStatus = useCallback(async () => {
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
    }
  }, [user, uuidArticleId]);

  const fetchLikeCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', uuidArticleId);

      if (error) throw error;
      setLikeCount(count || 0);
    } catch (error) {
      console.error('Error fetching like count:', error);
    } finally {
      setInitialLoading(false);
    }
  }, [uuidArticleId]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchLikeCount(),
        user ? fetchLikeStatus() : Promise.resolve()
      ]);
    };

    fetchData();
  }, [fetchLikeCount, fetchLikeStatus, user]);

  // Set up real-time subscription for likes
  useEffect(() => {
    const channel = supabase
      .channel(`likes-realtime-${uuidArticleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `article_id=eq.${uuidArticleId}`
        },
        () => {
          fetchLikeCount();
          if (user) {
            fetchLikeStatus();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uuidArticleId, user, fetchLikeCount, fetchLikeStatus]);

  const handleLike = useCallback(async () => {
    if (!user || !session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like articles",
        variant: "destructive",
      });
      return;
    }

    if (loading) return;

    // Optimistic update
    const wasLiked = isLiked;
    const prevCount = likeCount;
    
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    setLoading(true);

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', uuidArticleId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            article_id: uuidArticleId,
            user_id: user.id,
          });

        if (error) throw error;
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
      
      console.error('Like error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, session, loading, isLiked, likeCount, uuidArticleId, toast]);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
        <span className="text-white text-xs mt-1 font-medium">...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`p-2 rounded-full transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
          isLiked 
            ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30 scale-105' 
            : 'bg-black/30 text-white hover:bg-black/50'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        )}
      </button>
      <span className="text-white text-xs mt-1 font-medium">{likeCount}</span>
    </div>
  );
};

export default LikeButton;
