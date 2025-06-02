import { WikipediaArticle, WikipediaResponse, WikipediaSection } from './types';
import { fetchWikipediaContent } from './wikipediaApi';

const transformToArticle = async (page: any): Promise<WikipediaArticle | null> => {
  if (!page || page.missing || !page.extract || page.extract.length < 100) {
    return null;
  }

  const title = page.title;
  const content = page.extract;
  const image = page.thumbnail?.source || '';
  
  // Get all sections for this article
  const sections = await getAllSections(page.pageid, title);
  
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

const getAllSections = async (pageId: number, title: string): Promise<WikipediaSection[]> => {
  try {
    console.log(`Fetching all sections for: ${title}`);
    
    // First, get the full parsed content with sections
    const parseParams = new URLSearchParams({
      action: 'parse',
      format: 'json',
      origin: '*',
      page: title,
      prop: 'sections|text',
      disabletoc: '1'
    });

    const parseResponse = await fetch(`https://en.wikipedia.org/w/api.php?${parseParams}`);
    if (!parseResponse.ok) {
      console.warn('Failed to fetch parsed content');
      return [];
    }
    
    const parseData = await parseResponse.json();
    
    if (!parseData.parse?.sections) {
      console.warn('No sections found in parsed data');
      return [];
    }

    // Get all available images for this article
    const articleImages = await getArticleImages(pageId);
    console.log(`Found ${articleImages.length} images for article`);
    
    const sections: WikipediaSection[] = [];
    const sectionsToFetch = parseData.parse.sections.slice(0, 6); // Limit to first 6 sections
    
    for (let i = 0; i < sectionsToFetch.length; i++) {
      const section = sectionsToFetch[i];
      
      // Skip TOC and very short sections
      if (section.line.toLowerCase().includes('contents') || 
          section.line.toLowerCase().includes('references') ||
          section.line.toLowerCase().includes('external links') ||
          section.line.toLowerCase().includes('see also')) {
        continue;
      }

      try {
        // Get content for this specific section
        const sectionParams = new URLSearchParams({
          action: 'parse',
          format: 'json',
          origin: '*',
          page: title,
          section: section.index,
          prop: 'text',
          disabletoc: '1'
        });

        const sectionResponse = await fetch(`https://en.wikipedia.org/w/api.php?${sectionParams}`);
        if (!sectionResponse.ok) continue;
        
        const sectionData = await sectionResponse.json();
        const htmlContent = sectionData.parse?.text?.['*'];
        
        if (!htmlContent) continue;
        
        // Extract clean text from HTML
        const textContent = extractTextFromHtml(htmlContent);
        
        // Only include sections with substantial content
        if (textContent.length > 200) {
          sections.push({
            title: section.line,
            content: textContent,
            image: articleImages[i] || articleImages[0] // Use corresponding image or fallback to first
          });
        }
      } catch (error) {
        console.warn(`Error fetching section ${section.line}:`, error);
        continue;
      }
    }
    
    console.log(`Successfully processed ${sections.length} sections`);
    return sections.slice(0, 5); // Limit to 5 sections max for performance
    
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
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
      imlimit: '20'
    });

    const imagesResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imagesParams}`);
    if (!imagesResponse.ok) return [];
    
    const imagesData = await imagesResponse.json();
    const page = Object.values(imagesData.query?.pages || {})[0] as any;
    
    if (!page?.images?.length) return [];

    // Filter for actual images (not icons/logos)
    const imageFiles = page.images
      .filter((img: any) => {
        const title = img.title.toLowerCase();
        return !title.includes('commons-logo') && 
               !title.includes('edit-icon') && 
               !title.includes('wikimedia') &&
               (title.includes('.jpg') || title.includes('.jpeg') || title.includes('.png') || title.includes('.webp'));
      })
      .slice(0, 10) // Limit to first 10 relevant images
      .map((img: any) => img.title);

    if (!imageFiles.length) return [];

    // Get actual URLs for these images
    const imageUrlsParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      titles: imageFiles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: '800'
    });

    const imageUrlsResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imageUrlsParams}`);
    if (!imageUrlsResponse.ok) return [];
    
    const imageUrlsData = await imageUrlsResponse.json();
    const imageUrls = Object.values(imageUrlsData.query?.pages || {})
      .map((page: any) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url)
      .filter(Boolean) as string[];

    return imageUrls;
  } catch (error) {
    console.warn('Error fetching article images:', error);
    return [];
  }
};

const extractTextFromHtml = (html: string): string => {
  // Remove HTML tags and clean up the text
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
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
      
      // Try to get articles from the specific category
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        list: 'categorymembers',
        cmtitle: `Category:${category}`,
        cmlimit: (count * 3).toString(), // Get more to ensure we have enough valid articles
        cmtype: 'page'
      });

      const categoryResponse = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json() as WikipediaResponse;
        titles = categoryData.query?.categorymembers?.map(article => article.title) || [];
        console.log(`Found ${titles.length} articles in category ${category}`);
      }

      // If we don't get enough articles from the category, supplement with search
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
      // Get completely random articles using multiple requests for better variety
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

    // Shuffle titles to ensure randomness
    titles = titles.sort(() => Math.random() - 0.5);

    const data = await fetchWikipediaContent(titles) as WikipediaResponse;
    const pages = Object.values(data.query?.pages || {});
    
    const articles = await Promise.all(pages.map(transformToArticle));
    const validArticles = articles.filter(article => article !== null) as WikipediaArticle[];
    
    console.log(`Transformed ${validArticles.length} valid articles out of ${pages.length} pages`);
    
    // If we don't have enough articles, fetch more with a different approach
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
