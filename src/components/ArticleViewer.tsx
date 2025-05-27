
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Progress } from "./ui/progress";
import { Volume2, VolumeX } from "lucide-react";
import { getRandomArticles, getRelatedArticles } from "../services/wikipediaService";

const ArticleViewer = ({ articles: initialArticles, onArticleChange }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentArticle = articles[currentIndex];

  const loadMoreArticles = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      // Get related articles based on the current article
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
    if (!currentArticle?.content) return;

    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel();
      setIsReading(false);
      speechRef.current = null;
    } else {
      // Start reading
      const utterance = new SpeechSynthesisUtterance(currentArticle.content);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    setDisplayedText("");
    setProgress(0);
    onArticleChange(currentArticle);

    // Stop any ongoing speech when article changes
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
    }, 20); // Changed from 50ms to 20ms for faster streaming

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

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
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
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isVisible && currentIndex === index ? 1 : 0,
              y: isVisible && currentIndex === index ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-white p-8 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">{article.title}</h1>
              {currentIndex === index && (
                <button
                  onClick={handleTextToSpeech}
                  className="ml-4 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors"
                  aria-label={isReading ? "Stop reading" : "Read article aloud"}
                >
                  {isReading ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </button>
              )}
            </div>
            <p className="text-lg leading-relaxed mb-12">
              {currentIndex === index ? displayedText : article.content}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>{article.readTime} min read</span>
              <span>•</span>
              <span>{article.views.toLocaleString()} views</span>
            </div>
          </motion.div>
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
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-white">Loading more articles...</div>
        </div>
      )}
    </main>
  );
};

export default ArticleViewer;
