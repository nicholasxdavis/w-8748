import { Home, Search, Compass } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchArticles } from "../services/wikipediaService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      const decodedQuery = decodeURIComponent(query);
      setSearchValue(decodedQuery);
      setOpen(true);
    }
  }, [searchParams]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchValue],
    queryFn: () => {
      console.log("🔍 Executing search query for:", searchValue);
      return searchArticles(searchValue);
    },
    enabled: searchValue.length > 0,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const handleArticleSelect = (title: string) => {
    console.log("🎯 Article selected:", title);
    setOpen(false);
    setSearchValue(title);
    toast({
      title: "Loading articles",
      description: `Loading articles about ${title}...`,
    });
    navigate(`/?q=${encodeURIComponent(title)}`);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && (!searchResults || searchResults.length === 0)) {
      setSearchValue("");
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-transparent z-50 flex items-center justify-between px-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-xl font-bold text-wikitok-red">WikiTok</div>
        <div 
          className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-white/60 mr-2" />
          <span className="text-white/60 text-sm">
            {searchValue || "Search articles"}
          </span>
        </div>
        <div className="flex space-x-6">
          <Home className="w-5 h-5 text-white" />
          <Compass className="w-5 h-5 text-white" />
        </div>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={handleOpenChange}
        shouldFilter={false} // Add this to prevent internal filtering
      >
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
                  onSelect={() => handleArticleSelect(result.title)}
                  className="flex items-center p-2 cursor-pointer hover:bg-accent rounded-lg"
                >
                  <div className="flex items-center w-full gap-3">
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
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
      </CommandDialog>
    </>
  );
};

export default Navigation;