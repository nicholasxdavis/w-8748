
import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "../components/ArticleViewer";
import WelcomePopup from "../components/WelcomePopup";
import InterestSelectionPopup from "../components/InterestSelectionPopup";
import TutorialOverlay from "../components/tutorial/TutorialOverlay";
import { getMixedContent, searchMixedContent } from "../services/contentService";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTutorial } from "@/hooks/useTutorial";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q");
  const [currentArticle, setCurrentArticle] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const { showTutorial, isLoading: tutorialLoading, completeTutorial } = useTutorial();

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(() => 
    ["mixed-content", searchQuery, user?.id], 
    [searchQuery, user?.id]
  );

  const { data: articles, isLoading, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('Fetching content with query:', searchQuery, 'for user:', user?.id);
      
      let fetchedContent;
      if (searchQuery) {
        if (location.state?.reorderedResults) {
          fetchedContent = location.state.reorderedResults;
        } else {
          fetchedContent = await searchMixedContent(searchQuery);
        }
      } else {
        // Pass user ID for personalized content
        fetchedContent = await getMixedContent(8, user?.id);
      }
      
      // Filter out articles without images
      const validContent = fetchedContent.filter(item => item.image && !item.image.includes('placeholder'));
      
      if (validContent.length === 0) {
        throw new Error('No valid content found');
      }
      
      return validContent;
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !authLoading, // Don't fetch until auth is resolved
  });

  // Handle errors with user-friendly messages
  useEffect(() => {
    if (error) {
      console.error('Content loading error:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load content. Please check your connection and try again.",
        variant: "destructive",
        action: (
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1 bg-white text-black rounded-md text-sm hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        ),
      });
    }
  }, [error, toast, refetch]);

  // Loading state with better UX
  if (isLoading || authLoading || tutorialLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-blue-400 mx-auto" />
          </motion.div>
          <div className="text-white text-lg font-medium">
            {authLoading ? 'Initializing...' : 'Loading amazing content...'}
          </div>
          <div className="text-gray-400 text-sm">
            {user?.id ? 'Personalizing your feed...' : 'Preparing articles for you...'}
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state with retry option
  if (error || !articles || articles.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <motion.div 
          className="text-center space-y-6 px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-white text-xl font-semibold">
            {searchQuery ? 'No results found' : 'Unable to load content'}
          </div>
          <div className="text-gray-400 text-base max-w-md">
            {searchQuery 
              ? `No articles found for "${searchQuery}". Try a different search term.`
              : 'Something went wrong while loading articles. Please check your connection and try again.'
            }
          </div>
          <div className="space-y-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isFetching ? 'Loading...' : 'Try Again'}
            </button>
            {searchQuery && (
              <button
                onClick={() => navigate('/')}
                className="block mx-auto text-gray-400 hover:text-white transition-colors text-sm"
              >
                Go back to home feed
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="h-screen w-screen relative overflow-hidden bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ArticleViewer 
        articles={articles} 
        onArticleChange={setCurrentArticle}
      />
      <WelcomePopup />
      <InterestSelectionPopup />
      
      {/* Tutorial overlay */}
      {showTutorial && (
        <TutorialOverlay onComplete={completeTutorial} />
      )}
      
      {/* Loading indicator for background fetches */}
      {isFetching && !isLoading && (
        <motion.div 
          className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Refreshing content...
        </motion.div>
      )}
    </motion.div>
  );
};

export default Index;
