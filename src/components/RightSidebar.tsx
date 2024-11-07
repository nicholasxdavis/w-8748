import { UserPlus, Bookmark, Share2, Edit, BookOpen } from "lucide-react";

const RightSidebar = ({ article }) => {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-6">
      <button className="sidebar-icon">
        <UserPlus />
      </button>
      <button className="sidebar-icon">
        <Bookmark />
      </button>
      <button className="sidebar-icon">
        <Share2 />
      </button>
      <button className="sidebar-icon">
        <Edit />
      </button>
      <div className="text-center">
        <button className="sidebar-icon">
          <BookOpen />
        </button>
        <span className="text-sm">{article.citations}</span>
      </div>
    </div>
  );
};

export default RightSidebar;