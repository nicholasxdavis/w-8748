import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "../components/ArticleViewer";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Navigation from "../components/Navigation";
import { getRandomArticles, searchArticles } from "../services/wikipediaService";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useLocation } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get("q");

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["articles", searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        // If we have reordered results in the location state, use those
        if (location.state?.reorderedResults) {
          return location.state.reorderedResults;
        }
        return searchArticles(searchQuery);
      }
      return getRandomArticles(3);
    },
    retry: 1,
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load articles. Please try again later.",
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-wikitok-dark">
        <div className="text-white">Loading amazing articles...</div>
      </div>
    );
  }

  if (error || !articles) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-wikitok-dark">
        <div className="text-white">Something went wrong. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <Navigation />
      <div className="flex h-full">
        <LeftSidebar article={articles[0]} />
        <ArticleViewer articles={articles} />
        <RightSidebar article={articles[0]} />
      </div>
    </div>
  );
};

export default Index;