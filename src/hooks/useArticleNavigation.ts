
import { useEffect, useRef } from 'react';

export const useArticleNavigation = (
  articles: any[],
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  setIsVisible: (visible: boolean) => void,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            if (index !== currentIndex) {
              setCurrentIndex(index);
              setIsVisible(true);
            }
          }
        });
      },
      { threshold: 0.6, root: null, rootMargin: "-10% 0px -10% 0px" }
    );

    const articleElements = container.querySelectorAll(".article-section");
    articleElements.forEach(article => observer.observe(article));

    return () => {
      articleElements.forEach(article => observer.unobserve(article));
    };
  }, [articles, currentIndex, setCurrentIndex, setIsVisible]);
};
