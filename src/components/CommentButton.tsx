
import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateUUIDFromString } from '@/utils/uuidUtils';

interface CommentButtonProps {
  articleId: string;
  onClick: () => void;
}

const CommentButton = ({ articleId, onClick }: CommentButtonProps) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const uuidArticleId = generateUUIDFromString(articleId || 'unknown');

  const fetchCommentCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', uuidArticleId);

      if (error) throw error;
      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
    } finally {
      setLoading(false);
    }
  }, [uuidArticleId]);

  useEffect(() => {
    fetchCommentCount();
  }, [fetchCommentCount]);

  // Set up real-time subscription for comment count
  useEffect(() => {
    const channel = supabase
      .channel(`comment-count-realtime-${uuidArticleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${uuidArticleId}`
        },
        () => {
          fetchCommentCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uuidArticleId, fetchCommentCount]);

  if (loading) {
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
        onClick={onClick}
        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110"
      >
        <MessageCircle className="w-4 h-4" />
      </button>
      <span className="text-white text-xs mt-1 font-medium">{commentCount}</span>
    </div>
  );
};

export default CommentButton;
