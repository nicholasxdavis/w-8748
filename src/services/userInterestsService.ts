
import { supabase } from '@/integrations/supabase/client';

export interface UserInterest {
  id: string;
  user_id: string;
  topic_id: string;
  created_at: string;
  topic?: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export const getUserInterests = async (userId: string): Promise<UserInterest[]> => {
  try {
    const { data, error } = await supabase
      .from('user_interests')
      .select(`
        *,
        topic:topics(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user interests:', error);
    throw error;
  }
};

export const getTopics = async (): Promise<Topic[]> => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const saveUserInterests = async (userId: string, topicIds: string[]): Promise<void> => {
  try {
    const interests = topicIds.map(topicId => ({
      user_id: userId,
      topic_id: topicId,
    }));

    const { error } = await supabase
      .from('user_interests')
      .insert(interests);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving user interests:', error);
    throw error;
  }
};

export const removeUserInterest = async (userId: string, topicId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)
      .eq('topic_id', topicId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing user interest:', error);
    throw error;
  }
};

export const hasUserInterests = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_interests')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) throw error;
    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('Error checking user interests:', error);
    throw error;
  }
};
