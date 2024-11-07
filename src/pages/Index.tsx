import { useState } from "react";
import ArticleViewer from "../components/ArticleViewer";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Navigation from "../components/Navigation";

const Index = () => {
  const [currentArticle, setCurrentArticle] = useState({
    id: 1,
    title: "Ancient Egypt",
    content: "The civilization of Ancient Egypt thrived along the Nile River from about 3100 BC to 30 BC.",
    image: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2",
    citations: 156,
    tags: ["history", "civilization", "africa"],
    relatedArticles: [
      { id: 2, title: "Pyramids", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742" },
      { id: 3, title: "Nile River", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
    ],
  });

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <Navigation />
      <div className="flex h-full">
        <LeftSidebar article={currentArticle} />
        <ArticleViewer article={currentArticle} />
        <RightSidebar article={currentArticle} />
      </div>
    </div>
  );
};

export default Index;