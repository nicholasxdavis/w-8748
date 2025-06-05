
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useSaveArticle } from '@/hooks/useSaveArticle';
import { useAuth } from '@/hooks/useAuth';
import { isFactArticle, isQuoteArticle } from '@/services/contentService';
import { ContentItem } from '@/services/contentService';
import AuthPromptDialog from './AuthPromptDialog';

interface SaveButtonProps {
  article: ContentItem;
  onClick?: () => void;
}

const SaveButton = ({ article, onClick }: SaveButtonProps) => {
  const { toggleSave, isSaved, isLoading, checkIfSaved } = useSaveArticle();
  const { user } = useAuth();
  const [isArticleSaved, setIsArticleSaved] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Don't show save button for news articles
  if ('isBreakingNews' in article && article.isBreakingNews) {
    return null;
  }

  useEffect(() => {
    const checkSaveStatus = async () => {
      // For facts and quotes, check localStorage
      if (isFactArticle(article) || isQuoteArticle(article)) {
        const savedItems = JSON.parse(localStorage.getItem('savedFactsQuotes') || '[]');
        setIsArticleSaved(savedItems.some((item: any) => item.id === article.id));
      } else if (user) {
        const saved = await checkIfSaved(article.id.toString());
        setIsArticleSaved(saved);
      }
    };
    
    checkSaveStatus();
  }, [article.id, checkIfSaved, user, article]);

  useEffect(() => {
    if (user && !isFactArticle(article) && !isQuoteArticle(article)) {
      setIsArticleSaved(isSaved(article.id.toString()));
    }
  }, [article.id, isSaved, user, article]);

  const handleClick = async () => {
    // For facts and quotes, save to localStorage
    if (isFactArticle(article) || isQuoteArticle(article)) {
      const savedItems = JSON.parse(localStorage.getItem('savedFactsQuotes') || '[]');
      const isCurrentlySaved = savedItems.some((item: any) => item.id === article.id);
      
      if (isCurrentlySaved) {
        // Remove from localStorage
        const updatedItems = savedItems.filter((item: any) => item.id !== article.id);
        localStorage.setItem('savedFactsQuotes', JSON.stringify(updatedItems));
        setIsArticleSaved(false);
      } else {
        // Add to localStorage
        const newItem = {
          id: article.id,
          title: article.title,
          content: article.content,
          image: article.image,
          type: article.type,
          ...(isQuoteArticle(article) && {
            author: article.author,
            category: article.category,
            text: article.text
          }),
          ...(isFactArticle(article) && {
            category: article.category
          }),
          savedAt: new Date().toISOString()
        };
        savedItems.push(newItem);
        localStorage.setItem('savedFactsQuotes', JSON.stringify(savedItems));
        setIsArticleSaved(true);
      }
      onClick?.();
      return;
    }

    // For other articles, use the existing save system
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    // Convert article to the format expected by useSaveArticle
    const articleForSave = {
      id: article.id.toString(),
      title: article.title,
      content: article.content,
      image: article.image,
      isBreakingNews: 'isBreakingNews' in article ? article.isBreakingNews : false
    };

    await toggleSave(articleForSave);
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
      
      {!isFactArticle(article) && !isQuoteArticle(article) && (
        <AuthPromptDialog 
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          type="save"
        />
      )}
    </>
  );
};

export default SaveButton;
