import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ArticleViewer = ({ article }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, [article]);

  return (
    <main className="flex-1 h-full">
      <div className="article-container">
        <section className="article-section">
          <div className="absolute inset-0">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover animate-ken-burns"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="text-overlay"
          >
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-lg leading-relaxed">{article.content}</p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-300">
              <span>{article.readTime} min read</span>
              <span>•</span>
              <span>{article.views} scholars</span>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
};

export default ArticleViewer;