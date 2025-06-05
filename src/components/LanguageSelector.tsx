
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setCurrentLanguage, Language } from '@/services/languageService';

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
  isCompact?: boolean;
}

const LanguageSelector = ({ onLanguageChange, isCompact = false }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setCurrentLanguage(language.code);
    setIsOpen(false);
    onLanguageChange?.(language);
  };

  if (isCompact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors text-sm"
        >
          <Globe className="w-4 h-4" />
          <span>{selectedLanguage.flag}</span>
          <span>{selectedLanguage.name}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full left-0 mt-1 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-xl z-50 min-w-48"
            >
              <div className="p-2 max-h-64 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLanguage.code === language.code
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-300 text-sm">
        <Globe className="w-4 h-4" />
        <span>Select Language</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageSelect(language)}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-all ${
              selectedLanguage.code === language.code
                ? 'bg-blue-600/80 text-white border border-blue-500'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/50'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="text-xs">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
