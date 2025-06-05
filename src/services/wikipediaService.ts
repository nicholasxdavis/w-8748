
import { getPlaceholderImage } from './imageService';
import { Language } from './languageService';

export interface WikipediaArticle {
  id: number;
  title: string;
  content: string;
  image: string;
  url: string;
  category: string;
  wordCount: number;
  readingTime: number;
  readTime: number; // Alternative property name used in some components
  sections: WikipediaSection[];
  tags: string[]; // Add tags property
}

export interface WikipediaSection {
  title: string;
  content: string;
  level: number;
}

const cache = new Map<string, any>();

const cleanSectionTitle = (title: string): string => {
  return title.replace(/==/g, '').trim();
};

import { getCurrentLanguage } from './languageService';

const cleanWikipediaExtract = (extract: string): string => {
  if (!extract) return '';
  
  return extract
    .replace(/\s+/g, ' ')
    .replace(/\[\d+\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
};

const generateTagsFromContent = (title: string, content: string, category: string): string[] => {
  const tags = [];
  
  // Add category as a tag
  if (category && category !== 'General') {
    tags.push(category.toLowerCase());
  }
  
  // Extract key terms from title
  const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
  tags.push(...titleWords.slice(0, 2));
  
  // Add some common topic tags based on content keywords
  const keywords = content.toLowerCase();
  if (keywords.includes('science') || keywords.includes('research')) tags.push('science');
  if (keywords.includes('history') || keywords.includes('ancient')) tags.push('history');
  if (keywords.includes('technology') || keywords.includes('computer')) tags.push('tech');
  if (keywords.includes('nature') || keywords.includes('animal')) tags.push('nature');
  
  return [...new Set(tags)].slice(0, 3); // Remove duplicates and limit to 3 tags
};

const processWikipediaArticle = (page: any, category?: string): WikipediaArticle => {
  const language = getCurrentLanguage();
  
  const sections: WikipediaSection[] = [];
  if (page.sections) {
    page.sections.forEach((section: any) => {
      sections.push({
        title: cleanSectionTitle(section.title),
        content: section.text,
        level: section.toclevel
      });
    });
  }

  const cleanContent = cleanWikipediaExtract(page.extract || '');
  const wordCount = cleanContent.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);
  const tags = generateTagsFromContent(page.title, cleanContent, category || 'General');

  return {
    id: page.pageid,
    title: page.title,
    content: cleanContent,
    image: page.thumbnail?.source || getPlaceholderImage(),
    url: `https://${language.wikipediaPrefix}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    category: category || 'General',
    wordCount: wordCount,
    readingTime: readingTime,
    readTime: readingTime, // Alternative property name
    sections: sections,
    tags: tags
  };
};

export const getFullSections = async (articleId: number, title: string, signal?: AbortSignal): Promise<WikipediaSection[]> => {
  const language = getCurrentLanguage();
  
  try {
    const response = await fetch(
      `https://${language.wikipediaPrefix}.wikipedia.org/w/api.php?` +
      `action=parse&format=json&origin=*&page=${encodeURIComponent(title)}&prop=sections|text&section=0`,
      { signal }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.warn('Wikipedia API error:', data.error);
      return [];
    }
    
    const sections: WikipediaSection[] = [];
    
    if (data.parse?.sections) {
      // Get first few sections content
      for (let i = 1; i <= Math.min(3, data.parse.sections.length); i++) {
        const sectionResponse = await fetch(
          `https://${language.wikipediaPrefix}.wikipedia.org/w/api.php?` +
          `action=parse&format=json&origin=*&page=${encodeURIComponent(title)}&prop=text&section=${i}`,
          { signal }
        );
        
        if (sectionResponse.ok) {
          const sectionData = await sectionResponse.json();
          if (sectionData.parse?.text) {
            const textContent = sectionData.parse.text['*'];
            const cleanText = textContent
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\[[^\]]*\]/g, '') // Remove references
              .trim()
              .substring(0, 500); // Limit length
            
            if (cleanText.length > 50) {
              sections.push({
                title: data.parse.sections[i - 1]?.line || `Section ${i}`,
                content: cleanText,
                level: data.parse.sections[i - 1]?.toclevel || 1
              });
            }
          }
        }
      }
    }
    
    return sections;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Error fetching full sections:', error);
    return [];
  }
};

export const getRandomArticles = async (count: number = 8, category?: string): Promise<WikipediaArticle[]> => {
  const language = getCurrentLanguage();
  const cacheKey = `random_articles_${language.code}_${count}_${category || 'general'}`;
  
  if (cache.has(cacheKey)) {
    console.log('Returning cached random articles for language:', language.name);
    return cache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://${language.wikipediaPrefix}.wikipedia.org/api/rest_v1/page/random/summary`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const articles = data.pages.map((page: any) => processWikipediaArticle(page, category));
    cache.set(cacheKey, articles);
    console.log('Fetched random articles for language:', language.name);
    return articles;
  } catch (error) {
    console.error('Error fetching random Wikipedia articles for language:', language.name, error);
    return [];
  }
};

export const searchArticles = async (query: string): Promise<WikipediaArticle[]> => {
  const language = getCurrentLanguage();
  
  if (!query || query.length < 3) return [];

  try {
    const searchUrl = `https://${language.wikipediaPrefix}.wikipedia.org/w/api.php?` +
      `action=query&format=json&origin=*&list=search&srlimit=10&srprop=size&srsearch=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.query || !data.query.search) {
      console.warn('No search results from Wikipedia API');
      return [];
    }

    const articlePromises = data.query.search.map(async (result: any) => {
      const extractUrl = `https://${language.wikipediaPrefix}.wikipedia.org/w/api.php?` +
        `action=query&format=json&origin=*&prop=extracts|pageimages&exintro&explaintext&redirects=1&pithumbsize=200&pageids=${result.pageid}`;
      
      const extractResponse = await fetch(extractUrl);
      if (!extractResponse.ok) {
        console.warn(`Failed to fetch extract for page ID ${result.pageid}`);
        return null;
      }
      const extractData = await extractResponse.json();
      const page = extractData.query?.pages?.[result.pageid];
      return page ? processWikipediaArticle(page) : null;
    });

    const articles = (await Promise.all(articlePromises)).filter(article => article !== null) as WikipediaArticle[];
    return articles;

  } catch (error) {
    console.error('Error searching Wikipedia articles for language:', language.name, error);
    return [];
  }
};
