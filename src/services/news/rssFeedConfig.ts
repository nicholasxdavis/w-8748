
export interface RSSFeed {
  name: string;
  url: string;
  category: string;
}

export const RSS_FEEDS: RSSFeed[] = [
  {
    name: 'BBC',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    category: 'general'
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    category: 'general'
  },
  {
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: 'business'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology'
  },
  {
    name: 'NPR',
    url: 'https://feeds.npr.org/1001/rss.xml',
    category: 'general'
  }
];
