
// Utility function to generate a valid UUID from any string input
export const generateUUIDFromString = (str: string): string => {
  // Handle empty or null input with a fallback
  if (!str || str.trim() === '') {
    str = `fallback-${Date.now()}-${Math.random()}`;
  }
  
  // Create a simple hash-based UUID v4 format
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and ensure we have enough characters
  const positiveHash = Math.abs(hash).toString(16).padStart(12, '0');
  const randomSuffix = Math.random().toString(16).slice(2, 14).padStart(12, '0');
  const combined = (positiveHash + randomSuffix).padStart(32, '0');
  
  // Format as proper UUID v4
  return `${combined.slice(0, 8)}-${combined.slice(8, 12)}-4${combined.slice(13, 16)}-a${combined.slice(17, 20)}-${combined.slice(20, 32)}`;
};
