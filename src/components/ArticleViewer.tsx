const ArticleViewer = ({ article }) => {
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
          <div className="text-overlay">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-lg">{article.content}</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ArticleViewer;