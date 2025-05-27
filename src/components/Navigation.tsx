
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { searchMixedContent, getMixedContent } from "../services/contentService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import SavedArticlesPopover from "./SavedArticlesPopover";
import SearchTrigger from "./navigation/SearchTrigger";
import SearchDialog from "./navigation/SearchDialog";
import UserMenu from "./navigation/UserMenu";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-3 sm:px-6 backdrop-blur-lg overflow-x-hidden">
        <div 
          className="text-lg sm:text-2xl font-bold cursor-pointer flex-shrink-0 text-white hover:scale-105 transition-transform"
          onClick={handleRandomContent}
        >
          Lore
        </div>
        
        <SearchTrigger 
          searchValue={searchValue}
          onClick={() => setOpen(true)}
          isMobile={true}
        />

        <div className="hidden sm:block">
          <SearchTrigger 
            searchValue={searchValue}
            onClick={() => setOpen(true)}
          />
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <SavedArticlesPopover />
          <UserMenu />
        </div>
      </div>

      <SearchDialog
        open={open}
        onOpenChange={handleOpenChange}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchResults={searchResults || []}
        isLoading={isLoading}
      />
    </>
  );
};

export default Navigation;
