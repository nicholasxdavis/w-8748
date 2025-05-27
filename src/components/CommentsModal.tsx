
import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface CommentsModalProps {
  articleId: string;
  articleTitle: string;
  isOpen: boolean;
  onClose: () => void;
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

const CommentsModal = ({ articleId, articleTitle, isOpen, onClose }: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Convert articleId to UUID format
  const uuidArticleId = generateUUIDFromString(articleId);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, uuidArticleId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', uuidArticleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session || !newComment.trim()) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: uuidArticleId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast({
        title: "Comment added",
        description: "Your comment has been posted!",
      });
    } catch (error: any) {
      console.error('Comment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-gray-900 w-full max-w-md h-2/3 rounded-t-3xl border-t border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <ScrollArea className="h-full pb-20">
          <div className="p-4 space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        U
                      </span>
                    </div>
                    <span className="text-white text-sm font-medium">
                      Anonymous User
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {user && session ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-gray-800 border-gray-700 text-white flex-1"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
            <p className="text-gray-400 text-center text-sm">
              Sign in to leave a comment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;
