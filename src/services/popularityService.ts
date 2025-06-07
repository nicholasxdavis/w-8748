
import { supabase } from '@/integrations/supabase/client';

export interface PopularContent {
  content_id: string;
  content_type: string;
  content_title: string;
  view_count: number;
  like_count: number;
  save_count: number;
  share_count: number;
  popularity_score: number;
  last_updated: string;
}

export const updateContentPopularity = async (
  contentId: string,
  contentType: string,
  contentTitle: string,
  action: 'view' | 'like' | 'save' | 'share'
): Promise<void> => {
  try {
    // First, try to get existing record
    const { data: existing } = await supabase
      .from('content_popularity')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    if (existing) {
      // Update existing record
      const updates: any = { last_updated: new Date().toISOString() };
      
      switch (action) {
        case 'view': updates.view_count = existing.view_count + 1; break;
        case 'like': updates.like_count = existing.like_count + 1; break;
        case 'save': updates.save_count = existing.save_count + 1; break;
        case 'share': updates.share_count = existing.share_count + 1; break;
      }

      // Calculate new popularity score
      const totalEngagement = (updates.like_count || existing.like_count) + 
                            (updates.save_count || existing.save_count) + 
                            (updates.share_count || existing.share_count);
      const viewCount = updates.view_count || existing.view_count;
      updates.popularity_score = viewCount > 0 ? (totalEngagement / viewCount) * 100 : 0;

      await supabase
        .from('content_popularity')
        .update(updates)
        .eq('content_id', contentId)
        .eq('content_type', contentType);
    } else {
      // Create new record
      const newRecord = {
        content_id: contentId,
        content_type: contentType,
        content_title: contentTitle,
        view_count: action === 'view' ? 1 : 0,
        like_count: action === 'like' ? 1 : 0,
        save_count: action === 'save' ? 1 : 0,
        share_count: action === 'share' ? 1 : 0,
        popularity_score: action === 'view' ? 0 : 100,
        last_updated: new Date().toISOString()
      };

      await supabase
        .from('content_popularity')
        .insert(newRecord);
    }
  } catch (error) {
    console.error('Error updating content popularity:', error);
    // Fallback to localStorage
    const localPopularity = JSON.parse(localStorage.getItem('contentPopularity') || '{}');
    const key = `${contentType}_${contentId}`;
    
    if (!localPopularity[key]) {
      localPopularity[key] = {
        content_id: contentId,
        content_type: contentType,
        content_title: contentTitle,
        view_count: 0,
        like_count: 0,
        save_count: 0,
        share_count: 0,
        popularity_score: 0
      };
    }
    
    localPopularity[key][`${action}_count`]++;
    localStorage.setItem('contentPopularity', JSON.stringify(localPopularity));
  }
};

export const getPopularContent = async (
  contentType?: string,
  limit: number = 10
): Promise<PopularContent[]> => {
  try {
    let query = supabase
      .from('content_popularity')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching popular content:', error);
    return [];
  }
};
