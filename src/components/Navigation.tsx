import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { searchMixedContent, getMixedContent } from "../services/contentService";
import { useQuery } from "@tanstack/react-query";
import SavedArticlesFullPage from "./SavedArticlesFullPage";
import SearchButton from "./search/SearchButton";
import SearchInterface from "./search/SearchInterface";
import UserMenu from "./navigation/UserMenu";

const Navigation = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticlesOpen, setSavedArticlesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
    const randomContent = await getMixedContent(6);
    if (randomContent.length > 0) {
      navigate(`/?q=${encodeURIComponent(randomContent[0].title)}`, {
        state: { reorderedResults: randomContent }
      });
    }
  };

  const handleDiscoverClick = () => {
    navigate('/discover');
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center backdrop-blur-lg">
        {/* Mobile Layout */}
        <div className="flex items-center w-full px-4 sm:hidden">
          <div 
            className="text-lg font-bold cursor-pointer text-white hover:scale-105 transition-transform"
            onClick={handleRandomContent}
          >
            Lore
          </div>
          
          <div className="mx-4 flex-1 max-w-[calc(100vw-200px)] ml-[26px]">
            <SearchButton 
              searchQuery={searchQuery}
              onClick={() => setSearchOpen(true)}
              isMobile={true}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSavedArticlesOpen(true)}
              className="text-blue-400 bg-blue-400/10 hover:text-gray-400 hover:bg-transparent transition-all p-2 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <UserMenu />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center w-full px-6 relative">
          <div 
            className="text-2xl font-bold cursor-pointer flex-shrink-0 text-white hover:scale-105 transition-transform"
            onClick={handleRandomContent}
          >
            Lore
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <SearchButton 
              searchQuery={searchQuery}
              onClick={() => setSearchOpen(true)}
            />
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
            <button
              onClick={() => setSavedArticlesOpen(true)}
              className="text-blue-400 bg-blue-400/10 hover:text-gray-400 hover:bg-transparent transition-all p-2 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <UserMenu />
          </div>
        </div>
      </div>

      <SearchInterface
        isOpen={searchOpen}
        onClose={handleSearchClose}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        results={searchResults || []}
        isSearching={isLoading}
        onSaveArticle={() => {}}
      />

      <SavedArticlesFullPage 
        isOpen={savedArticlesOpen}
        onClose={() => setSavedArticlesOpen(false)}
      />
    </>
  );
};

export default Navigation;
