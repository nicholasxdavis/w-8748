import { WikipediaResponse, WikipediaPage } from './types';
import { getRandomPlaceholder } from './placeholders';

const fetchArticleImages = async (title: string): Promise<string | undefined> => {
  try {
    // First try to get images directly associated with the article
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      titles: title,
      prop: 'images|imageinfo',
      iiprop: 'url',
      iiurlwidth: '1000',
      imlimit: '10'
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) return undefined;
    
    const data = await response.json() as WikipediaResponse;
    const page = Object.values(data.query?.pages || {})[0];
    
    if (!page?.images?.length) return undefined;

    // Filter out icons, logos, and other non-relevant images
    const relevantImages = page.images.filter(img => {
      const title = img.title.toLowerCase();
      return !title.includes('icon') && 
             !title.includes('logo') && 
             !title.includes('symbol') &&
             !title.includes('.svg');
    });

    if (!relevantImages.length) return undefined;

    // Get the URL for the first relevant image
    const imageParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      titles: relevantImages[0].title,
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: '1000'
    });

    const imageResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imageParams}`);
    if (!imageResponse.ok) return undefined;
    
    const imageData = await imageResponse.json() as WikipediaResponse;
    const imagePages = Object.values(imageData.query?.pages || {});
    return imagePages[0]?.imageinfo?.[0]?.url;
  } catch (error) {
    console.warn('Error fetching article images:', error);
    return undefined;
  }
};

export const getArticleImage = async (page: WikipediaPage): Promise<string> => {
  // Try thumbnail first
  if (page.thumbnail?.source) {
    return page.thumbnail.source;
  }

  // Try to find other images in the article
  const articleImage = await fetchArticleImages(page.title);
  if (articleImage) {
    return articleImage;
  }

  // Fallback to placeholder
  return getRandomPlaceholder();
};