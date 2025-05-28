
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

interface DisappearingLabelProps {
  show: boolean;
  message: string;
  className?: string;
}

const DisappearingLabel = ({ show, message, className = "" }: DisappearingLabelProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="absolute top-20 right-4 z-20"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-black/40 text-white px-3 py-1 rounded-xl text-xs backdrop-blur-md border border-white/20">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisappearingLabel;
