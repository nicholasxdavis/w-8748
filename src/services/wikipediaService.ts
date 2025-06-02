import { WikipediaArticle, WikipediaResponse, WikipediaSection } from './types';
import { fetchWikipediaContent } from './wikipediaApi';

const transformToArticle = async (page: any): Promise<WikipediaArticle | null> => {
  if (!page || page.missing || !page.extract || page.extract.length < 100) {
    return null;
  }

  const title = page.title;
  const content = page.extract;
  const image = page.thumbnail?.source || '';
  
  // No sections loaded initially - they'll be loaded lazily
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

// Lazy loading function for sections
export const getFullSections = async (pageId: number, title: string): Promise<WikipediaSection[]> => {
  try {
    console.log(`Fetching sections for: ${title}`);
    
    // Get section list
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
      return [];
    }

    // Get all images for the article
    const articleImages = await getArticleImages(pageId);
    
    const sections: WikipediaSection[] = [];
    
    // Process sections (no artificial limit)
    for (let i = 0; i < parseData.parse.sections.length; i++) {
      const section = parseData.parse.sections[i];
      
      // Skip table of contents and reference sections
      if (section.line.toLowerCase().includes('contents') || 
          section.line.toLowerCase().includes('references') ||
          section.line.toLowerCase().includes('external links') ||
          section.line.toLowerCase().includes('see also') ||
          section.line.toLowerCase().includes('notes')) {
        continue;
      }

      try {
        const sectionContent = await getSectionContent(title, section.index);
        
        if (sectionContent && sectionContent.length > 100) {
          sections.push({
            title: section.line,
            content: sectionContent,
            image: articleImages[i % articleImages.length] || articleImages[0] || ''
          });
        }
      } catch (error) {
        console.warn(`Error fetching section ${section.line}:`, error);
        continue;
      }
    }
    
    console.log(`Successfully loaded ${sections.length} sections`);
    return sections;
    
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

const getArticleImages = async (pageId: number): Promise<string[]> => {
  try {
    // Get all images for this article
    const imagesParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      pageids: pageId.toString(),
      prop: 'images',
      imlimit: '50'
    });

    const imagesResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imagesParams}`);
    if (!imagesResponse.ok) return [];
    
    const imagesData = await imagesResponse.json();
    const page = Object.values(imagesData.query?.pages || {})[0] as any;
    
    if (!page?.images?.length) return [];

    // Filter for actual images
    const imageFiles = page.images
      .filter((img: any) => {
        const title = img.title.toLowerCase();
        return !title.includes('commons-logo') && 
               !title.includes('edit-icon') && 
               !title.includes('wikimedia') &&
               (title.includes('.jpg') || title.includes('.jpeg') || 
                title.includes('.png') || title.includes('.webp') ||
                title.includes('.gif'));
      })
      .slice(0, 20)
      .map((img: any) => img.title);

    if (!imageFiles.length) return [];

    // Get URLs in batches
    const batchSize = 10;
    const allUrls: string[] = [];

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
          
          allUrls.push(...batchUrls);
        }
      } catch (error) {
        console.warn('Error fetching image batch:', error);
      }
    }

    return allUrls;
  } catch (error) {
    console.warn('Error fetching article images:', error);
    return [];
  }
};

const extractTextFromHtml = (html: string): string => {
  let text = html;
  
  // Remove script and style elements
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove MediaWiki parser output and CSS
  text = text.replace(/\.mw-parser-output[^}]*}/g, '');
  text = text.replace(/@media[^}]*{[^}]*}/g, '');
  text = text.replace(/\.(reflist|citation|navbox)[^}]*{[^}]*}/g, '');
  
  // Remove edit links and brackets
  text = text.replace(/\[edit\]/g, '');
  text = text.replace(/\[citation needed\]/g, '');
  text = text.replace(/\[clarification needed\]/g, '');
  
  // Remove reference markers like [1], [2], etc.
  text = text.replace(/\[\d+\]/g, '');
  text = text.replace(/\[[\w\s]+\]/g, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Remove HTML entities
  text = text.replace(/&[^;]+;/g, ' ');
  
  // Remove CSS-like content
  text = text.replace(/\{[^}]*\}/g, '');
  text = text.replace(/:[^;]*;/g, '');
  
  // Remove MediaWiki specific markup
  text = text.replace(/\{\{[^}]*\}\}/g, '');
  text = text.replace(/\[\[[^\]]*\]\]/g, '');
  
  // Remove extra whitespace and normalize
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n+/g, ' ');
  
  // Remove common Wikipedia artifacts
  text = text.replace(/Notes\s*$/i, '');
  text = text.replace(/References\s*$/i, '');
  text = text.replace(/External links\s*$/i, '');
  text = text.replace(/See also\s*$/i, '');
  
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
      }

      if (titles.length < count) {
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
      throw new Error('No articles found');
    }

    titles = titles.sort(() => Math.random() - 0.5);

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    if (validArticles.length < count && category) {
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
