
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, Eye } from "lucide-react";
import { isNewsArticle } from "../../services/contentService";
import { getArticleImage } from "../../utils/articleHelpers";

interface RelatedContentProps {
  article: any;
  onBack: () => void;
  isVisible: boolean;
}

const RelatedContent = ({ article, onBack, isVisible }: RelatedContentProps) => {
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [sectionImages, setSectionImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && article && !isNewsArticle(article)) {
      fetchSectionContent();
    }
  }, [isVisible, article]);

  const fetchSectionContent = async () => {
    if (loading || !article || isNewsArticle(article)) return;
    
    setLoading(true);
    try {
      // Fetch full article content with sections
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        prop: 'extracts|images',
        pageids: article.id.toString(),
        exsectionformat: 'wiki',
        explaintext: '1',
        exlimit: '1',
        imlimit: '10'
      });

      const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      const data = await response.json();
      
      if (data.query?.pages) {
        const page = Object.values(data.query.pages)[0] as any;
        const fullText = page.extract || '';
        
        // Try to extract the first major section (usually Biography, History, etc.)
        const sections = fullText.split('\n\n');
        let selectedSection = null;
        
        // Look for sections that start with common biography/history keywords
        for (const section of sections) {
          const trimmed = section.trim();
          if (trimmed.length > 200 && 
              (trimmed.toLowerCase().includes('born') || 
               trimmed.toLowerCase().includes('early life') ||
               trimmed.toLowerCase().includes('biography') ||
               trimmed.toLowerCase().includes('career') ||
               trimmed.toLowerCase().includes('history'))) {
            selectedSection = {
              title: 'Biography',
              content: trimmed.substring(0, 800) + (trimmed.length > 800 ? '...' : '')
            };
            break;
          }
        }
        
        // If no biography section found, use the second paragraph
        if (!selectedSection && sections.length > 1) {
          const secondSection = sections[1]?.trim();
          if (secondSection && secondSection.length > 100) {
            selectedSection = {
              title: 'Overview',
              content: secondSection.substring(0, 800) + (secondSection.length > 800 ? '...' : '')
            };
          }
        }

        setSectionContent(selectedSection);

        // Fetch images from the article
        if (page.images) {
          fetchWikipediaImages(page.images.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching section content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWikipediaImages = async (imageReferences: any[]) => {
    try {
      const imageNames = imageReferences
        .map(img => img.title)
        .filter(title => 
          title.toLowerCase().includes('.jpg') || 
          title.toLowerCase().includes('.jpeg') || 
          title.toLowerCase().includes('.png') ||
          title.toLowerCase().includes('.svg')
        )
        .slice(0, 3);

      if (imageNames.length === 0) return;

      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        titles: imageNames.join('|'),
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '800'
      });

      const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      const data = await response.json();
      
      if (data.query?.pages) {
        const pages = Object.values(data.query.pages);
        const validImages = pages
          .filter((page: any) => page.imageinfo && page.imageinfo[0]?.url)
          .map((page: any) => page.imageinfo[0].url)
          .filter(url => url && !url.includes('Commons-logo'));
        
        setSectionImages(validImages);
      }
    } catch (error) {
      console.error('Error fetching Wikipedia images:', error);
    }
  };

  if (isNewsArticle(article)) {
    return (
      <motion.div 
        className="h-full w-full relative flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0">
          <img 
            src={getArticleImage(article)} 
            alt={article.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        </div>

        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative z-10 text-white p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">News Article</h2>
          <p className="text-white/80 mb-6">
            This is a news article. Detailed sections are available for Wikipedia articles only.
          </p>
          <button
            onClick={() => window.open(article.url, '_blank')}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Read Full Article
          </button>
        </div>
      </motion.div>
    );
  }

  const displayImage = sectionImages.length > 0 ? sectionImages[0] : getArticleImage(article);

  return (
    <motion.div 
      className="h-full w-full relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0">
        <img 
          src={displayImage} 
          alt={article.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90" />
      </div>

      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 text-white p-6 max-w-2xl mx-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-6 bg-white/20 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
            </div>
          ) : sectionContent ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{sectionContent.title}</h2>
                <h3 className="text-xl text-blue-300 mb-4">{article.title}</h3>
              </div>

              <div className="text-white/90 leading-relaxed">
                <p>{sectionContent.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>{article.views?.toLocaleString() || 'Unknown'} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{article.readTime || 5} min read</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`, '_blank')}
                  className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Wikipedia Article
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No additional content</h2>
              <p className="text-white/80 mb-6">
                Unable to load additional sections for this article.
              </p>
              <button
                onClick={() => window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`, '_blank')}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Read Full Wikipedia Article
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RelatedContent;
