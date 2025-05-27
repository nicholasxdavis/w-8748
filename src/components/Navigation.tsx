
import { Search, User, LogOut } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
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
      title: "Loading articles",
      description: `Loading articles about ${title}...`,
      duration: 2000,
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
      title: "Loading random article",
      description: "Finding something interesting for you...",
      duration: 2000,
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
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm">
        <div 
          className="text-2xl font-bold text-white cursor-pointer tracking-tight"
          onClick={handleRandomArticle}
        >
          Lore
        </div>
        
        <div 
          className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-2 cursor-pointer border border-white/20"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-white/80 mr-2" />
          <span className="text-white/80 text-sm">
            {searchValue || "Search articles"}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-white/80 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">Sign In</span>
            </button>
          )}
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={handleOpenChange}
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search articles..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-[80vh] overflow-y-auto">
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
                    className="flex items-center p-3 cursor-pointer hover:bg-accent rounded-lg"
                  >
                    <div className="flex items-center w-full gap-3">
                      {result.image && (
                        <img 
                          src={result.image} 
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base">{result.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
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
