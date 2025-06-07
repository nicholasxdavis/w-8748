
import { useState } from 'react';
import { EyeOff, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trackUserInteraction } from '@/services/algorithmicContentService';
import { ContentItem } from '@/services/contentService';

interface NeverShowAgainButtonProps {
  article: ContentItem;
  onNeverShow?: () => void;
}

const NeverShowAgainButton = ({ article, onNeverShow }: NeverShowAgainButtonProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const getContentTypeLabel = () => {
    if ('isBreakingNews' in article) return 'news';
    if ('type' in article) {
      switch (article.type) {
        case 'fact': return 'facts';
        case 'quote': return 'quotes';
        case 'movie':
        case 'tvshow': return 'movies';
        case 'song':
        case 'album': return 'music';
        case 'stock': return 'stock updates';
        case 'weather': return 'weather reports';
        case 'history': return 'history content';
        case 'featured-picture': return 'featured pictures';
        default: return 'this type of content';
      }
    }
    return 'wiki articles';
  };

  const handleNeverShow = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await trackUserInteraction(user.id, article, 'never_show');
      onNeverShow?.();
    } catch (error) {
      console.error('Error recording never show preference:', error);
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  if (!isConfirming) {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={() => setIsConfirming(true)}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-red-600/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110"
          title={`Never show ${getContentTypeLabel()} again`}
        >
          <EyeOff className="w-4 h-4" />
        </button>
        <span className="text-white text-xs mt-1 font-medium">Hide</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-red-500/50">
      <div className="text-white text-xs text-center mb-2 max-w-24">
        Never show {getContentTypeLabel()}?
      </div>
      <div className="flex gap-1">
        <button
          onClick={handleNeverShow}
          disabled={isLoading}
          className="p-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-xs px-2"
        >
          Yes
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          className="p-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors text-xs px-2"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default NeverShowAgainButton;
