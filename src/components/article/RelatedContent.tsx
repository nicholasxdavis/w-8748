
import { useState } from "react";
import { isNewsArticle } from "../../services/contentService";
import { getArticleImage } from "../../utils/articleHelpers";
import { RelatedContentFetcher } from "./related/RelatedContentFetcher";
import { RelatedContentDisplay } from "./related/RelatedContentDisplay";
import { NewsArticleDisplay } from "./related/NewsArticleDisplay";

interface RelatedContentProps {
  article: any;
  onBack: () => void;
  isVisible: boolean;
}

const RelatedContent = ({ article, onBack, isVisible }: RelatedContentProps) => {
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [sectionImages, setSectionImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleContentLoaded = (content: any, images: string[]) => {
    setSectionContent(content);
    setSectionImages(images);
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  if (isNewsArticle(article)) {
    return (
      <NewsArticleDisplay 
        article={article}
        onBack={onBack}
        isVisible={isVisible}
      />
    );
  }

  const displayImage = sectionImages.length > 0 ? sectionImages[0] : getArticleImage(article);

  return (
    <>
      <RelatedContentFetcher
        article={article}
        isVisible={isVisible}
        onContentLoaded={handleContentLoaded}
        onLoading={handleLoading}
      />
      
      <RelatedContentDisplay
        article={article}
        sectionContent={sectionContent}
        sectionImages={sectionImages}
        loading={loading}
        onBack={onBack}
        isVisible={isVisible}
        displayImage={displayImage}
      />
    </>
  );
};

export default RelatedContent;
