export interface SearchEngine {
  id: string;
  name: string;
  baseUrl: string;
  searchPath: string;
  icon: string;
  description: string;
  isDefault?: boolean;
  queryParams?: Record<string, string>;
}

export interface CustomSearchEngine {
  id: string;
  name: string;
  baseUrl: string;
  searchPath: string;
  icon: string;
  description: string;
  queryParams?: Record<string, string>;
}

class SearchEngineService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private readonly DEFAULT_ENGINES: SearchEngine[] = [
    {
      id: 'google',
      name: 'Google',
      baseUrl: 'https://www.google.com',
      searchPath: '/search',
      icon: '🔍',
      description: 'The world\'s most popular search engine',
      isDefault: true,
      queryParams: {
        q: '{query}'
      }
    },
    {
      id: 'duckduckgo',
      name: 'DuckDuckGo',
      baseUrl: 'https://duckduckgo.com',
      searchPath: '/',
      icon: '🦆',
      description: 'Privacy-focused search engine that doesn\'t track you',
      queryParams: {
        q: '{query}'
      }
    },
    {
      id: 'bing',
      name: 'Bing',
      baseUrl: 'https://www.bing.com',
      searchPath: '/search',
      icon: '🔷',
      description: 'Microsoft\'s search engine with AI-powered results',
      queryParams: {
        q: '{query}'
      }
    },
    {
      id: 'brave',
      name: 'Brave Search',
      baseUrl: 'https://search.brave.com',
      searchPath: '/search',
      icon: '🦁',
      description: 'Privacy-respecting search engine from Brave',
      queryParams: {
        q: '{query}'
      }
    },
    {
      id: 'yahoo',
      name: 'Yahoo',
      baseUrl: 'https://search.yahoo.com',
      searchPath: '/search',
      icon: '📧',
      description: 'One of the original web search engines',
      queryParams: {
        p: '{query}'
      }
    },
    {
      id: 'ecosia',
      name: 'Ecosia',
      baseUrl: 'https://www.ecosia.org',
      searchPath: '/search',
      icon: '🌿',
      description: 'Privacy-first search engine that plants trees',
      queryParams: {
        q: '{query}'
      }
    }
  ];

  // Get all available search engines
  getAvailableEngines(): SearchEngine[] {
    return this.DEFAULT_ENGINES;
  }

  // Get current search engine
  getCurrentEngine(): SearchEngine {
    if (!this.isClient()) return this.DEFAULT_ENGINES[0]; // Default to Google

    try {
      const stored = localStorage.getItem('khoj_search_engine');
      const engineId = stored || this.DEFAULT_ENGINES[0].id;
      const engine = this.DEFAULT_ENGINES.find(e => e.id === engineId);
      return engine || this.DEFAULT_ENGINES[0];
    } catch (error) {
      console.error('Error loading search engine:', error);
      return this.DEFAULT_ENGINES[0];
    }
  }

  // Set current search engine
  setCurrentEngine(engineId: string): void {
    if (!this.isClient()) return;

    try {
      localStorage.setItem('khoj_search_engine', engineId);
    } catch (error) {
      console.error('Error saving search engine:', error);
    }
  }

  // Get search engine by ID
  getEngineById(id: string): SearchEngine | null {
    return this.DEFAULT_ENGINES.find(engine => engine.id === id) || null;
  }

  // Add custom search engine
  addCustomEngine(engine: CustomSearchEngine): boolean {
    if (!this.isClient()) return false;

    try {
      const customEngines = this.getCustomEngines();
      
      // Check if engine already exists
      if (customEngines.some(e => e.name === engine.name)) {
        return false;
      }

      customEngines.push({
        ...engine,
        id: `custom_${Date.now().toString()}`,
      });

      localStorage.setItem('khoj_custom_search_engines', JSON.stringify(customEngines));
      return true;
    } catch (error) {
      console.error('Error adding custom search engine:', error);
      return false;
    }
  }

  // Get custom search engines
  getCustomEngines(): CustomSearchEngine[] {
    if (!this.isClient()) return [];

    try {
      const stored = localStorage.getItem('khoj_custom_search_engines');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom search engines:', error);
      return [];
    }
  }

  // Remove custom search engine
  removeCustomEngine(engineId: string): boolean {
    if (!this.isClient()) return false;

    try {
      const customEngines = this.getCustomEngines();
      const filteredEngines = customEngines.filter(e => e.id !== engineId);
      localStorage.setItem('khoj_custom_search_engines', JSON.stringify(filteredEngines));
      return true;
    } catch (error) {
      console.error('Error removing custom search engine:', error);
      return false;
    }
  }

  // Get all engines (default + custom)
  getAllEngines(): SearchEngine[] {
    const defaultEngines = this.DEFAULT_ENGINES;
    const customEngines = this.getCustomEngines();
    
    // Convert custom engines to SearchEngine format
    const customSearchEngines: SearchEngine[] = customEngines.map(engine => ({
      ...engine,
      id: engine.id,
      icon: engine.icon,
    }));

    return [...defaultEngines, ...customSearchEngines];
  }

  // Build search URL
  buildSearchUrl(engine: SearchEngine, query: string): string {
    if (!query.trim()) return engine.baseUrl;

    try {
      let searchUrl = `${engine.baseUrl}${engine.searchPath}`;
      
      if (engine.queryParams) {
        const searchParams = new URLSearchParams();
        
        Object.entries(engine.queryParams).forEach(([key, value]) => {
          const paramValue = value.replace('{query}', encodeURIComponent(query));
          searchParams.set(key, paramValue);
        });

        const paramString = searchParams.toString();
        if (paramString) {
          searchUrl += `?${paramString}`;
        }
      } else {
        // Default behavior: append query as parameter
        searchUrl += `?q=${encodeURIComponent(query)}`;
      }

      return searchUrl;
    } catch (error) {
      console.error('Error building search URL:', error);
      return `${engine.baseUrl}${engine.searchPath}?q=${encodeURIComponent(query)}`;
    }
  }

  // Search with current engine
  search(query: string): string {
    const currentEngine = this.getCurrentEngine();
    return this.buildSearchUrl(currentEngine, query);
  }

  // Search with specific engine
  searchWithEngine(engineId: string, query: string): string {
    const engine = this.getEngineById(engineId);
    if (!engine) {
      throw new Error(`Search engine with ID "${engineId}" not found`);
    }
    return this.buildSearchUrl(engine, query);
  }

  // Validate custom engine
  validateCustomEngine(engine: CustomSearchEngine): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!engine.name.trim()) {
      errors.push('Engine name is required');
    }

    if (!engine.baseUrl.trim()) {
      errors.push('Base URL is required');
    } else {
      try {
        new URL(engine.baseUrl);
      } catch {
        errors.push('Base URL is not a valid URL');
      }
    }

    if (!engine.searchPath.trim()) {
      errors.push('Search path is required');
    }

    // Check if engine already exists
    const customEngines = this.getCustomEngines();
    if (customEngines.some(e => e.name === engine.name)) {
      errors.push('An engine with this name already exists');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get search suggestions
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    // Simple implementation - in a real app, this would call search APIs
    const suggestions: string[] = [];
    
    if (query.length > 2) {
      const commonSuggestions = [
        `${query} tutorial`,
        `${query} guide`,
        `${query} how to`,
        `${query} best practices`,
        `${query} examples`
      ];
      
      suggestions.push(...commonSuggestions.slice(0, limit));
    }

    return suggestions;
  }

  // Get search history
  getSearchHistory(limit: number = 10): Array<{ query: string; timestamp: string }> {
    if (!this.isClient()) return [];

    try {
      const history = JSON.parse(localStorage.getItem('khoj_search_history') || '[]');
      return history
        .sort((a: { query: string; timestamp: string }, b: { query: string; timestamp: string }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  // Add to search history
  addToSearchHistory(query: string): void {
    if (!this.isClient() || !query.trim()) return;

    try {
      const history = JSON.parse(localStorage.getItem('khoj_search_history') || '[]');
      
      // Remove existing entry and add to front
      const filteredHistory = history.filter((item: any) => item.query !== query);
      filteredHistory.unshift({
        query,
        timestamp: new Date().toISOString()
      });

      // Keep only last 100 searches
      const limitedHistory = filteredHistory.slice(0, 100);
      localStorage.setItem('khoj_search_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  // Clear search history
  clearSearchHistory(): void {
    if (!this.isClient()) return;

    try {
      localStorage.removeItem('khoj_search_history');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Get search statistics
  getSearchStats(): { totalSearches: number; mostUsedEngine: string; lastSearch: string } {
    if (!this.isClient()) {
      return {
        totalSearches: 0,
        mostUsedEngine: 'google',
        lastSearch: ''
      };
    }

    try {
      const history = JSON.parse(localStorage.getItem('khoj_search_history') || '[]');
      const engineCounts: Record<string, number> = {};
      
      history.forEach((item: { query: string; timestamp: string }) => {
        // Extract engine from search URL if possible
        const engine = this.detectEngineFromUrl(item.query);
        if (engine) {
          engineCounts[engine] = (engineCounts[engine] || 0) + 1;
        }
      });

      const mostUsedEngine = Object.entries(engineCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'google';

      return {
        totalSearches: history.length,
        mostUsedEngine,
        lastSearch: history[0]?.query || ''
      };
    } catch (error) {
      console.error('Error getting search stats:', error);
      return {
        totalSearches: 0,
        mostUsedEngine: 'google',
        lastSearch: ''
      };
    }
  }

  // Detect engine from URL
  private detectEngineFromUrl(url: string): string | null {
    const engines = this.DEFAULT_ENGINES;
    
    for (const engine of engines) {
      if (url.startsWith(engine.baseUrl)) {
        return engine.id;
      }
    }
    
    return null;
  }

  // Reset to default engine
  resetToDefault(): void {
    this.setCurrentEngine(this.DEFAULT_ENGINES[0].id);
  }
}

export const searchEngineService = new SearchEngineService();
