
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Progress } from "./ui/progress";
import { Volume2, VolumeX, Share2, Bookmark } from "lucide-react";
import { getRandomArticles, getRelatedArticles } from "../services/wikipediaService";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentArticle = articles[currentIndex];
  const { toast } = useToast();

  const loadMoreArticles = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const newArticles = currentArticle 
        ? await getRelatedArticles(currentArticle)
        : await getRandomArticles(3);
      setArticles(prev => [...prev, ...newArticles]);
    } catch (error) {
      console.error("Failed to load more articles", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentArticle]);

  const handleTextToSpeech = () => {
    if (!currentArticle?.content) {
      toast({
        title: "No content available",
        description: "This article doesn't have content to read aloud.",
        variant: "warning",
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
        variant: "info",
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
          variant: "success",
        });
      };
      
      utterance.onend = () => {
        setIsReading(false);
        toast({
          title: "Reading complete",
          description: "Finished reading the article.",
          variant: "info",
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
      
      // Check if speech synthesis is available
      if (window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      } else {
        toast({
          title: "Not supported",
          description: "Text-to-speech is not supported in your browser.",
          variant: "warning",
        });
      }
    }
  };

  useEffect(() => {
    setIsVisible(true);
    setDisplayedText("");
    setProgress(0);
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
    if (!isVisible || !currentArticle?.content) return;

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
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isVisible, currentArticle?.content]);

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
            key={article.id} 
            data-index={index}
            className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center"
          >
            <div className="absolute inset-0 w-screen h-screen">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isVisible && currentIndex === index ? 1 : 0,
                y: isVisible && currentIndex === index ? 0 : 20,
              }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-white p-6 max-w-4xl mx-auto h-full flex flex-col justify-end pb-32"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>
                </div>
                <p className="text-lg leading-relaxed opacity-90">
                  {currentIndex === index ? displayedText : article.content}
                </p>
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <span>{article.readTime} min read</span>
                  <span>•</span>
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons - Right Side */}
            {currentIndex === index && (
              <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-20">
                <LikeButton articleId={article.id} articleTitle={article.title} />
                <CommentButton 
                  articleId={article.id} 
                  onClick={() => setShowComments(true)}
                />
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleTextToSpeech}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isReading 
                        ? 'bg-red-500 text-white' 
                        : 'bg-black/20 text-white hover:bg-black/40'
                    }`}
                  >
                    {isReading ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </button>
                  <span className="text-white text-xs mt-1">Listen</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setShowShare(true)}
                    className="p-3 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all duration-200"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                  <span className="text-white text-xs mt-1">Share</span>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {currentIndex === index && (
              <div className="absolute bottom-0 left-0 right-0 z-20">
                <Progress 
                  value={progress} 
                  className="h-1 bg-black/20"
                  indicatorClassName="bg-red-500"
                />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="h-screen w-screen flex items-center justify-center bg-black">
            <div className="text-white">Loading more articles...</div>
          </div>
        )}
      </main>

      <CommentsModal
        articleId={currentArticle?.id || ''}
        articleTitle={currentArticle?.title || ''}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={currentArticle?.title || ''}
        articleId={currentArticle?.id || ''}
      />
    </>
  );
};

export default ArticleViewer;
