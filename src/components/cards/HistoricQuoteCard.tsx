
import { motion } from "framer-motion";
import { Quote, Share2 } from "lucide-react";
import { HistoricQuote } from "../../services/factsService";

interface HistoricQuoteCardProps {
  quote: HistoricQuote;
  onShare?: () => void;
}

const HistoricQuoteCard = ({ quote, onShare }: HistoricQuoteCardProps) => {
  return (
    <motion.div 
      className="h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-900 via-orange-900 to-red-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-16 right-12 w-36 h-36 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-24 left-20 w-32 h-32 bg-amber-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-orange-400 rounded-full blur-2xl"></div>
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
            <div className="bg-amber-500/20 p-4 rounded-full border border-amber-500/30">
              <Quote className="w-8 h-8 text-amber-400" />
            </div>
          </motion.div>

          <motion.h2 
            className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Historic Quote
          </motion.h2>

          {/* Quote Content */}
          <motion.div 
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <p className="text-xl sm:text-2xl leading-relaxed mb-4 text-gray-100 italic">
              "{quote.quote}"
            </p>
            <p className="text-lg text-amber-300 font-medium">
              — {quote.author}
            </p>
          </motion.div>

          {/* Category & Year */}
          <motion.div 
            className="flex items-center justify-center space-x-4 text-sm text-gray-300 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {quote.category && (
              <span className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
                {quote.category}
              </span>
            )}
            {quote.year && (
              <span className="text-gray-400">
                {quote.year}
              </span>
            )}
          </motion.div>

          {/* Share Button */}
          {onShare && (
            <motion.button
              onClick={onShare}
              className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-amber-600/20 hover:bg-amber-600/30 rounded-full border border-amber-500/30 transition-all duration-200 hover:scale-105"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <Share2 className="w-4 h-4" />
              <span>Share this quote</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HistoricQuoteCard;
