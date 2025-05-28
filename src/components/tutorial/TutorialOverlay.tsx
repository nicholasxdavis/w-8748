
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Hand, Volume2, Share2, X } from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  animation: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Swipe to Explore",
    description: "Scroll up and down to discover amazing articles and content",
    icon: <Hand className="w-8 h-8" />,
    animation: "swipe"
  },
  {
    id: 2,
    title: "Listen to Articles",
    description: "Tap the speaker icon to have articles read aloud",
    icon: <Volume2 className="w-8 h-8" />,
    animation: "pulse"
  },
  {
    id: 3,
    title: "Share Your Favorites",
    description: "Share interesting articles with friends and family",
    icon: <Share2 className="w-8 h-8" />,
    animation: "bounce"
  }
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

const TutorialOverlay = ({ onComplete }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Auto-complete after showing all steps
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 500);
        }, 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
    >
      {/* Background with animated arrows - centered properly */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full max-w-md mx-auto">
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
          >
            <ChevronUp className="w-12 h-12 text-white/20" />
          </motion.div>
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-12 h-12 text-white/20" />
          </motion.div>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all z-60"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Tutorial content */}
      <div className="relative z-10 text-center px-6 max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Animated icon */}
            <motion.div
              animate={
                currentTutorial.animation === "swipe" 
                  ? { y: [-10, 10, -10] }
                  : currentTutorial.animation === "pulse"
                  ? { scale: [1, 1.2, 1] }
                  : { y: [0, -15, 0] }
              }
              transition={{ 
                duration: currentTutorial.animation === "swipe" ? 2 : 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400">
                {currentTutorial.icon}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white"
            >
              {currentTutorial.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 text-lg leading-relaxed"
            >
              {currentTutorial.description}
            </motion.p>

            {/* Progress dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center space-x-2 pt-4"
            >
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep ? "bg-blue-400 w-8" : "bg-white/30"
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Call to action for first step */}
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <p className="text-sm text-gray-400">
              {isMobile ? 'Try swiping up or down now' : 'Try scrolling up or down now'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Gesture animation for first step - different for mobile vs desktop */}
      {currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        >
          {isMobile ? (
            // Mobile: Finger swipe gesture
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-8 h-8 bg-white/60 rounded-full mb-2"
              />
              <motion.div
                animate={{ height: [20, 40, 20] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 bg-white/40 rounded-full"
              />
            </motion.div>
          ) : (
            // Desktop: Mouse scroll gesture
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-20 border-2 border-white/40 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [5, -10, 5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-6 bg-white/60 rounded-full mt-2"
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TutorialOverlay;
