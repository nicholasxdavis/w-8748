import { useEffect, useState } from "react";
import { getRandomArticles } from "@/services/wikipediaService";
import { useInView } from "react-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  "All",
  "Science",
  "History",
  "Technology",
  "Arts",
  "Sports",
  "Nature",
  "Philosophy",
  "Politics",
  "Literature",
];

const Discover = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { ref, inView } = useInView();

  const { data: articles = [], fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useQuery({
    queryKey: ["discover", selectedCategory],
    queryFn: () => getRandomArticles(12),
    getNextPageParam: (lastPage, pages) => pages.length < 3,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const handleArticleClick = (article: any) => {
    navigate(`/?q=${encodeURIComponent(article.title)}`, {
      state: { reorderedResults: [article] }
    });
  };

  return (
    <div className="min-h-screen bg-wikitok-dark text-white pt-16 pb-20">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4 py-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-wikitok-red text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] rounded-lg bg-white/10" />
          ))
        ) : (
          articles.map((article: any) => (
            <div
              key={article.id}
              className="relative aspect-[9/16] group cursor-pointer"
              onClick={() => handleArticleClick(article)}
            >
              <img
                src={article.image}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 rounded-lg" />
              <div className="absolute bottom-0 p-3 w-full">
                <h3 className="text-sm font-semibold line-clamp-2">{article.title}</h3>
                <p className="text-xs text-gray-300 mt-1">
                  {article.views.toLocaleString()} scholars
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wikitok-red" />
        </div>
      )}

      <div ref={ref} className="h-10" />
    </div>
  );
};

export default Discover;