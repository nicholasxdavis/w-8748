
import { Search, User } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { searchMixedContent, getMixedContent, isNewsArticle } from "../services/contentService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SavedArticlesPopover from "./SavedArticlesPopover";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const isDiscoverPage = location.pathname === "/discover";

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && location.pathname !== "/discover") {
      const decodedQuery = decodeURIComponent(query);
      setSearchValue(decodedQuery);
    }
  }, [searchParams, location.pathname]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchValue],
    queryFn: () => searchMixedContent(searchValue),
    enabled: searchValue.length > 0,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const handleItemSelect = (title: string, selectedItem: any) => {
    setOpen(false);
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const handleRandomContent = async () => {
    setSearchValue("");
    toast({
      title: "Finding something interesting...",
    });
    const randomContent = await getMixedContent(6);
    if (randomContent.length > 0) {
      navigate(`/?q=${encodeURIComponent(randomContent[0].title)}`, {
        state: { reorderedResults: randomContent }
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
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
    <>
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-3 sm:px-6 backdrop-blur-lg">
        <div 
          className="text-lg sm:text-2xl font-bold cursor-pointer flex-shrink-0 text-white hover:scale-105 transition-transform"
          onClick={handleRandomContent}
        >
          Lore
        </div>
        
        {/* Mobile Search Bar - with max width constraint */}
        <div className="sm:hidden flex-1 mx-2 max-w-[200px]">
          <div 
            className="w-full flex items-center bg-gray-800/40 backdrop-blur-xl rounded-xl px-2 py-1 cursor-pointer hover:bg-gray-700/40 transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 shadow-lg"
            onClick={() => setOpen(true)}
          >
            <Search className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
            <span className="text-gray-400 text-xs font-medium truncate">
              {searchValue || "Search..."}
            </span>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2">
          <div 
            className="w-64 sm:w-80 flex items-center bg-gray-800/40 backdrop-blur-xl rounded-2xl px-4 py-2 cursor-pointer hover:bg-gray-700/40 transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 shadow-lg"
            onClick={() => setOpen(true)}
          >
            <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-400 text-sm font-medium truncate">
              {searchValue || "Search articles & news..."}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <SavedArticlesPopover />
          
          {user ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-5 h-5 sm:w-7 sm:h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-700/50 shadow-lg hover:bg-blue-700 transition-colors">
                    <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-48 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl"
                  align="end"
                >
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-800/60 focus:bg-gray-800/60 focus:text-red-300 cursor-pointer px-3 py-2 rounded-lg"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:scale-105"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Search Dialog - Mobile Responsive */}
      <CommandDialog 
        open={open} 
        onOpenChange={handleOpenChange}
      >
        <div className="bg-gradient-to-br from-gray-900/98 via-black/98 to-gray-900/98 backdrop-blur-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] w-[95vw] max-w-2xl mx-auto mt-2 sm:mt-0">
          <div className="p-4 sm:p-6 border-b border-gray-700/30 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
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
                <p className="text-gray-400 text-xs sm:text-sm mt-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Search for fascinating articles and breaking news
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto scrollbar-hide">
            {!searchValue && (
              <div className="p-6 sm:p-10 text-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl backdrop-blur-sm border border-gray-700/30">
                  <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
                    className="flex items-center p-3 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/60 transition-all duration-300 group mb-1 sm:mb-2 border border-transparent hover:border-gray-700/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center w-full space-x-3 sm:space-x-5">
                      {result.image ? (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 bg-gray-800 relative shadow-lg">
                          <img 
                            src={result.image} 
                            alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {isNewsArticle(result) && (
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center flex-shrink-0 shadow-lg">
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
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold shadow-lg animate-pulse">
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
    </>
  );
};

export default Navigation;
