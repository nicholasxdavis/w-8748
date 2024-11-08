const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php";
const PAGEVIEWS_API_BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents";

export const getPageViews = async (title: string): Promise<number> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');

    const response = await fetch(
      `${PAGEVIEWS_API_BASE}/${encodeURIComponent(title)}/daily/${formatDate(startDate)}/${formatDate(endDate)}`
    );
    
    if (!response.ok) {
      console.warn(`Failed to fetch pageviews for ${title}`);
      return 0;
    }

    const data = await response.json();
    return data.items?.reduce((sum: number, item: any) => sum + item.views, 0) || 0;
  } catch (error) {
    console.warn(`Failed to fetch pageviews for ${title}:`, error);
    return 0;
  }
};

export const fetchWikipediaContent = async (titles: string[]) => {
  const titlesString = titles.join("|");
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'extracts|pageimages|categories|links|images|info',
    titles: titlesString,
    exintro: '1',
    explaintext: '1',
    pithumbsize: '1000',
    imlimit: '5',
    inprop: 'protection'
  });

  const response = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch Wikipedia content');
  
  return response.json();
};