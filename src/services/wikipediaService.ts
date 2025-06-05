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
  sections: WikipediaSection[];
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

  return {
    id: page.pageid,
    title: page.title,
    content: cleanWikipediaExtract(page.extract || ''),
    image: page.thumbnail?.source || getPlaceholderImage(),
    url: `https://${language.wikipediaPrefix}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    category: category || 'General',
    wordCount: (page.extract || '').split(' ').length,
    readingTime: Math.ceil((page.extract || '').split(' ').length / 200),
    sections: sections
  };
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
