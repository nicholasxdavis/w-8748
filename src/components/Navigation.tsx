
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { searchMixedContent, getMixedContent } from "../services/contentService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import SavedArticlesPopover from "./SavedArticlesPopover";
import SearchButton from "./search/SearchButton";
import SearchInterface from "./search/SearchInterface";
import UserMenu from "./navigation/UserMenu";

const Navigation = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && location.pathname !== "/discover") {
      const decodedQuery = decodeURIComponent(query);
      setSearchQuery(decodedQuery);
    }
  }, [searchParams, location.pathname]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchMixedContent(searchQuery),
    enabled: searchQuery.length > 0,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleRandomContent = async () => {
    setSearchQuery("");
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

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-3 sm:px-6 backdrop-blur-lg">
        <div 
          className="text-lg sm:text-2xl font-bold cursor-pointer flex-shrink-0 text-white hover:scale-105 transition-transform"
          onClick={handleRandomContent}
        >
          Lore
        </div>
        
        <SearchButton 
          searchQuery={searchQuery}
          onClick={() => setSearchOpen(true)}
        />
        
        <div className="flex items-center space-x-4 flex-shrink-0">
          <SavedArticlesPopover />
          <UserMenu />
        </div>
      </div>

      <SearchInterface
        isOpen={searchOpen}
        onClose={handleSearchClose}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        results={searchResults || []}
        isSearching={isLoading}
      />
    </>
  );
};

export default Navigation;
