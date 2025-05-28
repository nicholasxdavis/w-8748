
import { useState, useEffect } from 'react';

const TUTORIAL_STORAGE_KEY = 'wikitok-tutorial-completed';

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always show tutorial for now (remove localStorage check)
    setTimeout(() => {
      setShowTutorial(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    isLoading,
    completeTutorial,
    resetTutorial
  };
};
