
import { useState } from 'react';
import { X, Copy, Check, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  articleId: string;
}

const ShareModal = ({ isOpen, onClose, title, articleId }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?q=${encodeURIComponent(title)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article about ${title} on Lore!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">Share Article</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">{title}</h4>
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="bg-transparent text-gray-300 text-sm flex-1 outline-none"
              />
              <Button
                onClick={handleCopy}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Share className="w-4 h-4 mr-2" />
              Share via...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
