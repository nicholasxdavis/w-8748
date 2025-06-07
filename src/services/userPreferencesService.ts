
import { supabase } from '@/integrations/supabase/client';

export interface UserPreference {
  id: string;
  user_id: string;
  content_type: 'news' | 'wiki' | 'facts' | 'quotes' | 'movies' | 'music' | 'stocks' | 'weather' | 'history' | 'featured-picture';
  action: 'like' | 'dislike' | 'save' | 'share' | 'never_show';
  content_id: string;
  content_title: string;
  content_category?: string;
  created_at: string;
}

export interface ContentFilter {
  content_type: string;
  blocked: boolean;
  reason: 'never_show' | 'user_preference';
}

export const recordUserAction = async (
  userId: string,
  contentType: UserPreference['content_type'],
  action: UserPreference['action'],
  contentId: string,
  contentTitle: string,
  contentCategory?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        content_type: contentType,
        action,
        content_id: contentId,
        content_title: contentTitle,
        content_category: contentCategory
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error recording user action:', error);
    // Fallback to localStorage for offline functionality
    const localPrefs = JSON.parse(localStorage.getItem('userPreferences') || '[]');
    localPrefs.push({
      user_id: userId,
      content_type: contentType,
      action,
      content_id: contentId,
      content_title: contentTitle,
      content_category: contentCategory,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('userPreferences', JSON.stringify(localPrefs));
  }
};

export const getUserPreferences = async (userId: string): Promise<UserPreference[]> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('userPreferences') || '[]');
  }
};

export const getContentFilters = async (userId: string): Promise<ContentFilter[]> => {
  try {
    const preferences = await getUserPreferences(userId);
    const filters: ContentFilter[] = [];
    
    // Group by content type to find blocking preferences
    const typeGroups = preferences.reduce((acc, pref) => {
      if (!acc[pref.content_type]) acc[pref.content_type] = [];
      acc[pref.content_type].push(pref);
      return acc;
    }, {} as Record<string, UserPreference[]>);

    Object.entries(typeGroups).forEach(([contentType, prefs]) => {
      const neverShowCount = prefs.filter(p => p.action === 'never_show').length;
      const totalInteractions = prefs.length;
      
      // Block if user explicitly said never show, or if they have high dislike ratio
      const dislikeRatio = prefs.filter(p => p.action === 'dislike').length / totalInteractions;
      
      if (neverShowCount > 0 || dislikeRatio > 0.7) {
        filters.push({
          content_type: contentType,
          blocked: true,
          reason: neverShowCount > 0 ? 'never_show' : 'user_preference'
        });
      }
    });

    return filters;
  } catch (error) {
    console.error('Error getting content filters:', error);
    return [];
  }
};

export const getUserContentScore = (preferences: UserPreference[], contentType: string, category?: string): number => {
  const relevantPrefs = preferences.filter(p => 
    p.content_type === contentType && (!category || p.content_category === category)
  );
  
  if (relevantPrefs.length === 0) return 0.5; // Neutral score
  
  let score = 0;
  relevantPrefs.forEach(pref => {
    switch (pref.action) {
      case 'like': score += 1; break;
      case 'save': score += 1.5; break;
      case 'share': score += 1.2; break;
      case 'dislike': score -= 1; break;
      case 'never_show': score -= 5; break;
    }
  });
  
  return Math.max(0, Math.min(1, (score / relevantPrefs.length + 1) / 2));
};
