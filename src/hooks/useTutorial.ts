
import { useState, useEffect } from 'react';

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always show tutorial (removed localStorage check)
    setTimeout(() => {
      setShowTutorial(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    setShowTutorial(true);
  };

  return {
    showTutorial,
    isLoading,
    completeTutorial,
    resetTutorial
  };
};
