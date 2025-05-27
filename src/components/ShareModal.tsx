
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-gray-200/50">
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <h3 className="text-gray-900 font-bold text-lg">Share Article</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30">
            <h4 className="text-gray-900 font-semibold mb-3 line-clamp-2">{title}</h4>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-4 py-2 shadow-lg"
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
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl py-3 shadow-lg"
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
