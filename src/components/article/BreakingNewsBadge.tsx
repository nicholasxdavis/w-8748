
import { motion } from "framer-motion";

const BreakingNewsBadge = () => (
  <motion.div 
    className="absolute top-20 left-4 z-20"
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.2, duration: 0.4 }}
  >
    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-red-400/30">
      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
      BREAKING NEWS
    </div>
  </motion.div>
);

export default BreakingNewsBadge;
