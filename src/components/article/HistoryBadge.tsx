
import { motion } from "framer-motion";
import { history } from "lucide-react";

const HistoryBadge = () => (
  <motion.div 
    className="absolute top-20 left-4 z-20"
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.2, duration: 0.4 }}
  >
    <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-amber-400/30">
      <history className="w-3 h-3" />
      HISTORY
    </div>
  </motion.div>
);

export default HistoryBadge;
