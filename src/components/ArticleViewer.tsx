import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ArticleViewer = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, [currentIndex]);

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

    const articles = container.querySelectorAll(".article-section");
    articles.forEach((article) => observer.observe(article));

    return () => {
      articles.forEach((article) => observer.unobserve(article));
    };
  }, []);

  return (
    <main 
      ref={containerRef} 
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
    >
      {articles.map((article, index) => (
        <div 
          key={article.id} 
          data-index={index}
          className="article-section h-screen w-full snap-start snap-always relative flex items-center justify-center"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
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
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-lg leading-relaxed mb-12">{article.content}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>{article.readTime} min read</span>
              <span>•</span>
              <span>{article.views} scholars</span>
            </div>
          </motion.div>
        </div>
      ))}
    </main>
  );
};

export default ArticleViewer;