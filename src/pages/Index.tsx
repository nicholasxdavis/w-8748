
import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "../components/ArticleViewer";
import { getMixedContent, searchMixedContent } from "../services/contentService";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q");
  const [currentArticle, setCurrentArticle] = useState(null);
  const { user, loading: authLoading } = useAuth();

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["mixed-content", searchQuery],
    queryFn: async () => {
      let fetchedContent;
      if (searchQuery) {
        if (location.state?.reorderedResults) {
          fetchedContent = location.state.reorderedResults;
        } else {
          fetchedContent = await searchMixedContent(searchQuery);
        }
      } else {
        fetchedContent = await getMixedContent(6);
      }
      return fetchedContent.filter(item => item.image);
    },
    retry: 1,
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load content. Please try again later.",
      variant: "destructive",
    });
  }

  if (isLoading || authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-sm sm:text-lg px-4 text-center">Loading amazing content...</div>
      </div>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-sm sm:text-base px-4 text-center">Something went wrong. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-900">
      <ArticleViewer 
        articles={articles} 
        onArticleChange={setCurrentArticle}
      />
    </div>
  );
};

export default Index;
