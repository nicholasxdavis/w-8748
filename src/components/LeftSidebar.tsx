import { Hash } from "lucide-react";

const LeftSidebar = ({ article }) => {
  return (
    <div className="fixed left-4 bottom-24 flex flex-col space-y-4 z-50">
      <div className="space-y-2">
        {article.tags.map((tag) => (
          <div key={tag} className="flex items-center space-x-2 text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <Hash className="w-4 h-4" />
            <span>{tag}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-6">
        {article.relatedArticles.map((related) => (
          <div key={related.id} className="w-10 h-10 rounded-full overflow-hidden">
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