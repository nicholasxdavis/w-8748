
import { useState, useEffect } from "react";
import { ArrowLeft, User, Tags, Settings as SettingsIcon } from "lucide-react";
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-200 mb-6 group"
          >
            <div className="p-2 rounded-xl hover:bg-gray-800/60 transition-all duration-200">
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-400/30">
              <SettingsIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700/30 bg-gray-800/20">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "profile"
                  ? "text-blue-400 border-b-2 border-blue-400 bg-blue-600/10"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
            >
              <User className="w-5 h-5 inline mr-3" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === "topics"
                  ? "text-blue-400 border-b-2 border-blue-400 bg-blue-600/10"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }`}
            >
              <Tags className="w-5 h-5 inline mr-3" />
              Interest Topics
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "profile" && (
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your last name"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {activeTab === "topics" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-white mb-2">Choose Your Interests</h3>
                  <p className="text-gray-400">
                    Select topics you're interested in to personalize your content experience
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.id)}
                      className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        selectedTopics.includes(topic.id)
                          ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/25 scale-105"
                          : "bg-gray-800/50 text-gray-300 border-gray-600/50 hover:bg-gray-700/60 hover:border-gray-500/50 hover:scale-105"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{topic.icon}</span>
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
