import { useEffect, useState } from "react";
import { getRandomArticles, WikipediaArticle, searchArticles } from "@/services/wikipediaService";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share, Bookmark, TrendingUp } from "lucide-react";
const categories = [{
  id: "All",
  name: "For You",
  keywords: []
}, {
  id: "Science",
  name: "Science",
  keywords: ["science", "physics", "chemistry", "biology", "astronomy", "research", "laboratory", "experiment", "quantum", "molecule", "DNA", "theory", "discovery"]
}, {
  id: "History",
  name: "History",
  keywords: ["history", "ancient", "medieval", "war", "empire", "civilization", "historical", "century", "dynasty", "kingdom", "revolution", "culture", "tradition"]
}, {
  id: "Technology",
  name: "Tech",
  keywords: ["technology", "computer", "software", "internet", "digital", "innovation", "tech", "programming", "algorithm", "artificial", "intelligence", "machine"]
}, {
  id: "Sports",
  name: "Sports",
  keywords: ["sport", "football", "basketball", "soccer", "athlete", "olympic", "championship", "game", "team", "competition", "player", "tournament"]
}, {
  id: "Nature",
  name: "Nature",
  keywords: ["nature", "animal", "plant", "environment", "wildlife", "ecosystem", "conservation", "species", "forest", "ocean", "bird", "mammal"]
}];
const Discover = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [seenArticleIds, setSeenArticleIds] = useState(new Set<number>());
  const navigate = useNavigate();
  const {
    ref,
    inView
  } = useInView({
    threshold: 0.1
  });
  const {
    toast
  } = useToast();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["discover", selectedCategory],
    queryFn: async ({
      pageParam = 0
    }) => {
      console.log('Fetching page:', pageParam, 'for category:', selectedCategory);
      let articles: WikipediaArticle[] = [];
      if (selectedCategory !== "All") {
        const categoryConfig = categories.find(cat => cat.id === selectedCategory);
        if (categoryConfig?.keywords.length) {
          // For specific categories, use different keywords for different pages to get variety
          const keywordOffset = pageParam % categoryConfig.keywords.length;
          const selectedKeywords = [...categoryConfig.keywords.slice(keywordOffset, keywordOffset + 3), ...categoryConfig.keywords.slice(0, Math.max(0, 3 - (categoryConfig.keywords.length - keywordOffset)))].slice(0, 3);
          console.log('Using keywords for page', pageParam, ':', selectedKeywords);
          const searchPromises = selectedKeywords.map(keyword => searchArticles(keyword).then(results => results.slice(pageParam * 2, pageParam * 2 + 5)));
          const searchResults = await Promise.all(searchPromises);
          articles = searchResults.flat();

          // If we don't have enough articles from search, get random ones and filter
          if (articles.length < 8) {
            const randomArticles = await getRandomArticles(20);
            const filteredRandom = randomArticles.filter(article => {
              const titleLower = article.title.toLowerCase();
              const contentLower = article.content?.toLowerCase() || "";
              const tagsLower = article.tags.join(' ').toLowerCase();
              return categoryConfig.keywords.some(keyword => titleLower.includes(keyword.toLowerCase()) || contentLower.includes(keyword.toLowerCase()) || tagsLower.includes(keyword.toLowerCase()));
            });
            articles = [...articles, ...filteredRandom];
          }
        }
      } else {
        // For "All" category, get random articles with offset to avoid duplicates
        articles = await getRandomArticles(15);
      }

      // Remove articles we've already seen and ensure we have images
      const newArticles = articles.filter(article => article.image && !article.image.includes('placeholder')).filter(article => !seenArticleIds.has(article.id)).slice(0, 12);

      // Update seen articles
      const newSeenIds = new Set(seenArticleIds);
      newArticles.forEach(article => newSeenIds.add(article.id));
      setSeenArticleIds(newSeenIds);
      console.log('Fetched new articles:', newArticles.length, 'Total seen:', newSeenIds.size);
      return newArticles;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Continue loading if we got articles
      console.log('Last page size:', lastPage.length, 'Total pages:', allPages.length);
      return lastPage.length > 0 ? allPages.length : undefined;
    },
    staleTime: 1 * 60 * 1000,
    // 1 minute
    gcTime: 5 * 60 * 1000
  });

  // Reset seen articles when category changes
  useEffect(() => {
    setSeenArticleIds(new Set());
  }, [selectedCategory]);
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log('Loading next page...');
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSeenArticleIds(new Set()); // Reset seen articles when changing category
    toast({
      title: `Exploring ${category === "All" ? "trending content" : category.toLowerCase()}`,
      variant: "default"
    });
  };
  const handleArticleClick = (article: WikipediaArticle) => {
    navigate(`/?q=${encodeURIComponent(article.title)}`, {
      state: {
        reorderedResults: [article]
      }
    });
  };
  const articles = data?.pages.flat() ?? [];
  console.log('Total articles loaded:', articles.length);
  const getGridItemClass = (index: number) => {
    const patterns = ["row-span-2", "row-span-1", "row-span-1", "row-span-3", "row-span-1", "row-span-2"];
    return patterns[index % patterns.length];
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-16 pb-20">
      {/* Header */}
      <div className="absolute top-16 left-0 right-0 z-30 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-lg border-b border-gray-800/50">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Discover</h1>
          <div className="grid grid-cols-4 gap-2 md:flex md:gap-2 md:overflow-x-auto md:scrollbar-hide pb-2">
            {categories.map(category => <button key={category.id} onClick={() => handleCategoryChange(category.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 hover:scale-105"}`}>
                {category.name}
              </button>)}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-2 mt-32 sm:mt-36">
        {isLoading ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[200px]">
            {Array.from({
          length: 12
        }).map((_, i) => <Skeleton key={i} className={`bg-gray-800/50 rounded-xl ${getGridItemClass(i)}`} />)}
          </div> : articles.length === 0 ? <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No articles found</h3>
              <p className="text-gray-400 text-base max-w-md mx-auto">
                Try selecting a different category or check back later for fresh content.
              </p>
            </div>
          </div> : <div className="mt-[15px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[200px]">
            {articles.map((article, index) => <div key={`${article.id}-${index}`} className={`group relative cursor-pointer rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 ${getGridItemClass(index)}`} onClick={() => handleArticleClick(article)}>
                <img src={article.image} alt={article.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                {/* Enhanced Overlay - Always visible */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                
                {/* Content - Always visible */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                      <span className="text-white text-xs font-semibold">
                        {article.readTime}m read
                      </span>
                    </div>
                    {article.views > 50000 && <div className="bg-blue-600 rounded-full px-2 py-1 shadow-lg">
                        <span className="text-white text-xs font-semibold">Trending</span>
                      </div>}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-white font-bold text-sm line-clamp-2 drop-shadow-lg">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/90">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs font-medium">{Math.floor(Math.random() * 1000)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{Math.floor(Math.random() * 100)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}

        {isFetchingNextPage && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[200px] mt-2">
            {Array.from({
          length: 6
        }).map((_, i) => <Skeleton key={i} className={`bg-gray-800/50 rounded-xl ${getGridItemClass(i)}`} />)}
          </div>}

        <div ref={ref} className="h-20" />
      </div>
    </div>;
};
export default Discover;