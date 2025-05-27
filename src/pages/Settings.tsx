
import { useState, useEffect } from "react";
import { ArrowLeft, User, Tags, Settings as SettingsIcon, ChevronRight } from "lucide-react";
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

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "topics", label: "Interests", icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-900 transition-colors mr-8"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Menu List */}
        <div className="bg-black">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as "profile" | "topics")}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-900/50 transition-colors border-b border-gray-800 ${
                activeTab === item.id ? 'bg-gray-900/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <span className="text-white font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "topics" && (
            <div className="space-y-6">
              <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-2">Your Interests</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Choose topics to personalize your content feed
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.id)}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedTopics.includes(topic.id)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-black border-gray-700 text-gray-300 hover:border-gray-600"
                      }`}
                    >
                      <div className="text-2xl mb-2">{topic.icon}</div>
                      <div className="text-sm font-medium">{topic.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
