import { WikipediaArticle, WikipediaResponse, WikipediaSection } from './types';
import { fetchWikipediaContent } from './wikipediaApi';

const transformToArticle = async (page: any): Promise<WikipediaArticle | null> => {
  if (!page || page.missing || !page.extract || page.extract.length < 100) {
    return null;
  }

  const title = page.title;
  const content = page.extract;
  const image = page.thumbnail?.source || '';
  
  // No sections on initial load - they'll be loaded lazily
  const sections: WikipediaSection[] = [];
  
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

// New function for lazy loading all sections with full content and images
export const getFullSections = async (pageId: number, title: string): Promise<WikipediaSection[]> => {
  try {
    console.log(`Fetching all sections for: ${title}`);
    
    // Get complete section list
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

    // Get all article images at once
    const articleImages = await getAllImages(pageId);
    
    const sections: WikipediaSection[] = [];
    
    // Process ALL sections (no limit)
    for (let i = 0; i < parseData.parse.sections.length; i++) {
      const section = parseData.parse.sections[i];
      
      // Skip common non-content sections
      if (section.line.toLowerCase().includes('contents') || 
          section.line.toLowerCase().includes('references') ||
          section.line.toLowerCase().includes('external') ||
          section.line.toLowerCase().includes('see also') ||
          section.line.toLowerCase().includes('notes')) {
        continue;
      }

      try {
        const sectionContent = await getSectionContent(title, section.index);
        
        if (sectionContent && sectionContent.length > 50) {
          sections.push({
            title: section.line,
            content: sectionContent,
            image: articleImages[i % articleImages.length] || articleImages[0] || ''
          });
        }
      } catch (error) {
        console.warn(`Skipping section ${section.line} due to error:`, error);
        continue;
      }
    }
    
    console.log(`Processed ${sections.length} sections for ${title}`);
    return sections;
    
  } catch (error) {
    console.error('Error fetching full sections:', error);
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

// Enhanced image fetching to get ALL available images
const getAllImages = async (pageId: number): Promise<string[]> => {
  try {
    const imagesParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      pageids: pageId.toString(),
      prop: 'images',
      imlimit: '50' // Get up to 50 images
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${imagesParams}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0] as any;
    
    if (!page?.images?.length) return [];

    // Get ALL image files (no limit)
    const imageFiles = page.images
      .filter((img: any) => {
        const title = img.title.toLowerCase();
        return (title.includes('.jpg') || title.includes('.jpeg') || 
                title.includes('.png') || title.includes('.gif') || 
                title.includes('.webp'));
      })
      .map((img: any) => img.title);

    if (!imageFiles.length) return [];

    // Process images in batches to avoid URL length limits
    const batchSize = 10;
    const allImageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i += batchSize) {
      const batch = imageFiles.slice(i, i + batchSize);
      
      const imageUrlsParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        titles: batch.join('|'),
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '800'
      });

      try {
        const imageUrlsResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imageUrlsParams}`);
        if (imageUrlsResponse.ok) {
          const imageUrlsData = await imageUrlsResponse.json();
          const batchUrls = Object.values(imageUrlsData.query?.pages || {})
            .map((page: any) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url)
            .filter(Boolean) as string[];
          
          allImageUrls.push(...batchUrls);
        }
      } catch (error) {
        console.warn('Error fetching image batch:', error);
      }
    }

    return allImageUrls;
  } catch (error) {
    console.warn('Error fetching all images:', error);
    return [];
  }
};

// Improved and more thorough text extraction
const extractTextFromHtml = (html: string): string => {
  let text = html;
  
  // Remove scripts, styles, and common Wikipedia elements
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/\.mw-parser-output[^}]*}/g, '');
  text = text.replace(/@media[^}]*{[^}]*}/g, '');
  text = text.replace(/\.(reflist|citation|navbox|infobox|ambox|dmbox|ombox|tmbox)[^}]*{[^}]*}/gi, '');
  
  // Remove edit links, citations, and reference markers
  text = text.replace(/\[edit\]/gi, '');
  text = text.replace(/\[citation needed\]/gi, '');
  text = text.replace(/\[\d+\]/g, '');
  text = text.replace(/\^[a-z\d]+/gi, '');
  
  // Remove Wikipedia-specific CSS classes and styling
  text = text.replace(/class="[^"]*"/gi, '');
  text = text.replace(/style="[^"]*"/gi, '');
  text = text.replace(/id="[^"]*"/gi, '');
  
  // Remove HTML tags and entities
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/&[^;]+;/g, ' ');
  
  // Remove CSS, MediaWiki markup, and template syntax
  text = text.replace(/\{[^}]*\}/g, '');
  text = text.replace(/\[\[[^\]]*\]\]/g, '');
  text = text.replace(/\{\{[^}]*\}\}/g, '');
  text = text.replace(/<!--[^>]*-->/g, '');
  
  // Remove common Wikipedia metadata
  text = text.replace(/Category:[^|]+/gi, '');
  text = text.replace(/File:[^|]+/gi, '');
  text = text.replace(/Template:[^|]+/gi, '');
  
  // Clean whitespace and formatting
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n+/g, ' ');
  text = text.replace(/\t+/g, ' ');
  
  return text.trim();
};

// Simplified related articles
const getRelatedArticles = async (article: WikipediaArticle): Promise<WikipediaArticle[]> => {
  try {
    return getRandomArticles(3);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
};

// Fast random articles function - minimal processing for initial load
const getRandomArticles = async (count: number = 3, category?: string): Promise<WikipediaArticle[]> => {
  try {
    let titles: string[] = [];
    
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'random',
      rnnamespace: '0',
      rnlimit: (count * 2).toString()
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
    
    console.log(`Got ${validArticles.length} valid articles (fast load)`);
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
      srlimit: '15'
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
