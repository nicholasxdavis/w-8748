
import { WikipediaArticle, WikipediaResponse, WikipediaSection } from './types';
import { fetchWikipediaContent } from './wikipediaApi';

const transformToArticle = async (page: any): Promise<WikipediaArticle | null> => {
  if (!page || page.missing || !page.extract || page.extract.length < 100) {
    return null;
  }

  const title = page.title;
  const content = page.extract;
  const image = page.thumbnail?.source || '';
  
  // Simplified section fetching - only get 2-3 sections max to improve performance
  const sections = await getSimplifiedSections(page.pageid, title);
  
  const readTime = Math.ceil(content.length / 1000);
  const views = Math.floor(Math.random() * 100000) + 1000;
  const citations = Math.floor(Math.random() * 50) + 5;
  
  const tags = page.categories?.slice(0, 3).map((cat: any) => 
    cat.title.replace('Category:', '')
  ) || ['General'];

  return {
    id: page.pageid,
    title,
    content,
    image,
    citations,
    readTime,
    views,
    tags,
    relatedArticles: [],
    sections
  };
};

// Simplified and faster section fetching
const getSimplifiedSections = async (pageId: number, title: string): Promise<WikipediaSection[]> => {
  try {
    console.log(`Fetching simplified sections for: ${title}`);
    
    // Get only section list first
    const parseParams = new URLSearchParams({
      action: 'parse',
      format: 'json',
      origin: '*',
      page: title,
      prop: 'sections',
      disabletoc: '1'
    });

    const parseResponse = await fetch(`https://en.wikipedia.org/w/api.php?${parseParams}`);
    if (!parseResponse.ok) return [];
    
    const parseData = await parseResponse.json();
    
    if (!parseData.parse?.sections?.length) {
      console.log('No sections found');
      return [];
    }

    // Get basic article images once
    const articleImages = await getBasicImages(pageId);
    
    const sections: WikipediaSection[] = [];
    // Limit to first 3 sections only for performance
    const sectionsToFetch = parseData.parse.sections.slice(0, 3);
    
    for (let i = 0; i < sectionsToFetch.length; i++) {
      const section = sectionsToFetch[i];
      
      // Skip common non-content sections
      if (section.line.toLowerCase().includes('contents') || 
          section.line.toLowerCase().includes('references') ||
          section.line.toLowerCase().includes('external') ||
          section.line.toLowerCase().includes('see also') ||
          section.line.toLowerCase().includes('notes')) {
        continue;
      }

      try {
        // Get section content with timeout
        const sectionContent = await Promise.race([
          getSectionContent(title, section.index),
          new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Section timeout')), 3000)
          )
        ]);
        
        if (sectionContent && sectionContent.length > 100) {
          sections.push({
            title: section.line,
            content: sectionContent,
            image: articleImages[i] || articleImages[0] || ''
          });
        }
      } catch (error) {
        console.warn(`Skipping section ${section.line} due to timeout`);
        continue;
      }
    }
    
    console.log(`Processed ${sections.length} sections for ${title}`);
    return sections.slice(0, 2); // Max 2 sections for performance
    
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
};

const getSectionContent = async (title: string, sectionIndex: string): Promise<string> => {
  const sectionParams = new URLSearchParams({
    action: 'parse',
    format: 'json',
    origin: '*',
    page: title,
    section: sectionIndex,
    prop: 'text',
    disabletoc: '1'
  });

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${sectionParams}`);
  if (!response.ok) throw new Error('Section fetch failed');
  
  const data = await response.json();
  const htmlContent = data.parse?.text?.['*'];
  
  return htmlContent ? extractTextFromHtml(htmlContent) : '';
};

// Simplified image fetching
const getBasicImages = async (pageId: number): Promise<string[]> => {
  try {
    const imagesParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      pageids: pageId.toString(),
      prop: 'images',
      imlimit: '5' // Reduced from 20
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${imagesParams}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0] as any;
    
    if (!page?.images?.length) return [];

    // Get first 3 image files only
    const imageFiles = page.images
      .filter((img: any) => {
        const title = img.title.toLowerCase();
        return (title.includes('.jpg') || title.includes('.jpeg') || title.includes('.png'));
      })
      .slice(0, 3)
      .map((img: any) => img.title);

    if (!imageFiles.length) return [];

    // Get URLs for these images
    const imageUrlsParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      titles: imageFiles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: '600' // Reduced size
    });

    const imageUrlsResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imageUrlsParams}`);
    if (!imageUrlsResponse.ok) return [];
    
    const imageUrlsData = await imageUrlsResponse.json();
    return Object.values(imageUrlsData.query?.pages || {})
      .map((page: any) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url)
      .filter(Boolean) as string[];
  } catch (error) {
    console.warn('Error fetching images:', error);
    return [];
  }
};

// Improved text extraction
const extractTextFromHtml = (html: string): string => {
  let text = html;
  
  // Remove scripts, styles, and common Wikipedia elements
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/\.mw-parser-output[^}]*}/g, '');
  text = text.replace(/@media[^}]*{[^}]*}/g, '');
  text = text.replace(/\.(reflist|citation|navbox|infobox)[^}]*{[^}]*}/gi, '');
  
  // Remove edit links and citations
  text = text.replace(/\[edit\]/gi, '');
  text = text.replace(/\[citation needed\]/gi, '');
  text = text.replace(/\[\d+\]/g, '');
  
  // Remove HTML tags and entities
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/&[^;]+;/g, ' ');
  
  // Remove CSS and MediaWiki markup
  text = text.replace(/\{[^}]*\}/g, '');
  text = text.replace(/\[\[[^\]]*\]\]/g, '');
  text = text.replace(/\{\{[^}]*\}\}/g, '');
  
  // Clean whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n+/g, ' ');
  
  return text.trim();
};

// Simplified related articles
const getRelatedArticles = async (article: WikipediaArticle): Promise<WikipediaArticle[]> => {
  try {
    // Simplified - just get random articles instead of complex category search
    return getRandomArticles(3);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
};

// Optimized random articles function
const getRandomArticles = async (count: number = 3, category?: string): Promise<WikipediaArticle[]> => {
  try {
    let titles: string[] = [];
    
    // Simplified random article fetching
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'random',
      rnnamespace: '0',
      rnlimit: (count * 2).toString() // Get extra to filter
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error('Failed to fetch random articles');
    
    const data = await response.json() as WikipediaResponse;
    titles = data.query?.random?.map(article => article.title) || [];

    if (!titles.length) throw new Error('No articles found');

    const contentData = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(contentData.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    console.log(`Got ${validArticles.length} valid articles`);
    return validArticles.slice(0, count);
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

const searchArticles = async (query: string): Promise<WikipediaArticle[]> => {
  if (!query || query.length < 3) return [];

  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'search',
      srsearch: query,
      srlimit: '10' // Reduced from 20
    });

    const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!searchResponse.ok) throw new Error('Search request failed');
    
    const searchData = await searchResponse.json() as WikipediaResponse;
    if (!searchData.query?.search?.length) return [];

    const titles = searchData.query.search.map(result => result.title);
    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    return articles.filter(article => article !== null) as WikipediaArticle[];
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

export { 
  getRandomArticles,
  searchArticles,
  getRelatedArticles,
  type WikipediaArticle 
};
