import { Hash } from "lucide-react";

const LeftSidebar = ({ article }) => {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-50">
      <div className="space-y-2">
        {article.tags.map((tag) => (
          <div 
            key={tag} 
            className="flex items-center space-x-2 text-sm bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
          >
            <Hash className="w-4 h-4" />
            <span>{tag}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-6">
        {article.relatedArticles.map((related) => (
          <div key={related.id} className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-wikitok-red transition-all cursor-pointer">
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