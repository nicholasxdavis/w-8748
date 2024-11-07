import { UserPlus, Bookmark, Share2, Edit, BookOpen } from "lucide-react";

const RightSidebar = ({ article }) => {
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
        <button className="sidebar-icon">
          <Share2 className="w-7 h-7" />
        </button>
        <span className="text-xs mt-1">Share</span>
      </div>
      
      <div className="flex flex-col items-center">
        <button className="sidebar-icon">
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
    </div>
  );
};

export default RightSidebar;