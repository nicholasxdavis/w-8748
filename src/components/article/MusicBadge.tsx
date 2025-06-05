
import { motion } from "framer-motion";
import { Music } from "lucide-react";

interface MusicBadgeProps {
  type: 'song' | 'album';
}

const MusicBadge = ({ type }: MusicBadgeProps) => (
  <motion.div 
    className="absolute top-20 left-4 z-20"
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.2, duration: 0.4 }}
  >
    <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-green-400/30">
      <Music className="w-3 h-3" />
      {type === 'song' ? 'HIT SONG' : 'TOP ALBUM'}
    </div>
  </motion.div>
);

export default MusicBadge;
