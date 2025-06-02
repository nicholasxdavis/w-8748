
export const categoryMap: { [key: string]: string[] } = {
  'Technology': ['Technology', 'Computing', 'Software', 'Internet', 'Electronics', 'Programming'],
  'Science': ['Science', 'Physics', 'Chemistry', 'Biology', 'Medicine', 'Research'],
  'Sports': ['Sports', 'Football', 'Basketball', 'Soccer', 'Olympics', 'Athletes'],
  'Movies': ['Films', 'Cinema', 'Actors', 'Directors', 'Hollywood', 'Entertainment'],
  'Music': ['Music', 'Musicians', 'Albums', 'Songs', 'Bands', 'Artists'],
  'Games': ['Video games', 'Gaming', 'Nintendo', 'PlayStation', 'Xbox', 'Esports'],
  'Travel': ['Travel', 'Tourism', 'Countries', 'Cities', 'Geography', 'Culture'],
  'Food': ['Food', 'Cooking', 'Cuisine', 'Restaurants', 'Recipes', 'Nutrition'],
  'History': ['History', 'Ancient history', 'World War', 'Historical figures', 'Archaeology'],
  'Art': ['Art', 'Painting', 'Sculpture', 'Artists', 'Museums', 'Design'],
  'Business': ['Business', 'Economics', 'Companies', 'Finance', 'Entrepreneurship', 'Markets'],
  'Health': ['Health', 'Medicine', 'Fitness', 'Nutrition', 'Healthcare', 'Wellness']
};

export const getWikipediaCategories = (userInterests: string[]): string[] => {
  const wikiCategories: string[] = [];
  userInterests.forEach(interest => {
    const mappedCategories = categoryMap[interest] || [interest];
    wikiCategories.push(...mappedCategories);
  });
  return wikiCategories;
};
