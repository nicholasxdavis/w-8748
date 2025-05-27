
import { useState, useEffect } from "react";
import { ArrowLeft, User, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getUserInterests, getTopics, saveUserInterests, removeUserInterest, Topic } from "@/services/userInterestsService";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "topics">("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUserData();
      loadTopics();
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-16">
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-700/30">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "topics"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tags className="w-4 h-4 inline mr-2" />
              Topics
            </button>
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            )}

            {activeTab === "topics" && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Select topics you're interested in to personalize your content:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.id)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTopics.includes(topic.id)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <span className="mr-2">{topic.icon}</span>
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
