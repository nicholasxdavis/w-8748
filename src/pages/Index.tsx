
import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "../components/ArticleViewer";
import { getRandomArticles, searchArticles } from "../services/wikipediaService";
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
    queryKey: ["articles", searchQuery],
    queryFn: async () => {
      let fetchedArticles;
      if (searchQuery) {
        if (location.state?.reorderedResults) {
          fetchedArticles = location.state.reorderedResults;
        } else {
          fetchedArticles = await searchArticles(searchQuery);
        }
      } else {
        fetchedArticles = await getRandomArticles(3);
      }
      return fetchedArticles.filter(article => article.image);
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

  if (isLoading || authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-white text-sm sm:text-lg px-4 text-center">Loading amazing articles...</div>
      </div>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-white text-sm sm:text-base px-4 text-center">Something went wrong. Please try again.</div>
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
