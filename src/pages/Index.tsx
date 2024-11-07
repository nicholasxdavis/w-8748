import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "../components/ArticleViewer";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Navigation from "../components/Navigation";
import { getRandomArticles } from "../services/wikipediaService";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["articles"],
    queryFn: () => getRandomArticles(3),
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