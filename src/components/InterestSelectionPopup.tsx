
import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const InterestSelectionPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkIfShouldShow();
      fetchTopics();
    }
  }, [user]);

  const checkIfShouldShow = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_interests')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // Show popup if user has no interests selected yet
      if (!data || data.length === 0) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error checking user interests:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('name');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: "Error loading topics",
        description: "Failed to load interest topics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTopic = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const handleSaveInterests = async () => {
    if (!user || selectedTopics.size === 0) {
      toast({
        title: "Please select at least one topic",
        description: "Choose topics you're interested in to get personalized content",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const interests = Array.from(selectedTopics).map(topicId => ({
        user_id: user.id,
        topic_id: topicId,
      }));

      const { error } = await supabase
        .from('user_interests')
        .insert(interests);

      if (error) throw error;

      toast({
        title: "Interests saved!",
        description: "We'll personalize your content based on your interests",
      });

      setIsVisible(false);
    } catch (error: any) {
      console.error('Error saving interests:', error);
      toast({
        title: "Error saving interests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  if (!isVisible || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 max-w-lg w-full mx-auto border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">What interests you?</h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Select topics you're interested in to get personalized content recommendations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`p-2 sm:p-3 rounded-xl text-left transition-all duration-200 border-2 ${
                  selectedTopics.has(topic.id)
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base sm:text-lg">{topic.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{topic.name}</span>
                  {selectedTopics.has(topic.id) && (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-tight">{topic.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 bg-gray-700 text-white py-2 sm:py-3 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200 text-sm sm:text-base"
            >
              Skip for now
            </button>
            <button
              onClick={handleSaveInterests}
              disabled={loading || selectedTopics.size === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Saving...' : `Save (${selectedTopics.size})`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InterestSelectionPopup;
