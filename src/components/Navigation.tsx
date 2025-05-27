
import { Search, User, LogOut, Heart, MessageCircle } from "lucide-react";
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
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 bg-white border-b border-gray-200">
        <div 
          className="text-2xl font-bold text-gray-900 cursor-pointer"
          onClick={handleRandomArticle}
        >
          Lore
        </div>
        
        <div 
          className="flex-1 max-w-md mx-8 flex items-center bg-gray-100 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-gray-500 mr-3" />
          <span className="text-gray-500 text-sm">
            {searchValue || "Search articles..."}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Heart className="w-6 h-6 text-gray-700 hover:text-red-500 cursor-pointer transition-colors" />
          <MessageCircle className="w-6 h-6 text-gray-700 hover:text-blue-500 cursor-pointer transition-colors" />
          
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-white text-sm font-semibold">
                  {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={handleOpenChange}
      >
        <Command shouldFilter={false} className="rounded-xl border-0 shadow-2xl">
          <CommandInput 
            placeholder="Search articles..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-none focus:ring-0 text-base"
          />
          <CommandList className="max-h-[70vh] overflow-y-auto">
            {isLoading && (
              <CommandEmpty>Searching...</CommandEmpty>
            )}
            {!isLoading && !searchResults && searchValue.length > 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!isLoading && !searchValue && (
              <CommandEmpty>Start typing to search articles</CommandEmpty>
            )}
            {!isLoading && searchResults && searchResults.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!isLoading && searchResults && searchResults.length > 0 && (
              <CommandGroup heading="Articles">
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleArticleSelect(result.title, result)}
                    className="flex items-center p-4 cursor-pointer hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center w-full gap-4">
                      {result.image && (
                        <img 
                          src={result.image} 
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-base mb-1">{result.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {result.content}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default Navigation;
