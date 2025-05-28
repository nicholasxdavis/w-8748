
import { motion, AnimatePresence } from "framer-motion";

interface DoubleTapHintProps {
  show: boolean;
  message?: string;
}

const DoubleTapHint = ({ show, message = "Double-tap to save" }: DoubleTapHintProps) => (
  <AnimatePresence>
    {show && (
      <motion.div 
        className="fixed top-4 right-4 z-30"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 50, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-black/40 text-white px-3 py-1 rounded-xl text-xs backdrop-blur-md border border-white/20 whitespace-nowrap">
          {message}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default DoubleTapHint;
