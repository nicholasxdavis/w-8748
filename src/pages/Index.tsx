import { useState } from "react";
import ArticleViewer from "../components/ArticleViewer";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Navigation from "../components/Navigation";

const Index = () => {
  const [articles] = useState([
    {
      id: 1,
      title: "Ancient Egypt",
      content: "The civilization of Ancient Egypt thrived along the Nile River from about 3100 BC to 30 BC. Known for its monumental architecture, complex religious beliefs, and innovations in art, writing, and technology, Ancient Egypt was one of history's most influential civilizations.",
      image: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2",
      citations: 156,
      readTime: 3,
      views: 1234,
      tags: ["history", "civilization", "africa", "architecture"],
      relatedArticles: [
        { id: 2, title: "Pyramids of Giza", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742" },
        { id: 3, title: "Nile River", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
        { id: 4, title: "Egyptian Mythology", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" },
      ],
    },
    {
      id: 2,
      title: "The Great Pyramids",
      content: "The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex. It is the oldest of the Seven Wonders of the Ancient World, and the only one to remain largely intact.",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
      citations: 234,
      readTime: 4,
      views: 2345,
      tags: ["architecture", "egypt", "wonders", "ancient"],
      relatedArticles: [
        { id: 1, title: "Ancient Egypt", image: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2" },
        { id: 3, title: "Nile River", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
        { id: 4, title: "Egyptian Mythology", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" },
      ],
    },
  ]);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <Navigation />
      <div className="flex h-full">
        <LeftSidebar article={articles[0]} />
        <ArticleViewer articles={articles} />
        <RightSidebar article={articles[0]} />
      </div>
    </div>
  );
};

export default Index;