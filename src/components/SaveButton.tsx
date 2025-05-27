
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useSaveArticle } from '@/hooks/useSaveArticle';

interface SaveButtonProps {
  article: {
    id: string;
    title: string;
    content?: string;
    image?: string;
    type?: string;
    isBreakingNews?: boolean;
  };
  onClick?: () => void;
}

const SaveButton = ({ article, onClick }: SaveButtonProps) => {
  const { toggleSave, isSaved, isLoading, checkIfSaved } = useSaveArticle();
  const [isArticleSaved, setIsArticleSaved] = useState(false);

  // Don't show save button for news articles or facts
  if (article.type === 'fact' || article.isBreakingNews) {
    return null;
  }

  useEffect(() => {
    const checkSaveStatus = async () => {
      const saved = await checkIfSaved(article.id);
      setIsArticleSaved(saved);
    };
    
    checkSaveStatus();
  }, [article.id, checkIfSaved]);

  useEffect(() => {
    setIsArticleSaved(isSaved(article.id));
  }, [article.id, isSaved]);

  const handleClick = async () => {
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
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110"
      >
        {isArticleSaved ? (
          <BookmarkCheck className="w-4 h-4 text-blue-400" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </button>
      <span className="text-white text-xs mt-1 font-medium">
        {isArticleSaved ? 'Saved' : 'Save'}
      </span>
    </div>
  );
};

export default SaveButton;
