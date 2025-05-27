
import { Search, User, LogOut, Bell, Heart } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { searchArticles, getRandomArticles } from "../services/wikipediaService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import NotificationsPopover from "./NotificationsPopover";
import LikedArticlesPopover from "./LikedArticlesPopover";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && location.pathname !== "/discover") {
      const decodedQuery = decodeURIComponent(query);
      setSearchValue(decodedQuery);
    }
  }, [searchParams, location.pathname]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchValue],
    queryFn: () => searchArticles(searchValue),
    enabled: searchValue.length > 0,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const handleArticleSelect = (title: string, selectedArticle: any) => {
    setOpen(false);
    setSearchValue(title);
    toast({
      title: "Opening article",
      description: `Loading ${title}...`,
    });
    
    const reorderedResults = [
      selectedArticle,
      ...(searchResults || []).filter(article => article.id !== selectedArticle.id)
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

  const handleRandomArticle = async () => {
    setSearchValue("");
    toast({
      title: "Finding something interesting...",
    });
    const randomArticles = await getRandomArticles(3);
    if (randomArticles.length > 0) {
      navigate(`/?q=${encodeURIComponent(randomArticles[0].title)}`, {
        state: { reorderedResults: randomArticles }
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

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-3 sm:px-6">
        <div 
          className="text-lg sm:text-2xl font-bold text-blue-600 cursor-pointer flex-shrink-0"
          onClick={handleRandomArticle}
        >
          Lore
        </div>
        
        <div 
          className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-8 flex items-center bg-gray-800/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 cursor-pointer hover:bg-gray-700/80 transition-all duration-200 border border-gray-700"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="text-gray-400 text-xs sm:text-sm font-medium truncate">
            {searchValue || "Search..."}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <NotificationsPopover />
          <LikedArticlesPopover />
          
          {user ? (
            <div className="flex items-center space-x-1 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-400 transition-colors p-1.5 sm:p-2 hover:bg-gray-800 rounded-full"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-1 sm:space-x-2 bg-gray-800 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-gray-700 transition-all duration-200 font-medium border border-gray-600"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={handleOpenChange}
      >
        <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden max-h-[80vh] sm:max-h-[70vh]">
          <div className="p-3 sm:p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                placeholder="Search articles..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent text-sm sm:text-base outline-none placeholder-gray-500 text-white"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {!searchValue && (
              <div className="p-4 sm:p-6 text-center">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Discover Knowledge</h3>
                <p className="text-gray-400 text-sm">Search for any topic to explore articles</p>
              </div>
            )}

            {isLoading && searchValue && (
              <div className="p-4 sm:p-6 text-center">
                <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-400 text-sm">Searching...</p>
              </div>
            )}

            {!isLoading && searchValue && searchResults && searchResults.length === 0 && (
              <div className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400 text-sm">Try searching for something else</p>
              </div>
            )}

            {!isLoading && searchResults && searchResults.length > 0 && (
              <div className="p-1 sm:p-2">
                {searchResults.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleArticleSelect(result.title, result)}
                    className="flex items-center p-3 sm:p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition-all duration-200 group"
                  >
                    <div className="flex items-center w-full space-x-3 sm:space-x-4">
                      {result.image ? (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                          <img 
                            src={result.image} 
                            alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-300 font-semibold text-sm sm:text-lg">
                            {result.title[0]}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                          {result.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {result.content}
                        </p>
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
