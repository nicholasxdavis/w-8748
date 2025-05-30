
import { useState, useEffect } from "react";
import { X, Settings, User, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getUserInterests, getTopics, saveUserInterests, removeUserInterest, Topic } from "@/services/userInterestsService";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup = ({ isOpen, onClose }: SettingsPopupProps) => {
  const [activeTab, setActiveTab] = useState<"profile" | "topics">("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
      loadTopics();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setFirstName(data?.first_name || '');
      setLastName(data?.last_name || '');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTopics = async () => {
    if (!user) return;

    try {
      const [allTopics, userInterests] = await Promise.all([
        getTopics(),
        getUserInterests(user.id)
      ]);

      setTopics(allTopics);
      setSelectedTopics(userInterests.map(interest => interest.topic_id));
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicToggle = async (topicId: string) => {
    if (!user) return;

    const isSelected = selectedTopics.includes(topicId);
    
    try {
      if (isSelected) {
        await removeUserInterest(user.id, topicId);
        setSelectedTopics(prev => prev.filter(id => id !== topicId));
      } else {
        await saveUserInterests(user.id, [topicId]);
        setSelectedTopics(prev => [...prev, topicId]);
      }
    } catch (error) {
      console.error('Error updating topics:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/40 rounded-xl shadow-xl w-full max-w-sm max-h-[70vh] overflow-hidden">
        <div className="p-3 border-b border-gray-700/30 flex items-center justify-between">
          <h3 className="font-medium text-white text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-800/60 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-700/30">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === "profile"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <User className="w-3 h-3 inline mr-1" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("topics")}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === "topics"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Tags className="w-3 h-3 inline mr-1" />
            Topics
          </button>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto">
          {activeTab === "profile" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2"
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          )}

          {activeTab === "topics" && (
            <div className="space-y-3">
              <p className="text-gray-400 text-xs">
                Select topics to personalize your content:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`p-2 rounded-md text-xs font-medium transition-all text-center ${
                      selectedTopics.includes(topic.id)
                        ? "bg-blue-600/80 text-white"
                        : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="block text-sm mb-0.5">{topic.icon}</span>
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;
