
import { useState, useEffect } from 'react';

const TUTORIAL_STORAGE_KEY = 'wikitok-tutorial-completed';

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if tutorial has been completed
    const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    
    if (!tutorialCompleted) {
      // Show tutorial after a brief delay for better UX
      setTimeout(() => {
        setShowTutorial(true);
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
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
