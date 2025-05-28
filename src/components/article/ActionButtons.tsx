
import { motion } from "framer-motion";
import { Volume2, VolumeX, Share2, Loader2 } from "lucide-react";
import SaveButton from "../SaveButton";
import { useAuth } from '@/hooks/useAuth';
import AuthPromptDialog from '../AuthPromptDialog';
import { useState } from 'react';

interface ActionButtonsProps {
  currentArticle: any;
  handleTextToSpeech: () => void;
  isReading: boolean;
  speechLoading: boolean;
  setShowShare: (show: boolean) => void;
  isMobile?: boolean;
}

const ActionButtons = ({ 
  currentArticle, 
  handleTextToSpeech, 
  isReading, 
  speechLoading, 
  setShowShare, 
  isMobile = false 
}: ActionButtonsProps) => {
  const { user } = useAuth();
  const [showSpeechAuthDialog, setShowSpeechAuthDialog] = useState(false);

  const handleSpeechClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      setShowSpeechAuthDialog(true);
      return;
    }
    
    handleTextToSpeech();
  };

  return (
    <>
      <motion.div 
        className={`flex ${isMobile ? 'flex-row justify-around' : 'flex-col'} space-y-0 ${isMobile ? 'space-x-3' : 'space-y-2'} z-20`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <SaveButton 
          article={{
            id: String(currentArticle?.id || ''),
            title: currentArticle?.title || '',
            content: currentArticle?.content,
            image: currentArticle?.image,
            isBreakingNews: currentArticle?.isBreakingNews
          }} 
        />
        
        <div className="flex flex-col items-center">
          <button 
            onClick={handleSpeechClick}
            disabled={speechLoading}
            className={`p-2 rounded-full transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110 ${
              isReading 
                ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' 
                : 'bg-black/30 text-white hover:bg-black/50'
            } ${speechLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {speechLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isReading ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <span className="text-white text-xs mt-1 font-medium">
            {speechLoading ? 'Loading...' : isReading ? 'Stop' : 'Listen'}
          </span>
        </div>
        
        {!isMobile && (
          <div className="flex flex-col items-center">
            <button 
              onClick={e => {
                e.stopPropagation();
                setShowShare(true);
              }}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-white text-xs mt-1 font-medium">Share</span>
          </div>
        )}
      </motion.div>

      <AuthPromptDialog 
        open={showSpeechAuthDialog}
        onOpenChange={setShowSpeechAuthDialog}
        type="listen"
      />
    </>
  );
};

export default ActionButtons;
