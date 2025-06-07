
import { Share2, Edit, BookOpen } from "lucide-react";
import SaveButton from "./SaveButton";
import NeverShowAgainButton from "./article/NeverShowAgainButton";

const RightSidebar = ({ article, onNeverShow }) => {
  const handleWikipediaRedirect = () => {
    const baseUrl = "https://en.wikipedia.org/wiki/";
    const articleTitle = encodeURIComponent(article.title);
    window.open(`${baseUrl}${articleTitle}`, '_blank');
  };

  const handleShare = () => {
    const baseUrl = window.location.origin;
    const searchParams = new URLSearchParams();
    searchParams.set('q', article.title);
    searchParams.set('id', article.id);
    const shareUrl = `${baseUrl}/?${searchParams.toString()}`;

    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this article about ${article.title} on WikiTok!`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('URL copied to clipboard');
      }).catch(console.error);
    }
  };

  const handleEdit = () => {
    const baseUrl = "https://en.wikipedia.org/wiki/";
    const articleTitle = encodeURIComponent(article.title);
    window.open(`${baseUrl}edit/${articleTitle}`, '_blank');
  };

  return (
    <div className="fixed right-4 bottom-20 flex flex-col items-center space-y-4 z-50">
      <SaveButton 
        article={{
          id: String(article?.id || ''),
          title: article?.title || '',
          content: article?.content,
          image: article?.image
        }}
      />
      
      <NeverShowAgainButton
        article={article}
        onNeverShow={onNeverShow}
      />
      
      <div className="flex flex-col items-center">
        <button className="sidebar-icon" onClick={handleShare}>
          <Share2 className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">Share</span>
      </div>
      
      <div className="flex flex-col items-center">
        <button className="sidebar-icon" onClick={handleEdit}>
          <Edit className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">Edit</span>
      </div>
      
      <div className="flex flex-col items-center">
        <button className="sidebar-icon" onClick={handleWikipediaRedirect}>
          <BookOpen className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">View</span>
      </div>
    </div>
  );
};

export default RightSidebar;
