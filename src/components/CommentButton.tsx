
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateUUIDFromString } from '@/utils/uuidUtils';

interface CommentButtonProps {
  articleId: string;
  onClick: () => void;
}

const CommentButton = ({ articleId, onClick }: CommentButtonProps) => {
  const [commentCount, setCommentCount] = useState(0);

  // Convert articleId to UUID format using the improved function
  const uuidArticleId = generateUUIDFromString(articleId || 'unknown');

  useEffect(() => {
    fetchCommentCount();
  }, [uuidArticleId]);

  const fetchCommentCount = async () => {
    try {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', uuidArticleId);

      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  };

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
