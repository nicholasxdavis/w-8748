import { Bookmark, Share2, Edit, BookOpen } from "lucide-react";

const RightSidebar = ({ article }) => {
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

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('wikitok-bookmarks') || '[]');
    const isBookmarked = bookmarks.some(bookmark => bookmark.title === article.title);
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(bookmark => bookmark.title !== article.title);
      localStorage.setItem('wikitok-bookmarks', JSON.stringify(newBookmarks));
    } else {
      bookmarks.push({
        title: article.title,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('wikitok-bookmarks', JSON.stringify(bookmarks));
    }
  };

  return (
    <div className="fixed right-4 bottom-20 flex flex-col items-center space-y-4 z-50">
      <div className="flex flex-col items-center">
        <button className="sidebar-icon" onClick={handleBookmark}>
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
        <button className="sidebar-icon" onClick={handleWikipediaRedirect}>
          <BookOpen className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">View</span> {/* Updated text here */}
      </div>
    </div>
  );
};

export default RightSidebar;