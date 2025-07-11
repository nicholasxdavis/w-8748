
import { motion } from "framer-motion";
import { Calendar, Globe, ExternalLink, Lightbulb, Quote, TrendingUp, Cloud, Thermometer, DollarSign, History, Camera } from "lucide-react";
import { isNewsArticle, isFactArticle, isQuoteArticle, isStockArticle, isWeatherArticle, isHistoryArticle, isFeaturedPictureArticle } from "../../services/contentService";
import { formatNewsDate } from "../../utils/articleHelpers";

interface ArticleContentProps {
  article: any;
  displayedText: string;
  progress: number;
  currentIndex: number;
  index: number;
  isVisible: boolean;
  onWikipediaRedirect: () => void;
}

const ArticleContent = ({
  article,
  displayedText,
  currentIndex,
  index,
  isVisible,
  onWikipediaRedirect
}: ArticleContentProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: isVisible && currentIndex === index ? 1 : 0, y: isVisible && currentIndex === index ? 0 : 30 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="relative z-10 text-white p-4 sm:p-6 max-w-4xl mx-auto h-full flex flex-col justify-center items-center"
  >
    <div className="w-[800px] max-sm:w-[350px] max-w-none mx-auto bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-12 border border-white/10 space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8 min-h-[calc(0vh+30px)] lg:min-h-0">
      <div className="flex items-start justify-center">
        <h1 className="text-lg sm:text-xl lg:text-3xl xl:text-4xl font-bold leading-tight drop-shadow-lg text-center break-words hyphens-auto max-w-full">
          {article?.title || 'Loading...'}
        </h1>
      </div>
      
      {/* Stock cards */}
      {article && isStockArticle(article) && article.stocks && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {article.stocks.slice(0, 6).map((stock: any, idx: number) => (
            <div key={idx} className="bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">{stock.symbol}</span>
                <span className={`text-xs px-2 py-1 rounded ${stock.change >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-white/70 mb-1">{stock.name}</p>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">${stock.price}</span>
                <span className="text-xs text-white/60">{stock.marketCap}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weather cards */}
      {article && isWeatherArticle(article) && article.cities && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {article.cities.slice(0, 6).map((city: any, idx: number) => (
            <div key={idx} className="bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">{city.name}</span>
                <span className="text-lg font-bold text-blue-300">{city.temperature}°C</span>
              </div>
              <p className="text-xs text-white/70 mb-1">{city.country}</p>
              <div className="flex justify-between items-end text-xs">
                <span className="text-white/80">{city.condition}</span>
                <span className="text-white/60">{city.humidity}% humidity</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historical events list */}
      {article && isHistoryArticle(article) && article.events && (
        <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-2 mb-4">
          {article.events.slice(0, 5).map((event: any, idx: number) => (
            <div key={idx} className="bg-black/30 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 font-bold">{event.year}</span>
                {event.category && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                    {event.category}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/90">{event.description}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="max-h-48 sm:max-h-64 lg:max-h-96 xl:max-h-[500px] overflow-y-auto scrollbar-hide">
        <p className="text-xs sm:text-sm lg:text-base xl:text-lg leading-relaxed opacity-95 break-words hyphens-auto text-center max-w-full">
          {article?.content || 'Loading content...'}
        </p>
      </div>
      
      <div className="flex items-center justify-center flex-wrap gap-2 text-xs lg:text-sm xl:text-base text-white/80">
        {article && isNewsArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate max-w-20">{article.source || 'Unknown'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">{article.publishedAt ? formatNewsDate(article.publishedAt) : 'Recent'}</span>
            </div>
            <span>•</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (article.url) {
                  window.open(article.url, '_blank', 'noopener,noreferrer');
                }
              }} 
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm">Read Full</span>
            </button>
          </>
        ) : article && isFactArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">Scientific Fact</span>
            </div>
            <span>•</span>
            <span className="truncate capitalize">{article.category || 'Science'}</span>
            {article.source && (
              <>
                <span>•</span>
                <span className="truncate text-blue-300">{article.source}</span>
              </>
            )}
          </>
        ) : article && isQuoteArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <Quote className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">Inspirational Quote</span>
            </div>
            <span>•</span>
            <span className="truncate">{article.author}</span>
            <span>•</span>
            <span className="truncate capitalize">{article.category || 'Wisdom'}</span>
          </>
        ) : article && isStockArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">Market Data</span>
            </div>
            <span>•</span>
            <span className="truncate">Live Prices</span>
            <span>•</span>
            <span className="truncate">Real-time Updates</span>
          </>
        ) : article && isWeatherArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <Cloud className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">Global Weather</span>
            </div>
            <span>•</span>
            <span className="truncate">Live Data</span>
            <span>•</span>
            <span className="truncate">Multiple Cities</span>
          </>
        ) : article && isHistoryArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <History className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">This Day in History</span>
            </div>
            <span>•</span>
            <span className="truncate">{article.date}</span>
            <span>•</span>
            <span className="truncate">{article.events?.length || 0} Events</span>
          </>
        ) : article && isFeaturedPictureArticle(article) ? (
          <>
            <div className="flex items-center gap-1">
              <Camera className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate">Featured Picture</span>
            </div>
            <span>•</span>
            <span className="truncate">{article.photographer || 'Unknown'}</span>
            <span>•</span>
            <span className="truncate">{article.date}</span>
          </>
        ) : article ? (
          <>
            <span className="truncate">{article.readTime || 5} min read</span>
            <span>•</span>
            <span className="truncate">{article.views?.toLocaleString() || '0'} views</span>
            <span>•</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onWikipediaRedirect();
              }} 
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm">Wikipedia</span>
            </button>
          </>
        ) : null}
      </div>
    </div>
  </motion.div>
);

export default ArticleContent;
