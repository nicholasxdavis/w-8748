
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { isNewsArticle } from "../../services/contentService";

interface SearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  results: any[];
  isSearching: boolean;
}

const SearchInterface = ({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  results, 
  isSearching 
}: SearchInterfaceProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleResultClick = (title: string, selectedItem: any) => {
    onClose();
    setSearchQuery(title);
    toast({
      title: isNewsArticle(selectedItem) ? "Opening breaking news" : "Opening article",
      description: `Loading ${title}...`,
    });
    
    const reorderedResults = [
      selectedItem,
      ...(results || []).filter(item => item.id !== selectedItem.id)
    ];
    
    navigate(`/?q=${encodeURIComponent(title)}`, {
      state: { reorderedResults }
    });
  };

  const formatDate = (item: any) => {
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-4 sm:pt-16">
      <div className="bg-gray-900 w-[95vw] sm:w-[90vw] max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <input
                placeholder="Search articles & news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-lg font-medium outline-none placeholder-gray-400 text-white"
                autoFocus
              />
              <p className="text-gray-400 text-xs mt-1">Find fascinating content</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!searchQuery && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Discover Knowledge</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Search for articles and breaking news
              </p>
            </div>
          )}

          {isSearching && searchQuery && (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Searching...</p>
            </div>
          )}

          {!isSearching && searchQuery && results && results.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No results found</h3>
              <p className="text-gray-400 text-sm">Try different keywords</p>
            </div>
          )}

          {!isSearching && results && results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => (
                <div
                  key={`${isNewsArticle(result) ? 'news' : 'wiki'}-${result.id}`}
                  onClick={() => handleResultClick(result.title, result)}
                  className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-800/60 transition-all duration-300 group mb-1"
                >
                  <div className="flex items-center w-full space-x-3">
                    {result.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 relative">
                        <img 
                          src={result.image} 
                          alt={result.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {isNewsArticle(result) && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-300 font-bold text-lg">
                          {result.title[0]}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                          {result.title}
                        </h4>
                        {isNewsArticle(result) && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            NEWS
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                        {result.content}
                      </p>
                      <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                        {formatDate(result)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
