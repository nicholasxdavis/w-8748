
import { useEffect, useState } from "react";
import { getRandomArticles, WikipediaArticle } from "@/services/wikipediaService";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, Clock, Eye, Star } from "lucide-react";

const categories = [
  { id: "All", name: "For You", icon: TrendingUp },
  { id: "Science", name: "Science", icon: Star },
  { id: "History", name: "History", icon: Clock },
  { id: "Technology", name: "Tech", icon: TrendingUp },
  { id: "Arts", name: "Arts", icon: Star },
  { id: "Sports", name: "Sports", icon: TrendingUp },
  { id: "Nature", name: "Nature", icon: Star },
  { id: "Philosophy", name: "Philosophy", icon: Clock },
  { id: "Politics", name: "Politics", icon: TrendingUp },
  { id: "Literature", name: "Books", icon: Star },
];

const Discover = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const preloadNextPage = async (category: string) => {
    try {
      const nextData = await getRandomArticles(20, category);
      const articlesWithImages = nextData.filter(article => article.image);
      articlesWithImages.forEach(article => {
        const img = new Image();
        img.src = article.image;
      });
      return articlesWithImages;
    } catch (error) {
      console.error('Error preloading data:', error);
      return [];
    }
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["discover", selectedCategory],
    queryFn: async ({ pageParam }) => {
      const articles = await getRandomArticles(20, selectedCategory);
      return articles.filter(article => article.image);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length < 5 ? allPages.length + 1 : undefined;
    },
  });

  const handleCategoryHover = async (category: string) => {
    if (category !== selectedCategory) {
      await preloadNextPage(category);
    }
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const handleCategoryChange = async (category: string) => {
    await queryClient.cancelQueries({ queryKey: ["discover", selectedCategory] });
    await queryClient.cancelQueries({ queryKey: ["discover", category] });
    
    queryClient.removeQueries({ queryKey: ["discover", selectedCategory] });
    queryClient.removeQueries({ queryKey: ["discover", category] });
    
    setSelectedCategory(category);
    
    toast({
      title: `Discovering ${category === "All" ? "trending" : category.toLowerCase()} articles`,
      description: "Finding the best content for you...",
      variant: "info",
    });

    await refetch();
  };

  const handleArticleClick = (article: WikipediaArticle) => {
    navigate(`/?q=${encodeURIComponent(article.title)}`, {
      state: { reorderedResults: [article] }
    });
  };

  const articles = data?.pages.flat() ?? [];

  const renderArticleCard = (article: WikipediaArticle, index: number) => {
    const isLarge = index % 7 === 0 || index % 7 === 3;
    
    return (
      <div
        key={`${article.id}-${article.title}`}
        className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
          isLarge ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
        } aspect-square`}
        onClick={() => handleArticleClick(article)}
      >
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
        
        {/* Overlay content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-xs font-medium">
                {article.readTime} min
              </span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white text-xs">
                {article.views > 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 p-4 w-full">
          <h3 className={`text-white font-bold leading-tight line-clamp-3 ${
            isLarge ? "text-lg" : "text-sm"
          }`}>
            {article.title}
          </h3>
          {isLarge && (
            <p className="text-gray-300 text-sm mt-2 line-clamp-2">
              {article.content?.substring(0, 100)}...
            </p>
          )}
        </div>

        {/* Trending indicator for popular articles */}
        {article.views > 50000 && (
          <div className="absolute top-4 left-4 bg-red-500 rounded-full p-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-20">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Discover</h1>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    onMouseEnter={() => handleCategoryHover(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === category.id
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                        : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl bg-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6 auto-rows-max">
            {articles.map((article: WikipediaArticle, index: number) => 
              renderArticleCard(article, index)
            )}
          </div>
        )}

        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
          </div>
        )}

        <div ref={ref} className="h-10" />
      </div>
    </div>
  );
};

export default Discover;
