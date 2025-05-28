
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButtons from "./ActionButtons";

interface FloatingActionButtonsProps {
  currentArticle: any;
  handleTextToSpeech: () => void;
  isReading: boolean;
  speechLoading: boolean;
  setShowShare: (show: boolean) => void;
}

const FloatingActionButtons = ({
  currentArticle,
  handleTextToSpeech,
  isReading,
  speechLoading,
  setShowShare
}: FloatingActionButtonsProps) => {
  const [showActionButtons, setShowActionButtons] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleDiscoverClick = () => navigate('/discover');

  return (
    <>
      {isHomePage && (
        <motion.div 
          className="absolute bottom-20 left-4 z-30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <button 
            onClick={e => {
              e.stopPropagation();
              handleDiscoverClick();
            }}
            className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Compass className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      <motion.div 
        className="absolute bottom-20 right-4 z-30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <button 
          onClick={e => {
            e.stopPropagation();
            setShowActionButtons(!showActionButtons);
          }}
          className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all duration-200 hover:scale-105"
        >
          <AnimatePresence mode="wait">
            {showActionButtons ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Menu className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      <AnimatePresence>
        {showActionButtons && (
          <motion.div 
            className="absolute right-4 bottom-36 bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-white/20 z-30"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ActionButtons 
              currentArticle={currentArticle}
              handleTextToSpeech={handleTextToSpeech}
              isReading={isReading}
              speechLoading={speechLoading}
              setShowShare={setShowShare}
              isMobile={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingActionButtons;
