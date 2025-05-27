interface CachedContent {
  id: string;
  timestamp: number;
  type: 'wiki' | 'news';
}

// Reduced cache duration to prevent content staleness
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour instead of 3
const CACHE_KEY = 'lore_content_cache';

class ContentCacheService {
  private cache: CachedContent[] = [];

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
        this.cleanupExpired();
      }
    } catch (error) {
      console.error('Error loading content cache:', error);
      this.cache = [];
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving content cache:', error);
    }
  }

  private cleanupExpired() {
    const now = Date.now();
    this.cache = this.cache.filter(item => now - item.timestamp < CACHE_DURATION);
    this.saveCache();
  }

  public addToCache(id: string, type: 'wiki' | 'news') {
    this.cleanupExpired();
    
    // Remove if already exists
    this.cache = this.cache.filter(item => item.id !== id);
    
    // Add new entry
    this.cache.push({
      id,
      timestamp: Date.now(),
      type
    });

    // Keep only recent 100 items to prevent unlimited growth (was 200)
    // This encourages more content cycling
    if (this.cache.length > 100) {
      this.cache = this.cache.slice(-100);
    }

    this.saveCache();
  }

  public isInCache(id: string): boolean {
    this.cleanupExpired();
    return this.cache.some(item => item.id === id);
  }

  public filterUncached<T extends { id: number | string }>(items: T[]): T[] {
    this.cleanupExpired();
    return items.filter(item => !this.isInCache(String(item.id)));
  }

  public clearCache() {
    this.cache = [];
    this.saveCache();
  }
}

export const contentCache = new ContentCacheService();
