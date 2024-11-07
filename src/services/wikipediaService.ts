const getPageViews = async (title: string): Promise<number> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    };

    const response = await fetch(
      `${PAGEVIEWS_API_BASE}/${encodeURIComponent(title)}/daily/${formatDate(startDate)}/${formatDate(endDate)}`
    );
    const data = await response.json();
    
    // Sum up all daily views
    const totalViews = data.items.reduce((sum: number, item: any) => sum + item.views, 0);
    return totalViews;
  } catch (error) {
    console.error("Failed to fetch pageviews", error);
    return 0; // Return 0 if there's an error
  }
};