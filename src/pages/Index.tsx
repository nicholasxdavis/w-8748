
import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "../components/ArticleViewer";
import { getRandomArticles, searchArticles } from "../services/wikipediaService";
import { useToast } from "@/components/ui/use-toast";
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

  // Don't redirect immediately - let users browse articles first
  // They'll be prompted to sign in when they try to interact

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
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Loading amazing articles...</div>
      </div>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-white">Something went wrong. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      <ArticleViewer 
        articles={articles} 
        onArticleChange={setCurrentArticle}
      />
    </div>
  );
};

export default Index;
