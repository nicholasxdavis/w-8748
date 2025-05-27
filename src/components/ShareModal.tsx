
import { useState } from 'react';
import { X, Copy, Check, Share, Link2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-gray-900 font-semibold text-lg">Share Article</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-gray-900 font-medium mb-3 line-clamp-2">{title}</h4>
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="bg-transparent text-gray-600 text-sm flex-1 outline-none"
              />
              <Button
                onClick={handleCopy}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
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
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3"
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
