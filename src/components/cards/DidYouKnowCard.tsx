
import { motion } from "framer-motion";
import { Lightbulb, Share2 } from "lucide-react";
import { DidYouKnowFact } from "../../services/factsService";

interface DidYouKnowCardProps {
  fact: DidYouKnowFact;
  onShare?: () => void;
}

const DidYouKnowCard = ({ fact, onShare }: DidYouKnowCardProps) => {
  return (
    <motion.div 
      className="h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-400 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 text-white p-6 max-w-2xl mx-auto text-center"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="bg-yellow-500/20 p-4 rounded-full border border-yellow-500/30">
              <Lightbulb className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>

          <motion.h2 
            className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Did You Know?
          </motion.h2>

          {/* Fact Content */}
          <motion.p 
            className="text-lg sm:text-xl leading-relaxed mb-6 text-gray-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {fact.fact}
          </motion.p>

          {/* Category & Source */}
          <motion.div 
            className="flex items-center justify-center space-x-4 text-sm text-gray-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {fact.category && (
              <span className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                {fact.category}
              </span>
            )}
            {fact.source && (
              <span className="text-gray-400">
                Source: {fact.source}
              </span>
            )}
          </motion.div>

          {/* Share Button */}
          {onShare && (
            <motion.button
              onClick={onShare}
              className="mt-6 flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-full border border-blue-500/30 transition-all duration-200 hover:scale-105"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <Share2 className="w-4 h-4" />
              <span>Share this fact</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DidYouKnowCard;
