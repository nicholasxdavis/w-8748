
import { motion } from "framer-motion";
import ArticleDisplay from "./ArticleDisplay";

interface SwipeableArticleProps {
  article: any;
  index: number;
  currentIndex: number;
  displayedText: string;
  progress: number;
  isVisible: boolean;
  showDoubleTapHint: boolean;
  handleContentClick: () => void;
  handleWikipediaRedirect: () => void;
  handleTextToSpeech: () => void;
  isReading: boolean;
  speechLoading: boolean;
  setShowShare: (show: boolean) => void;
}

const SwipeableArticle = (props: SwipeableArticleProps) => {
  return (
    <div 
      className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
      data-index={props.index}
    >
      <ArticleDisplay {...props} />
    </div>
  );
};

export default SwipeableArticle;
