
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommentButtonProps {
  articleId: string;
  onClick: () => void;
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

const CommentButton = ({ articleId, onClick }: CommentButtonProps) => {
  const [commentCount, setCommentCount] = useState(0);

  // Convert articleId to UUID format
  const uuidArticleId = generateUUIDFromString(articleId);

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
