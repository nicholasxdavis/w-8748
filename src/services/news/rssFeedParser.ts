
import { NewsArticle } from '../rssNewsService';
import { processRSSItem } from './articleProcessor';

export const parseRSSFeed = async (feedUrl: string, sourceName: string): Promise<NewsArticle[]> => {
  try {
    console.log(`Attempting to fetch from ${sourceName}: ${feedUrl}`);
    
    const proxies = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
      `https://cors-anywhere.herokuapp.com/${feedUrl}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`
    ];
    
    let data = null;
    let lastError = null;
    
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, application/xml, text/xml',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (proxyUrl.includes('rss2json')) {
          data = await response.json();
          if (data.status === 'ok' && data.items) break;
        } else if (proxyUrl.includes('allorigins')) {
          const result = await response.json();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(result.contents, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');
          
          data = {
            status: 'ok',
            items: Array.from(items).map(item => ({
              title: item.querySelector('title')?.textContent || '',
              link: item.querySelector('link')?.textContent || '',
              description: item.querySelector('description')?.textContent || '',
              pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
              enclosure: item.querySelector('enclosure') ? {
                link: item.querySelector('enclosure')?.getAttribute('url') || ''
              } : null
            }))
          };
          if (data.items.length > 0) break;
        }
        
        data = null;
      } catch (error) {
        console.warn(`Failed to fetch from ${proxyUrl}:`, error);
        lastError = error;
        continue;
      }
    }
    
    if (!data || !data.items || !Array.isArray(data.items)) {
      throw lastError || new Error('No valid data from any proxy');
    }
    
    console.log(`Successfully fetched ${data.items.length} items from ${sourceName}`);
    
    return data.items.slice(0, 10).map((item: any, index: number) => 
      processRSSItem(item, index, sourceName)
    );
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
};
