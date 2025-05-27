import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Progress } from "./ui/progress";
import { Volume2, VolumeX, Share2, Calendar, Globe } from "lucide-react";
import { getMixedContent } from "../services/contentService";
import { isNewsArticle } from "../services/contentService";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";
import CommentsModal from "./CommentsModal";
import ShareModal from "./ShareModal";
import { useToast } from "@/components/ui/use-toast";

const ArticleViewer = ({ articles: initialArticles, onArticleChange }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isTextFullyLoaded, setIsTextFullyLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const clickCountRef = useRef(0);
  const currentArticle = articles[currentIndex];
  const { toast } = useToast();

  const loadMoreArticles = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const newArticles = await getMixedContent(6);
      setArticles(prev => [...prev, ...newArticles]);
    } catch (error) {
      console.error("Failed to load more content", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleContentClick = () => {
    clickCountRef.current += 1;
    
    if (clickCountRef.current === 1) {
      if (!isTextFullyLoaded) {
        setDisplayedText(currentArticle?.content || "");
        setProgress(100);
        setIsTextFullyLoaded(true);
      }
    }
    
    setTimeout(() => {
      clickCountRef.current = 0;
    }, 300);
  };

  const handleTextToSpeech = () => {
    if (!currentArticle?.content) {
      toast({
        title: "No content available",
        description: "This article doesn't have content to read aloud.",
        variant: "destructive",
      });
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      speechRef.current = null;
      toast({
        title: "Speech stopped",
        description: "Text-to-speech has been stopped.",
      });
    } else {
      const utterance = new SpeechSynthesisUtterance(currentArticle.content);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsReading(true);
        toast({
          title: "Reading aloud",
          description: "Article is being read to you.",
        });
      };
      
      utterance.onend = () => {
        setIsReading(false);
        toast({
          title: "Reading complete",
          description: "Finished reading the article.",
        });
      };
      
      utterance.onerror = () => {
        setIsReading(false);
        toast({
          title: "Speech error",
          description: "There was an error with text-to-speech.",
          variant: "destructive",
        });
      };
      
      speechRef.current = utterance;
      
      if (window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      } else {
        toast({
          title: "Not supported",
          description: "Text-to-speech is not supported in your browser.",
          variant: "destructive",
        });
      }
    }
  };

  const formatNewsDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    setIsVisible(true);
    setDisplayedText("");
    setProgress(0);
    setIsTextFullyLoaded(false);
    clickCountRef.current = 0;
    onArticleChange(currentArticle);

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }

    if (currentIndex >= articles.length - 2) {
      loadMoreArticles();
    }
  }, [currentIndex, currentArticle, onArticleChange, articles.length, loadMoreArticles, isReading]);

  useEffect(() => {
    if (!isVisible || !currentArticle?.content || isTextFullyLoaded) return;

    let currentChar = 0;
    const text = currentArticle.content;
    const totalChars = text.length;

    const interval = setInterval(() => {
      if (currentChar <= totalChars) {
        setDisplayedText(text.slice(0, currentChar));
        setProgress((currentChar / totalChars) * 100);
        currentChar++;
      } else {
        clearInterval(interval);
        setIsTextFullyLoaded(true);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isVisible, currentArticle?.content, isTextFullyLoaded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setCurrentIndex(index);
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.7,
        root: null,
      }
    );

    const articleElements = container.querySelectorAll(".article-section");
    articleElements.forEach((article) => observer.observe(article));

    return () => {
      articleElements.forEach((article) => observer.unobserve(article));
    };
  }, [articles]);

  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <>
      <main 
        ref={containerRef} 
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {articles.map((article, index) => (
          <div 
            key={isNewsArticle(article) ? article.id : `wiki-${article.id}`} 
            data-index={index}
            className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center"
            onClick={handleContentClick}
          >
            <div className="absolute inset-0 w-screen h-screen">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
            </div>

            {/* Breaking News Badge */}
            {isNewsArticle(article) && (
              <div className="absolute top-20 left-4 z-20">
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm border border-red-400/30">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  BREAKING NEWS
                </div>
              </div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isVisible && currentIndex === index ? 1 : 0,
                y: isVisible && currentIndex === index ? 0 : 20,
              }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-white p-4 sm:p-6 max-w-4xl mx-auto h-full flex flex-col justify-end pb-32"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between">
                  <h1 className="text-xl sm:text-3xl font-bold leading-tight drop-shadow-lg">{article.title}</h1>
                </div>
                <div className="max-h-48 sm:max-h-64 overflow-y-auto scrollbar-hide bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-sm sm:text-lg leading-relaxed opacity-95">
                    {currentIndex === index ? displayedText : article.content}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-xs sm:text-sm text-white/80 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  {isNewsArticle(article) ? (
                    <>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{article.source}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatNewsDate(article.publishedAt)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{article.readTime} min read</span>
                      <span>•</span>
                      <span>{article.views.toLocaleString()} views</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons - Mobile & Desktop Optimized */}
            {currentIndex === index && (
              <div className="absolute right-2 sm:right-4 bottom-24 sm:bottom-32 flex flex-col space-y-2 sm:space-y-4 z-20">
                <LikeButton articleId={String(article.id)} articleTitle={article.title} />
                <CommentButton 
                  articleId={String(article.id)} 
                  onClick={() => setShowComments(true)}
                />
                <div className="flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTextToSpeech();
                    }}
                    className={`p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-md border border-white/20 ${
                      isReading 
                        ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' 
                        : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
                    }`}
                  >
                    {isReading ? (
                      <VolumeX className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-6 sm:h-6" />
                    )}
                  </button>
                  <span className="text-white text-xs mt-1 font-medium">Listen</span>
                </div>
                
                {/* Hide share button on mobile, show on desktop */}
                <div className="hidden sm:flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShare(true);
                    }}
                    className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                  <span className="text-white text-xs mt-1 font-medium">Share</span>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {currentIndex === index && (
              <div className="absolute bottom-0 left-0 right-0 z-20">
                <Progress 
                  value={progress} 
                  className="h-1 bg-black/30"
                  indicatorClassName="bg-gradient-to-r from-blue-400 to-purple-600"
                />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="h-screen w-screen flex items-center justify-center bg-black">
            <div className="text-white text-lg">Loading more amazing content...</div>
          </div>
        )}
      </main>

      <CommentsModal
        articleId={String(currentArticle?.id || '')}
        articleTitle={currentArticle?.title || ''}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={currentArticle?.title || ''}
        articleId={String(currentArticle?.id || '')}
      />
    </>
  );
};

export default ArticleViewer;
