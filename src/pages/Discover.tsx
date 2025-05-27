
import { useEffect, useState } from "react";
import { getRandomArticles, WikipediaArticle } from "@/services/wikipediaService";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share, Bookmark, TrendingUp } from "lucide-react";

const categories = [
  { id: "All", name: "For You" },
  { id: "Science", name: "Science" },
  { id: "History", name: "History" },
  { id: "Technology", name: "Tech" },
  { id: "Arts", name: "Arts" },
  { id: "Sports", name: "Sports" },
  { id: "Nature", name: "Nature" },
  { id: "Philosophy", name: "Philosophy" },
];

const Discover = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { ref, inView } = useInView({ threshold: 0.1 });
  const { toast } = useToast();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["discover", selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      const articles = await getRandomArticles(12, selectedCategory);
      return articles.filter(article => article.image);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    toast({
      title: `Exploring ${category === "All" ? "trending" : category}`,
      variant: "default",
    });
  };

  const handleArticleClick = (article: WikipediaArticle) => {
    navigate(`/?q=${encodeURIComponent(article.title)}`, {
      state: { reorderedResults: [article] }
    });
  };

  const articles = data?.pages.flat() ?? [];

  const getGridItemClass = (index: number) => {
    const patterns = [
      "row-span-2", // tall
      "row-span-1", // square
      "row-span-1", // square
      "row-span-3", // very tall
      "row-span-1", // square
      "row-span-2", // tall
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-16 pb-20">
      {/* Fixed Header */}
      <div className="fixed top-16 left-0 right-0 z-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-b border-gray-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Discover</h1>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid with proper top margin to account for fixed header */}
      <div className="px-2 mt-32 sm:mt-36">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[200px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className={`bg-gray-800 rounded-lg ${getGridItemClass(i)}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[200px]">
            {articles.map((article, index) => (
              <div
                key={`${article.id}-${index}`}
                className={`group relative cursor-pointer rounded-lg overflow-hidden bg-gray-800 ${getGridItemClass(index)}`}
                onClick={() => handleArticleClick(article)}
              >
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex justify-between items-start">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-white text-xs font-medium">
                        {article.readTime}m
                      </span>
                    </div>
                    {article.views > 50000 && (
                      <div className="bg-red-500 rounded-full p-1.5">
                        <TrendingUp className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 sm:gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs">{Math.floor(Math.random() * 1000)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs">{Math.floor(Math.random() * 100)}</span>
                      </div>
                      <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFetchingNextPage && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[200px] mt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`bg-gray-800 rounded-lg ${getGridItemClass(i)}`} />
            ))}
          </div>
        )}

        <div ref={ref} className="h-20" />
      </div>
    </div>
  );
};

export default Discover;
