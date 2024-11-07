import { Home, Search, Compass } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchArticles } from "../services/wikipediaService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: () => searchArticles(searchTerm),
    enabled: searchTerm.length > 2,
  });

  console.log("Search term:", searchTerm, "Results:", searchResults);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-transparent z-50 flex items-center justify-between px-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-xl font-bold text-wikitok-red">WikiTok</div>
        <div 
          className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-white/60 mr-2" />
          <span className="text-white/60 text-sm">Search articles</span>
        </div>
        <div className="flex space-x-6">
          <Home className="w-5 h-5 text-white" />
          <Compass className="w-5 h-5 text-white" />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search articles..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {isLoading && (
            <CommandEmpty>Searching...</CommandEmpty>
          )}
          {!isLoading && searchTerm.length < 3 && (
            <CommandEmpty>Type at least 3 characters to search</CommandEmpty>
          )}
          {!isLoading && searchTerm.length >= 3 && (!searchResults || searchResults.length === 0) && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {!isLoading && searchResults && searchResults.length > 0 && (
            <CommandGroup heading="Articles">
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setOpen(false);
                    toast({
                      title: "Loading article",
                      description: `Loading ${result.title}...`,
                    });
                    console.log("Selected article:", result.title);
                  }}
                >
                  <div className="flex items-center">
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.title}
                        className="w-8 h-8 object-cover rounded-md mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-gray-400 truncate max-w-[300px]">
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