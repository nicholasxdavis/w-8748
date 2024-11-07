import { useState } from "react";
import ArticleViewer from "../components/ArticleViewer";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import Navigation from "../components/Navigation";

const Index = () => {
  const [articles] = useState([
    {
      id: 1,
      title: "The Rise of Computing",
      content: "From the first mechanical calculators to modern quantum computers, the evolution of computing has transformed human civilization. The development of integrated circuits and microprocessors in the 20th century led to a digital revolution that continues to shape our world today.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      citations: 234,
      readTime: 3,
      views: 2345,
      tags: ["technology", "history", "computers", "science"],
      relatedArticles: [
        { id: 2, title: "Great Pyramids", image: "https://images.unsplash.com/photo-1481489712339-f9c0734be5d5" },
        { id: 3, title: "Digital Revolution", image: "https://images.unsplash.com/photo-1518770660439-4636190af475" },
        { id: 4, title: "Modern Education", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7" },
      ],
    },
    {
      id: 2,
      title: "The Great Pyramids",
      content: "The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex. It is the oldest of the Seven Wonders of the Ancient World, and the only one to remain largely intact.",
      image: "https://images.unsplash.com/photo-1481489712339-f9c0734be5d5",
      citations: 234,
      readTime: 4,
      views: 2345,
      tags: ["architecture", "egypt", "wonders", "ancient"],
      relatedArticles: [
        { id: 1, title: "The Rise of Computing", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
        { id: 3, title: "Digital Revolution", image: "https://images.unsplash.com/photo-1518770660439-4636190af475" },
        { id: 4, title: "Modern Education", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7" },
      ],
    },
    {
      id: 3,
      title: "The Digital Revolution",
      content: "The Digital Revolution marks the shift from mechanical and analog electronic technology to digital electronics and digital computing. This transformation has fundamentally changed how we live, work, and communicate, leading to the Information Age we live in today.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      citations: 189,
      readTime: 3,
      views: 1876,
      tags: ["technology", "history", "digital", "innovation"],
      relatedArticles: [
        { id: 1, title: "The Rise of Computing", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
        { id: 2, title: "Great Pyramids", image: "https://images.unsplash.com/photo-1481489712339-f9c0734be5d5" },
        { id: 4, title: "Modern Education", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7" },
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