
import { useState, useEffect } from 'react';
import { X, Sparkles, Search, Bookmark, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { Language } from '@/services/languageService';

const WelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showLanguageStep, setShowLanguageStep] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleGetStarted = () => {
    setShowLanguageStep(true);
  };

  const handleLanguageSelected = (language: Language) => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
    // Refresh the page to load content in the selected language
    window.location.reload();
  };

  const handleSkipLanguage = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full mx-auto border border-gray-700/50 shadow-2xl relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {!showLanguageStep ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to Lore</h2>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Discover fascinating articles and breaking news in a beautiful, immersive experience.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Search className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Search & Discover</p>
                        <p className="text-gray-400 text-xs">Find articles and news on any topic</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bookmark className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Save Articles</p>
                        <p className="text-gray-400 text-xs">Bookmark your favorite content for later</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGetStarted}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Get Started
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="language"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">Choose Your Language</h2>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Select your preferred language to get content tailored to your region.
                  </p>

                  <div className="mb-6">
                    <LanguageSelector onLanguageChange={handleLanguageSelected} />
                  </div>

                  <button
                    onClick={handleSkipLanguage}
                    className="w-full text-gray-400 hover:text-white py-2 rounded-xl font-medium transition-colors text-sm"
                  >
                    Skip for now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
