
import { useState } from "react";
import { Music } from "lucide-react";

const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Music Player Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-black/40 backdrop-blur-lg border border-white/20 text-white hover:bg-black/60 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Music className="w-5 h-5" />
        </button>
      </div>

      {/* Music Player Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 m-4 max-w-md w-full border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Music Player</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center text-gray-400">
              <p className="mb-4">Music player coming soon!</p>
              <p className="text-sm">Enjoy background music while reading articles.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MusicPlayer;
