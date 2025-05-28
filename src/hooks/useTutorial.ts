
import { useState, useEffect } from 'react';

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if tutorial has been completed before
    const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial');
    
    if (hasCompletedTutorial) {
      // If tutorial was already completed, don't show it
      setShowTutorial(false);
      setIsLoading(false);
      return;
    }

    // Check if welcome popup has been seen
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (hasSeenWelcome) {
      // If welcome popup was already seen, show tutorial immediately
      setTimeout(() => {
        setShowTutorial(true);
        setIsLoading(false);
      }, 1000);
    } else {
      // If welcome popup hasn't been seen, wait for it
      const checkWelcomeStatus = () => {
        const welcomeSeen = localStorage.getItem('hasSeenWelcome');
        if (welcomeSeen) {
          setTimeout(() => {
            setShowTutorial(true);
            setIsLoading(false);
          }, 500); // Small delay after welcome popup closes
        } else {
          // Keep checking every 500ms
          setTimeout(checkWelcomeStatus, 500);
        }
      };
      
      // Start checking after a short delay
      setTimeout(checkWelcomeStatus, 1000);
      setIsLoading(false);
    }
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
    // Mark tutorial as completed permanently
    localStorage.setItem('hasCompletedTutorial', 'true');
  };

  const resetTutorial = () => {
    // Remove the completion flag and show tutorial again
    localStorage.removeItem('hasCompletedTutorial');
    setShowTutorial(true);
  };

  return {
    showTutorial,
    isLoading,
    completeTutorial,
    resetTutorial
  };
};
