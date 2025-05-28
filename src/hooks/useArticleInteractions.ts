
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSaveArticle } from "@/hooks/useSaveArticle";
import { isNewsArticle } from "../services/contentService";

export const useArticleInteractions = (currentArticle: any, showFullText: () => void) => {
  const { toast } = useToast();
  const { speak, stop, isReading, isLoading: speechLoading } = useTextToSpeech();
  const { toggleSave } = useSaveArticle();

  const handleTextToSpeech = useCallback(() => {
    if (!currentArticle?.content) {
      toast({
        title: "No content available",
        description: "This article doesn't have content to read aloud.",
        variant: "destructive"
      });
      return;
    }
    speak(currentArticle.content);
  }, [currentArticle?.content, speak, toast]);

  const handleWikipediaRedirect = useCallback(() => {
    const baseUrl = "https://en.wikipedia.org/wiki/";
    const articleTitle = encodeURIComponent(currentArticle.title);
    window.open(`${baseUrl}${articleTitle}`, '_blank');
  }, [currentArticle?.title]);

  const handleContentClick = useCallback((
    clickCountRef: React.MutableRefObject<number>,
    doubleClickTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    clickCountRef.current += 1;
    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
    }
    if (clickCountRef.current === 1) {
      doubleClickTimeoutRef.current = setTimeout(() => {
        showFullText();
        clickCountRef.current = 0;
      }, 300);
    } else if (clickCountRef.current === 2) {
      if (currentArticle) {
        toggleSave({
          id: String(currentArticle.id),
          title: currentArticle.title,
          content: currentArticle.content,
          image: currentArticle.image,
          isBreakingNews: isNewsArticle(currentArticle) ? currentArticle.isBreakingNews : undefined
        });
      }
      clickCountRef.current = 0;
    }
  }, [currentArticle, toggleSave, showFullText]);

  return {
    handleTextToSpeech,
    handleWikipediaRedirect,
    handleContentClick,
    isReading,
    speechLoading,
    stop
  };
};
