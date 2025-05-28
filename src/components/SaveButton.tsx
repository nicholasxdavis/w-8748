
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useSaveArticle } from '@/hooks/useSaveArticle';
import { useAuth } from '@/hooks/useAuth';
import DisappearingLabel from './DisappearingLabel';

interface SaveButtonProps {
  article: {
    id: string;
    title: string;
    content?: string;
    image?: string;
    isBreakingNews?: boolean;
  };
  onClick?: () => void;
}

const SaveButton = ({ article, onClick }: SaveButtonProps) => {
  const { toggleSave, isSaved, isLoading, checkIfSaved } = useSaveArticle();
  const { user } = useAuth();
  const [isArticleSaved, setIsArticleSaved] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Don't show save button for news articles
  if (article.isBreakingNews) {
    return null;
  }

  useEffect(() => {
    if (user) {
      const checkSaveStatus = async () => {
        const saved = await checkIfSaved(article.id);
        setIsArticleSaved(saved);
      };
      
      checkSaveStatus();
    }
  }, [article.id, checkIfSaved, user]);

  useEffect(() => {
    if (user) {
      setIsArticleSaved(isSaved(article.id));
    }
  }, [article.id, isSaved, user]);

  const handleClick = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      setTimeout(() => setShowAuthPrompt(false), 2000);
      return;
    }

    await toggleSave(article);
    onClick?.();
  };

  if (isLoading) {
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
    <>
      <div className="flex flex-col items-center">
        <button
          onClick={handleClick}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110"
        >
          {user && isArticleSaved ? (
            <BookmarkCheck className="w-4 h-4 text-blue-400" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
        <span className="text-white text-xs mt-1 font-medium">
          {user && isArticleSaved ? 'Saved' : 'Save'}
        </span>
      </div>
      
      <DisappearingLabel 
        show={showAuthPrompt} 
        message="Sign in to save articles" 
      />
    </>
  );
};

export default SaveButton;
