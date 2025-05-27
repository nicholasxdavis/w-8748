
import { Search } from "lucide-react";

interface SearchTriggerProps {
  searchValue: string;
  onClick: () => void;
  isMobile?: boolean;
}

const SearchTrigger = ({ searchValue, onClick, isMobile = false }: SearchTriggerProps) => {
  if (isMobile) {
    return (
      <div className="flex-1 mx-2 max-w-[200px]">
        <div 
          className="w-full flex items-center bg-gray-800/60 backdrop-blur-xl rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-700/60 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
          onClick={onClick}
        >
          <Search className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
          <span className="text-gray-400 text-xs font-medium truncate">
            {searchValue || "Search..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2">
      <div 
        className="w-64 sm:w-80 flex items-center bg-gray-800/60 backdrop-blur-xl rounded-2xl px-4 py-2 cursor-pointer hover:bg-gray-700/60 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
        onClick={onClick}
      >
        <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
        <span className="text-gray-400 text-sm font-medium truncate">
          {searchValue || "Search articles & news..."}
        </span>
      </div>
    </div>
  );
};

export default SearchTrigger;
