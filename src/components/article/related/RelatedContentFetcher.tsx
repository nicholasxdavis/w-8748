
import { useState, useEffect } from "react";

interface RelatedContentFetcherProps {
  article: any;
  isVisible: boolean;
  onContentLoaded: (content: any, images: string[]) => void;
  onLoading: (loading: boolean) => void;
}

export const RelatedContentFetcher = ({ 
  article, 
  isVisible, 
  onContentLoaded, 
  onLoading 
}: RelatedContentFetcherProps) => {
  useEffect(() => {
    if (isVisible && article && !article.isBreakingNews) {
      fetchSectionContent();
    }
  }, [isVisible, article]);

  const fetchSectionContent = async () => {
    onLoading(true);
    try {
      // Get the page content with sections
      const params = new URLSearchParams({
        action: 'parse',
        format: 'json',
        origin: '*',
        page: article.title,
        prop: 'wikitext|images',
        section: '0'
      });

      const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      const data = await response.json();
      
      if (data.parse) {
        const wikitext = data.parse.wikitext['*'];
        
        // Extract the first major section after the intro
        const sections = wikitext.split(/==\s*([^=]+)\s*==/);
        let selectedSection = null;
        
        // Look for Biography, Early life, Career, or History sections
        for (let i = 1; i < sections.length; i += 2) {
          const sectionTitle = sections[i].trim();
          const sectionContent = sections[i + 1]?.trim();
          
          if (sectionContent && sectionContent.length > 100) {
            const keywords = ['biography', 'early life', 'career', 'history', 'background', 'personal life'];
            const titleLower = sectionTitle.toLowerCase();
            
            if (keywords.some(keyword => titleLower.includes(keyword))) {
              // Clean up the wikitext to plain text
              const cleanText = sectionContent
                .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1')
                .replace(/\{\{[^}]*\}\}/g, '')
                .replace(/'''([^']+)'''/g, '$1')
                .replace(/''([^']+)''/g, '$1')
                .replace(/\n+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              
              selectedSection = {
                title: sectionTitle,
                content: cleanText.substring(0, 600) + (cleanText.length > 600 ? '...' : '')
              };
              break;
            }
          }
        }
        
        // Fetch images for this article
        const images = await fetchArticleImages(article.title);
        
        onContentLoaded(selectedSection, images);
      }
    } catch (error) {
      console.error('Error fetching section content:', error);
      onContentLoaded(null, []);
    } finally {
      onLoading(false);
    }
  };

  const fetchArticleImages = async (title: string): Promise<string[]> => {
    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        titles: title,
        prop: 'images',
        imlimit: '10'
      });

      const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      const data = await response.json();
      
      if (data.query?.pages) {
        const page = Object.values(data.query.pages)[0] as any;
        if (page.images) {
          const imageNames = page.images
            .map((img: any) => img.title)
            .filter((title: string) => 
              title.toLowerCase().includes('.jpg') || 
              title.toLowerCase().includes('.jpeg') || 
              title.toLowerCase().includes('.png')
            )
            .slice(0, 3);

          if (imageNames.length > 0) {
            const imageParams = new URLSearchParams({
              action: 'query',
              format: 'json',
              origin: '*',
              titles: imageNames.join('|'),
              prop: 'imageinfo',
              iiprop: 'url',
              iiurlwidth: '800'
            });

            const imageResponse = await fetch(`https://en.wikipedia.org/w/api.php?${imageParams}`);
            const imageData = await imageResponse.json();
            
            if (imageData.query?.pages) {
              const pages = Object.values(imageData.query.pages);
              return pages
                .filter((page: any) => page.imageinfo && page.imageinfo[0]?.url)
                .map((page: any) => page.imageinfo[0].url)
                .filter(url => url && !url.includes('Commons-logo'));
            }
          }
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  };

  return null;
};
