
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const LoadingArticle = () => (
  <motion.div 
    className="h-screen w-screen flex items-center justify-center bg-black"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="text-white text-lg flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin" />
      Loading more amazing content...
    </div>
  </motion.div>
);

export default LoadingArticle;
