import { Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LeftSidebar = ({ article, onTagClick }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/?q=${encodeURIComponent(tag)}`);
    onTagClick(tag);
  };

  return (
    <div className="fixed left-4 bottom-20 flex flex-col space-y-4 z-50">
      <div className="space-y-2">
        {article.tags.map((tag) => (
          <div 
            key={tag} 
            className="flex items-center space-x-2 text-sm bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
            onClick={() => handleTagClick(tag)}
          >
            <Hash className="w-3 h-3" />
            <span className="text-xs">{tag}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {article.relatedArticles.map((related) => (
          <div key={related.id} className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-wikitok-red transition-all cursor-pointer">
            <img
              src={related.image}
              alt={related.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;