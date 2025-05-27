
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSaveArticle = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const checkIfSaved = useCallback(async (articleId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .maybeSingle();

      if (error) throw error;
      
      const isSaved = !!data;
      setSavedArticles(prev => {
        const updated = new Set(prev);
        if (isSaved) {
          updated.add(articleId);
        } else {
          updated.delete(articleId);
        }
        return updated;
      });
      
      return isSaved;
    } catch (error) {
      console.error('Error checking save status:', error);
      return false;
    }
  }, [user]);

  const toggleSave = useCallback(async (article: {
    id: string;
    title: string;
    content?: string;
    image?: string;
  }) => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    
    try {
      const isSaved = savedArticles.has(article.id);
      
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_articles')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', article.id);

        if (error) throw error;

        setSavedArticles(prev => {
          const updated = new Set(prev);
          updated.delete(article.id);
          return updated;
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_articles')
          .insert({
            user_id: user.id,
            article_id: article.id,
            article_title: article.title,
            article_content: article.content || '',
            article_image: article.image || ''
          });

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            return;
          }
          throw error;
        }

        setSavedArticles(prev => new Set(prev).add(article.id));
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, savedArticles]);

  const isSaved = useCallback((articleId: string) => {
    return savedArticles.has(articleId);
  }, [savedArticles]);

  return {
    toggleSave,
    isSaved,
    isLoading,
    checkIfSaved
  };
};
