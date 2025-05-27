
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
        // Preload 10 posts for a responsive interface
        fetchedContent = await getMixedContent(10);
      }
      return fetchedContent.filter(item => item.image);
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-white text-sm sm:text-lg px-4 text-center font-medium">
            Loading amazing content...
          </div>
        </div>
      </div>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-white text-sm sm:text-base px-4 text-center">
            Something went wrong. Please try again.
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <ArticleViewer 
        articles={articles} 
        onArticleChange={setCurrentArticle}
      />
    </div>
  );
};

export default Index;
