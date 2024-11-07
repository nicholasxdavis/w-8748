import { UserPlus, Bookmark, Share2, Edit, BookOpen, ExternalLink } from "lucide-react";

const RightSidebar = ({ article }) => {
  const handleWikipediaRedirect = () => {
    const baseUrl = "https://en.wikipedia.org/wiki/";
    const articleTitle = encodeURIComponent(article.title);
    window.open(`${baseUrl}${articleTitle}`, '_blank');
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this article about ${article.title} on WikiTok!`,
        url: currentUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(currentUrl).then(() => {
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
      <div className="flex flex-col items-center">
        <button className="sidebar-icon">
          <UserPlus className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">{article.views}</span>
      </div>
      
      <div className="flex flex-col items-center">
        <button className="sidebar-icon">
          <Bookmark className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">Save</span>
      </div>
      
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
        <button className="sidebar-icon">
          <BookOpen className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">{article.citations}</span>
      </div>

      <div className="flex flex-col items-center">
        <button className="sidebar-icon" onClick={handleWikipediaRedirect}>
          <ExternalLink className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">Wiki</span>
      </div>
    </div>
  );
};

export default RightSidebar;