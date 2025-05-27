
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommentButtonProps {
  articleId: string;
  onClick: () => void;
}

const CommentButton = ({ articleId, onClick }: CommentButtonProps) => {
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    fetchCommentCount();
  }, [articleId]);

  const fetchCommentCount = async () => {
    try {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId);

      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className="p-3 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all duration-200"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      <span className="text-white text-sm mt-1">{commentCount}</span>
    </div>
  );
};

export default CommentButton;
