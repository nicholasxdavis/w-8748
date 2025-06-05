
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useSaveArticle } from '@/hooks/useSaveArticle';
import { useAuth } from '@/hooks/useAuth';
import { isFactArticle, isQuoteArticle } from '@/services/contentService';
import { ContentItem } from '@/services/contentService';
import AuthPromptDialog from './AuthPromptDialog';

interface SaveButtonProps {
  article: ContentItem | {
    id: string | number;
    title: string;
    content?: string;
    image?: string;
    isBreakingNews?: boolean;
    type?: 'fact' | 'quote';
    author?: string;
    category?: string;
    text?: string;
  };
  onClick?: () => void;
}

// Helper functions to safely check article types
const isFactType = (article: SaveButtonProps['article']): boolean => {
  return 'type' in article && article.type === 'fact';
};

const isQuoteType = (article: SaveButtonProps['article']): boolean => {
  return 'type' in article && article.type === 'quote';
};

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
      if (isFactType(article) || isQuoteType(article)) {
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
    if (user && !isFactType(article) && !isQuoteType(article)) {
      setIsArticleSaved(isSaved(article.id.toString()));
    }
  }, [article.id, isSaved, user, article]);

  const handleClick = async () => {
    // For facts and quotes, save to localStorage
    if (isFactType(article) || isQuoteType(article)) {
      const savedItems = JSON.parse(localStorage.getItem('savedFactsQuotes') || '[]');
      const isCurrentlySaved = savedItems.some((item: any) => item.id === article.id);
      
      if (isCurrentlySaved) {
        // Remove from localStorage
        const updatedItems = savedItems.filter((item: any) => item.id !== article.id);
        localStorage.setItem('savedFactsQuotes', JSON.stringify(updatedItems));
        setIsArticleSaved(false);
      } else {
        // Add to localStorage
        const newItem: any = {
          id: article.id,
          title: article.title,
          content: article.content,
          image: article.image,
          savedAt: new Date().toISOString()
        };

        // Safely add type-specific properties
        if ('type' in article) {
          newItem.type = article.type;
        }
        
        if (isQuoteType(article) && 'author' in article) {
          newItem.author = article.author;
          newItem.text = article.text;
          newItem.category = article.category;
        }
        
        if (isFactType(article) && 'category' in article) {
          newItem.category = article.category;
        }

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
      
      {!isFactType(article) && !isQuoteType(article) && (
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
