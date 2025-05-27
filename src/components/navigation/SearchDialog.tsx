
import { useState } from "react";
import { CommandDialog } from "@/components/ui/command";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { isNewsArticle } from "../../services/contentService";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchResults: any[];
  isLoading: boolean;
}

const SearchDialog = ({ 
  open, 
  onOpenChange, 
  searchValue, 
  setSearchValue, 
  searchResults, 
  isLoading 
}: SearchDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleItemSelect = (title: string, selectedItem: any) => {
    onOpenChange(false);
    setSearchValue(title);
    toast({
      title: isNewsArticle(selectedItem) ? "Opening breaking news" : "Opening article",
      description: `Loading ${title}...`,
    });
    
    const reorderedResults = [
      selectedItem,
      ...(searchResults || []).filter(item => item.id !== selectedItem.id)
    ];
    
    navigate(`/?q=${encodeURIComponent(title)}`, {
      state: { reorderedResults }
    });
  };

  const formatItemDate = (item: any) => {
    if (isNewsArticle(item)) {
      const date = new Date(item.publishedAt);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      return date.toLocaleDateString();
    }
    return `${item.readTime} min read`;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="bg-gray-900/98 backdrop-blur-3xl rounded-2xl sm:rounded-3xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] w-[95vw] max-w-2xl mx-auto mt-2 sm:mt-0 border-0 shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-gray-700/30 bg-blue-500/10">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <input
                placeholder="Discover Knowledge & News..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-transparent text-lg sm:text-xl font-medium outline-none placeholder-gray-400 text-white border-0 ring-0 focus:ring-0 focus:outline-none"
                autoFocus
              />
              <p className="text-gray-400 text-xs sm:text-sm mt-1 text-blue-400">
                Search for fascinating articles and breaking news
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto scrollbar-hide">
          {!searchValue && (
            <div className="p-6 sm:p-10 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-gray-700/30">
                <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 text-blue-400">
                Discover Knowledge & News
              </h3>
              <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Search for fascinating articles and breaking news from around the world
              </p>
            </div>
          )}

          {isLoading && searchValue && (
            <div className="p-6 sm:p-10 text-center">
              <div className="animate-spin w-8 h-8 sm:w-12 sm:h-12 border-3 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4 sm:mb-6"></div>
              <p className="text-gray-400 text-sm sm:text-base font-medium">Searching the universe of knowledge...</p>
            </div>
          )}

          {!isLoading && searchValue && searchResults && searchResults.length === 0 && (
            <div className="p-6 sm:p-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800/80 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">No discoveries found</h3>
              <p className="text-gray-400 text-sm sm:text-base">Try exploring with different keywords</p>
            </div>
          )}

          {!isLoading && searchResults && searchResults.length > 0 && (
            <div className="p-2 sm:p-4">
              {searchResults.map((result, index) => (
                <div
                  key={`${isNewsArticle(result) ? 'news' : 'wiki'}-${result.id}`}
                  onClick={() => handleItemSelect(result.title, result)}
                  className="flex items-center p-3 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-gray-800/60 transition-all duration-300 group mb-1 sm:mb-2 border border-transparent hover:border-gray-700/50"
                >
                  <div className="flex items-center w-full space-x-3 sm:space-x-5">
                    {result.image ? (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 bg-gray-800 relative">
                        <img 
                          src={result.image} 
                          alt={result.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {isNewsArticle(result) && (
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-300 font-bold text-lg sm:text-xl">
                          {result.title[0]}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <h4 className="font-bold text-white text-sm sm:text-lg group-hover:text-blue-400 transition-colors line-clamp-1">
                          {result.title}
                        </h4>
                        {isNewsArticle(result) && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold">
                            BREAKING
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed mb-1 sm:mb-2">
                        {result.content}
                      </p>
                      <span className="text-xs text-gray-500 font-medium bg-gray-800/50 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                        {formatItemDate(result)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CommandDialog>
  );
};

export default SearchDialog;
