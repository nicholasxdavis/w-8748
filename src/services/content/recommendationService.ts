
import { supabase } from '@/integrations/supabase/client';
import { WikipediaArticle } from '../wikipediaService';

interface SavedArticlePattern {
  topics: string[];
  categories: string[];
  keywords: string[];
}

export const getSavedArticlePatterns = async (userId: string): Promise<SavedArticlePattern> => {
  try {
    const { data, error } = await supabase
      .from('saved_articles')
      .select('article_title, article_content')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { topics: [], categories: [], keywords: [] };
    }

    // Extract patterns from saved articles
    const topics = new Set<string>();
    const categories = new Set<string>();
    const keywords = new Set<string>();

    data.forEach(article => {
      // Extract keywords from titles and content
      const text = `${article.article_title} ${article.article_content}`.toLowerCase();
      
      // Simple keyword extraction (can be enhanced with NLP)
      const words = text.match(/\b\w{4,}\b/g) || [];
      words.forEach(word => {
        if (word.length > 4 && !commonWords.includes(word)) {
          keywords.add(word);
        }
      });
    });

    return {
      topics: Array.from(topics),
      categories: Array.from(categories),
      keywords: Array.from(keywords).slice(0, 10) // Top 10 keywords
    };
  } catch (error) {
    console.error('Error getting saved article patterns:', error);
    return { topics: [], categories: [], keywords: [] };
  }
};

const commonWords = [
  'that', 'with', 'have', 'this', 'will', 'been', 'from', 'they', 'know', 'want',
  'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'could'
];

export const getRecommendedContent = async (
  userId: string, 
  count: number = 3
): Promise<WikipediaArticle[]> => {
  try {
    const patterns = await getSavedArticlePatterns(userId);
    
    if (patterns.keywords.length === 0) {
      return [];
    }

    // Use patterns to search for similar content
    const { searchArticles } = await import('../wikipediaService');
    const searchPromises = patterns.keywords.slice(0, 3).map(keyword =>
      searchArticles(keyword).catch(() => [])
    );

    const results = await Promise.all(searchPromises);
    const allRecommended = results.flat();
    
    // Remove duplicates and return limited results
    const unique = allRecommended.filter((article, index, arr) => 
      arr.findIndex(a => a.id === article.id) === index
    );
    
    return unique.slice(0, count);
  } catch (error) {
    console.error('Error getting recommended content:', error);
    return [];
  }
};
