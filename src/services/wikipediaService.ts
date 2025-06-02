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

// Lazy loading function for sections - only called when needed
export const getFullSections = async (pageId: number, title: string, abortSignal?: AbortSignal): Promise<WikipediaSection[]> => {
  try {
    console.log(`Lazy loading sections for: ${title}`);
    
    // Check if request was aborted
    if (abortSignal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }
    
    // Get section list
    const parseParams = new URLSearchParams({
      action: 'parse',
      format: 'json',
      origin: '*',
      page: title,
      prop: 'sections',
      disabletoc: '1'
    });

    const parseResponse = await fetch(`https://en.wikipedia.org/w/api.php?${parseParams}`, {
      signal: abortSignal
    });
    
    if (!parseResponse.ok) return [];
    
    const parseData = await parseResponse.json();
    
    if (!parseData.parse?.sections?.length) {
      console.log('No sections found');
      return [];
    }

    // Get article images once
    const articleImages = await getArticleImages(pageId, abortSignal);
    
    const sections: WikipediaSection[] = [];
    
    // Process ALL sections with better filtering
    for (let i = 0; i < parseData.parse.sections.length; i++) {
      // Check if request was aborted
      if (abortSignal?.aborted) {
        throw new DOMException('Request aborted', 'AbortError');
      }
      
      const section = parseData.parse.sections[i];
      
      // Skip non-content sections more thoroughly
      const sectionTitle = section.line.toLowerCase();
      if (sectionTitle.includes('contents') || 
          sectionTitle.includes('references') ||
          sectionTitle.includes('external') ||
          sectionTitle.includes('see also') ||
          sectionTitle.includes('notes') ||
          sectionTitle.includes('bibliography') ||
          sectionTitle.includes('sources') ||
          sectionTitle.includes('further reading')) {
        continue;
      }

      try {
        const sectionContent = await getSectionContent(title, section.index, abortSignal);
        
        if (sectionContent && sectionContent.length > 100) {
          sections.push({
            title: section.line,
            content: sectionContent,
            image: articleImages[sections.length] || articleImages[0] || ''
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          throw error;
        }
        console.warn(`Skipping section ${section.line}:`, error);
        continue;
      }
    }
    
    console.log(`Loaded ${sections.length} sections for ${title}`);
    return sections;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Section loading aborted for: ${title}`);
      throw error;
    }
    console.error('Error loading sections:', error);
    return [];
  }
};

const getSectionContent = async (title: string, sectionIndex: string, abortSignal?: AbortSignal): Promise<string> => {
  const sectionParams = new URLSearchParams({
    action: 'parse',
    format: 'json',
    origin: '*',
    page: title,
    section: sectionIndex,
    prop: 'text',
    disabletoc: '1'
  });

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${sectionParams}`, {
    signal: abortSignal
  });
  
  if (!response.ok) throw new Error('Section fetch failed');
  
  const data = await response.json();
  const htmlContent = data.parse?.text?.['*'];
  
  return htmlContent ? extractTextFromHtml(htmlContent) : '';
};

const getArticleImages = async (pageId: number, abortSignal?: AbortSignal): Promise<string[]> => {
  try {
    const imagesParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      pageids: pageId.toString(),
      prop: 'images',
      imlimit: '20'
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${imagesParams}`, {
      signal: abortSignal
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0] as any;
    
    if (!page?.images?.length) return [];

    // Filter for actual images
    const imageFiles = page.images
      .filter((img: any) => {
        const title = img.title.toLowerCase();
        return !title.includes('commons-logo') && 
               !title.includes('edit-icon') && 
               !title.includes('wikimedia') &&
               (title.includes('.jpg') || title.includes('.jpeg') || 
                title.includes('.png') || title.includes('.gif') || 
                title.includes('.webp'));
      })
      .slice(0, 10)
      .map((img: any) => img.title);

    if (!imageFiles.length) return [];

    // Get image URLs
    const imageUrlsParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      titles: imageFiles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: '800'
    });

    const imageUrlsResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imageUrlsParams}`, {
      signal: abortSignal
    });
    
    if (!imageUrlsResponse.ok) return [];
    
    const imageUrlsData = await imageUrlsResponse.json();
    const imageUrls = Object.values(imageUrlsData.query?.pages || {})
      .map((page: any) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url)
      .filter(Boolean) as string[];

    return imageUrls;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.warn('Error fetching images:', error);
    return [];
  }
};

// Improved text extraction to remove title repetition and edit links
const extractTextFromHtml = (html: string): string => {
  let text = html;
  
  // Remove scripts, styles, and common Wikipedia elements
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/\.mw-parser-output[^}]*}/g, '');
  text = text.replace(/@media[^}]*{[^}]*}/g, '');
  text = text.replace(/\.(reflist|citation|navbox|infobox|ambox|dmbox|ombox|tmbox)[^}]*{[^}]*}/gi, '');
  
  // Remove edit links and section headers that repeat the title
  text = text.replace(/\[edit\]/gi, '');
  text = text.replace(/\[citation needed\]/gi, '');
  text = text.replace(/\[\d+\]/g, '');
  text = text.replace(/\^[a-z\d]+/gi, '');
  
  // Remove repeated section titles at the beginning
  text = text.replace(/^[^.!?]*\[\s*edit\s*\]/gi, '');
  text = text.replace(/^[^.!?]*edit\s*\]/gi, '');
  
  // Remove Wikipedia-specific CSS and styling
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
  
  // Remove any leading/trailing section titles or edit artifacts
  text = text.replace(/^[^.!?]*\s*edit\s*/gi, '');
  text = text.replace(/^\s*[^.!?]*\[\s*/gi, '');
  
  return text.trim();
};

const getRelatedArticles = async (article: WikipediaArticle): Promise<WikipediaArticle[]> => {
  try {
    const categoryTitles = article.tags.map(tag => `Category:${tag}`).join('|');
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      list: 'categorymembers',
      cmtitle: categoryTitles,
      cmlimit: '10',
      cmtype: 'page'
    });

    const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!categoryResponse.ok) throw new Error('Failed to fetch category articles');
    
    const categoryData = await categoryResponse.json() as WikipediaResponse;
    const relatedTitles = categoryData.query?.categorymembers
      ?.filter(article => article.title !== article.title)
      ?.map(article => article.title)
      ?.slice(0, 10) || [];

    if (relatedTitles.length === 0) {
      return getRandomArticles(3);
    }

    const data = await fetchWikipediaContent(relatedTitles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    return articles.filter(article => article !== null) as WikipediaArticle[];
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return getRandomArticles(3);
  }
};

const getRandomArticles = async (count: number = 3, category?: string): Promise<WikipediaArticle[]> => {
  try {
    let titles: string[] = [];
    
    if (category && category !== "All") {
      console.log(`Fetching articles for category: ${category}`);
      
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        list: 'categorymembers',
        cmtitle: `Category:${category}`,
        cmlimit: (count * 3).toString(),
        cmtype: 'page'
      });

      const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json() as WikipediaResponse;
        titles = categoryData.query?.categorymembers?.map(article => article.title) || [];
        console.log(`Found ${titles.length} articles in category ${category}`);
      }

      if (titles.length < count) {
        console.log(`Not enough articles in category, searching for: ${category}`);
        const searchParams = new URLSearchParams({
          action: 'query',
          format: 'json',
          origin: '*',
          list: 'search',
          srsearch: category,
          srlimit: (count * 2).toString()
        });

        const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams}`);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json() as WikipediaResponse;
          const searchTitles = searchData.query?.search?.map(result => result.title) || [];
          titles = [...titles, ...searchTitles].slice(0, count * 2);
          console.log(`After search supplement: ${titles.length} articles`);
        }
      }
    } else {
      const randomRequests = [];
      const articlesPerRequest = Math.ceil(count / 2);
      
      for (let i = 0; i < 2; i++) {
        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          origin: '*',
          list: 'random',
          rnnamespace: '0',
          rnlimit: (articlesPerRequest + 2).toString()
        });

        randomRequests.push(
          fetch(`https://en.wikipedia.org/w/api.php?${params}`)
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch random articles');
              return response.json();
            })
            .then((data: WikipediaResponse) => 
              data.query?.random?.map(article => article.title) || []
            )
        );
      }

      const titleBatches = await Promise.all(randomRequests);
      titles = titleBatches.flat();
      titles = titles.sort(() => Math.random() - 0.5);
    }

    if (!titles.length) {
      console.log('No titles found, falling back to random articles');
      throw new Error('No articles found');
    }

    titles = titles.sort(() => Math.random() - 0.5);

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    console.log(`Transformed ${validArticles.length} valid articles out of ${pages.length} pages`);
    
    if (validArticles.length < count && category) {
      console.log('Not enough valid articles, trying fallback...');
      const fallbackArticles = await getRandomArticles(count - validArticles.length);
      return [...validArticles, ...fallbackArticles].slice(0, count);
    }
    
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
      srlimit: '20'
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
