interface CachedContent {
  id: string;
  timestamp: number;
  type: 'wiki' | 'news';
}

const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours
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

    // Keep only recent 200 items to prevent unlimited growth
    if (this.cache.length > 200) {
      this.cache = this.cache.slice(-200);
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
