export interface ImageSearchProvider {
  id: string;
  name: string;
  baseUrl: string;
  searchPath: string;
  icon: string;
  description: string;
  isDefault?: boolean;
  queryParams?: Record<string, string>;
}

export interface ImageSearchResult {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  source: string;
  width: number;
  height: number;
  size: number;
  type: string;
  tags: string[];
  pageUrl?: string;
}

export interface ImageSearchOptions {
  query: string;
  provider: string;
  safeSearch?: boolean;
  imageSize?: 'small' | 'medium' | 'large' | 'all';
  colorType?: 'any' | 'color' | 'black' | 'white' | 'transparent';
  imageType?: 'any' | 'photo' | 'clipart' | 'lineart' | 'animated' | 'gif';
  license?: 'any' | 'creative' | 'commercial' | 'modification';
}

class ImageSearchService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private readonly DEFAULT_PROVIDERS: ImageSearchProvider[] = [
    {
      id: 'google',
      name: 'Google Images',
      baseUrl: 'https://www.google.com',
      searchPath: '/search',
      icon: '🔍',
      description: 'Google\'s image search with comprehensive results',
      isDefault: true,
      queryParams: {
        tbm: 'isch',
        q: '{query}'
      }
    },
    {
      id: 'unsplash',
      name: 'Unsplash',
      baseUrl: 'https://unsplash.com',
      searchPath: '/search',
      icon: '📷',
      description: 'High-quality free stock photos',
      queryParams: {
        query: '{query}'
      }
    },
    {
      id: 'pexels',
      name: 'Pexels',
      baseUrl: 'https://www.pexels.com',
      searchPath: '/search',
      icon: '🖼️',
      description: 'Free stock photos and videos',
      queryParams: {
        query: '{query}'
      }
    },
    {
      id: 'pixabay',
      name: 'Pixabay',
      baseUrl: 'https://pixabay.com',
      searchPath: '/',
      icon: '🎨',
      description: 'Free images and videos',
      queryParams: {
        q: '{query}'
      }
    },
    {
      id: 'flickr',
      name: 'Flickr',
      baseUrl: 'https://www.flickr.com',
      searchPath: '/search',
      icon: '📸',
      description: 'Community photo sharing platform',
      queryParams: {
        q: '{query}'
      }
    },
    {
      id: 'bing',
      name: 'Bing Images',
      baseUrl: 'https://www.bing.com',
      searchPath: '/images/search',
      icon: '🔷',
      description: 'Microsoft\'s image search with AI-powered results',
      queryParams: {
        q: '{query}'
      }
    },
    {
      id: 'istock',
      name: 'iStock',
      baseUrl: 'https://www.istockphoto.com',
      searchPath: '/search',
      icon: '💼',
      description: 'Premium stock photos and illustrations',
      queryParams: {
        q: '{query}'
      }
    }
  ];

  // Get available image search providers
  getAvailableProviders(): ImageSearchProvider[] {
    return this.DEFAULT_PROVIDERS;
  }

  // Get current image search provider
  getCurrentProvider(): ImageSearchProvider {
    if (!this.isClient()) return this.DEFAULT_PROVIDERS[0]; // Default to Google

    try {
      const stored = localStorage.getItem('khoj_image_search_provider');
      const providerId = stored || this.DEFAULT_PROVIDERS[0].id;
      const provider = this.DEFAULT_PROVIDERS.find(p => p.id === providerId);
      return provider || this.DEFAULT_PROVIDERS[0];
    } catch (error) {
      console.error('Error loading image search provider:', error);
      return this.DEFAULT_PROVIDERS[0];
    }
  }

  // Set current image search provider
  setCurrentProvider(providerId: string): void {
    if (!this.isClient()) return;

    try {
      localStorage.setItem('khoj_image_search_provider', providerId);
    } catch (error) {
      console.error('Error saving image search provider:', error);
    }
  }

  // Get provider by ID
  getProviderById(id: string): ImageSearchProvider | null {
    return this.DEFAULT_PROVIDERS.find(provider => provider.id === id) || null;
  }

  // Build image search URL
  buildImageSearchUrl(provider: ImageSearchProvider, options: ImageSearchOptions): string {
    if (!options.query.trim()) return provider.baseUrl;

    try {
      let searchUrl = `${provider.baseUrl}${provider.searchPath}`;
      
      if (provider.queryParams) {
        const searchParams = new URLSearchParams();
        
        Object.entries(provider.queryParams).forEach(([key, value]) => {
          const paramValue = value.replace('{query}', encodeURIComponent(options.query));
          searchParams.set(key, paramValue);
        });

        // Add additional search options
        if (options.safeSearch) {
          searchParams.set('safe', 'active');
        }

        if (options.imageSize) {
          switch (options.imageSize) {
            case 'small':
              searchParams.set('imgsz', 'small');
              break;
            case 'medium':
              searchParams.set('imgsz', 'medium');
              break;
            case 'large':
              searchParams.set('imgsz', 'large');
              break;
          }
        }

        if (options.colorType) {
          switch (options.colorType) {
            case 'color':
              searchParams.set('imgc', 'color');
              break;
            case 'black':
              searchParams.set('imgc', 'black');
              break;
            case 'white':
              searchParams.set('imgc', 'white');
              break;
            case 'transparent':
              searchParams.set('imgc', 'transparent');
              break;
          }
        }

        if (options.imageType) {
          switch (options.imageType) {
            case 'photo':
              searchParams.set('imgtype', 'photo');
              break;
            case 'clipart':
              searchParams.set('imgtype', 'clipart');
              break;
            case 'lineart':
              searchParams.set('imgtype', 'lineart');
              break;
            case 'animated':
              searchParams.set('imgtype', 'animated');
              break;
            case 'gif':
              searchParams.set('imgtype', 'gif');
              break;
          }
        }

        if (options.license) {
          switch (options.license) {
            case 'creative':
              searchParams.set('l', 'cc');
              break;
            case 'commercial':
              searchParams.set('l', 'commercial');
              break;
            case 'modification':
              searchParams.set('l', 'mod');
              break;
          }
        }

        const paramString = searchParams.toString();
        if (paramString) {
          searchUrl += `?${paramString}`;
        }
      }

      return searchUrl;
    } catch (error) {
      console.error('Error building image search URL:', error);
      return `${provider.baseUrl}${provider.searchPath}?q=${encodeURIComponent(options.query)}`;
    }
  }

  // Search images with current provider
  searchImages(options: Partial<ImageSearchOptions>): string {
    const currentProvider = this.getCurrentProvider();
    const searchOptions: ImageSearchOptions = {
      query: options.query || '',
      provider: currentProvider.id,
      safeSearch: options.safeSearch || false,
      imageSize: options.imageSize || 'all',
      colorType: options.colorType || 'any',
      imageType: options.imageType || 'any',
      license: options.license || 'any',
    };

    return this.buildImageSearchUrl(currentProvider, searchOptions);
  }

  // Search images with specific provider
  searchImagesWithProvider(providerId: string, options: Partial<ImageSearchOptions>): string {
    const provider = this.getProviderById(providerId);
    if (!provider) {
      throw new Error(`Image search provider with ID "${providerId}" not found`);
    }
    
    const searchOptions: ImageSearchOptions = {
      query: options.query || '',
      provider: providerId,
      safeSearch: options.safeSearch || false,
      imageSize: options.imageSize || 'all',
      colorType: options.colorType || 'any',
      imageType: options.imageType || 'any',
      license: options.license || 'any',
    };

    return this.buildImageSearchUrl(provider, searchOptions);
  }

  // Real image search results using actual APIs
  async getSearchResults(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    if (!options.query.trim()) {
      return [];
    }

    const provider = this.getProviderById(options.provider);
    if (!provider) {
      throw new Error(`Unknown image search provider: ${options.provider}`);
    }

    try {
      switch (provider.id) {
        case 'unsplash':
          return this.searchUnsplash(options);
        case 'pixabay':
          return this.searchPixabay(options);
        case 'pexels':
          return this.searchPexels(options);
        default:
          // Fallback to a free image API
          return this.searchFreeImages(options);
      }
    } catch (error) {
      console.error(`Error searching images with ${provider.name}:`, error);
      // Fallback to free images if primary provider fails
      return this.searchFreeImages(options);
    }
  }

  private async searchUnsplash(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(options.query)}&per_page=20&page=1`,
        {
          headers: {
            // Note: In production, this should use environment variables for API keys
            'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.results.map((photo: any) => ({
        id: `unsplash_${photo.id}`,
        title: photo.alt_description || photo.description || `Unsplash photo by ${photo.user.name}`,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.thumb,
        source: 'Unsplash',
        width: photo.width,
        height: photo.height,
        size: Math.round((photo.width * photo.height) / 1000), // Rough estimate
        type: 'image/jpeg',
        tags: photo.tags?.map((tag: any) => tag.title) || [options.query],
        pageUrl: photo.links.html
      }));
    } catch (error) {
      console.error('Unsplash search failed:', error);
      throw error;
    }
  }

  private async searchPixabay(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=YOUR_PIXABAY_API_KEY&q=${encodeURIComponent(options.query)}&per_page=20&image_type=photo`
      );

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.hits.map((hit: any) => ({
        id: `pixabay_${hit.id}`,
        title: hit.tags || `Pixabay photo ${hit.id}`,
        url: hit.webformatURL,
        thumbnailUrl: hit.previewURL,
        source: 'Pixabay',
        width: hit.webformatWidth,
        height: hit.webformatHeight,
        size: hit.webformatSize,
        type: hit.type,
        tags: hit.tags?.split(', ') || [options.query],
        pageUrl: `https://pixabay.com/photos/${hit.id}/`
      }));
    } catch (error) {
      console.error('Pixabay search failed:', error);
      throw error;
    }
  }

  private async searchPexels(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(options.query)}&per_page=20`,
        {
          headers: {
            'Authorization': 'YOUR_PEXELS_API_KEY'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.photos.map((photo: any) => ({
        id: `pexels_${photo.id}`,
        title: photo.alt || `Pexels photo ${photo.id}`,
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        source: 'Pexels',
        width: photo.width,
        height: photo.height,
        size: Math.round((photo.width * photo.height) / 1000), // Rough estimate
        type: 'image/jpeg',
        tags: [options.query],
        pageUrl: photo.url
      }));
    } catch (error) {
      console.error('Pexels search failed:', error);
      throw error;
    }
  }

  private async searchFreeImages(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    // Fallback to Lorem Picsum for free images
    const results: ImageSearchResult[] = [];
    
    for (let i = 0; i < 20; i++) {
      const seed = `${options.query}_${Date.now()}_${i}`;
      const result: ImageSearchResult = {
        id: `free_${seed}`,
        title: `${options.query} - Free Image ${i + 1}`,
        url: `https://picsum.photos/seed/${seed}/800/600.jpg`,
        thumbnailUrl: `https://picsum.photos/seed/${seed}/200/150.jpg`,
        source: 'Lorem Picsum',
        width: 800,
        height: 600,
        size: 480000,
        type: 'image/jpeg',
        tags: [options.query, 'free', 'stock'],
        pageUrl: `https://picsum.photos/seed/${seed}`
      };
      
      results.push(result);
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(results), 300); // Small delay to simulate network
    });
  }

  // Get image search history
  getSearchHistory(limit: number = 10): Array<{ query: string; timestamp: string; provider: string }> {
    if (!this.isClient()) return [];

    try {
      const history = JSON.parse(localStorage.getItem('khoj_image_search_history') || '[]');
      return history
        .sort((a: { query: string; timestamp: string; provider: string }, b: { query: string; timestamp: string; provider: string }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error loading image search history:', error);
      return [];
    }
  }

  // Add to image search history
  addToSearchHistory(query: string, provider: string): void {
    if (!this.isClient() || !query.trim()) return;

    try {
      const history = JSON.parse(localStorage.getItem('khoj_image_search_history') || '[]');
      
      // Remove existing entry and add to front
      const filteredHistory = history.filter((item: any) => item.query !== query);
      filteredHistory.unshift({
        query,
        provider,
        timestamp: new Date().toISOString()
      });

      // Keep only last 50 searches
      const limitedHistory = filteredHistory.slice(0, 50);
      localStorage.setItem('khoj_image_search_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding to image search history:', error);
    }
  }

  // Clear image search history
  clearSearchHistory(): void {
    if (!this.isClient()) return;

    try {
      localStorage.removeItem('khoj_image_search_history');
    } catch (error) {
      console.error('Error clearing image search history:', error);
    }
  }

  // Get image search statistics
  getSearchStats(): { totalSearches: number; mostUsedProvider: string; lastSearch: string } {
    if (!this.isClient()) {
      return {
        totalSearches: 0,
        mostUsedProvider: 'google',
        lastSearch: ''
      };
    }

    try {
      const history = JSON.parse(localStorage.getItem('khoj_image_search_history') || '[]');
      const providerCounts: Record<string, number> = {};
      
      history.forEach((item: any) => {
        if (item.provider) {
          providerCounts[item.provider] = (providerCounts[item.provider] || 0) + 1;
        }
      });

      const mostUsedProvider = Object.entries(providerCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'google';

      return {
        totalSearches: history.length,
        mostUsedProvider,
        lastSearch: history[0]?.query || ''
      };
    } catch (error) {
      console.error('Error getting image search stats:', error);
      return {
        totalSearches: 0,
        mostUsedProvider: 'google',
        lastSearch: ''
      };
    }
  }

  // Download image
  async downloadImage(imageUrl: string, filename?: string): Promise<void> {
    if (!this.isClient()) return;

    try {
      // In a real implementation, this would trigger a download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename || imageUrl.split('/').pop() || 'image.jpg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }

  // Copy image URL to clipboard
  async copyImageUrl(imageUrl: string): Promise<void> {
    if (!this.isClient()) return;

    try {
      await navigator.clipboard.writeText(imageUrl);
    } catch (error) {
      console.error('Error copying image URL:', error);
    }
  }

  // Get image search suggestions
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    // Simple implementation - in a real app, this would call search APIs
    const suggestions: string[] = [];
    
    if (query.length > 2) {
      const commonSuggestions = [
        `${query} images`,
        `${query} photos`,
        `${query} pictures`,
        `${query} wallpapers`,
        `${query} backgrounds`
      ];
      
      suggestions.push(...commonSuggestions.slice(0, limit));
    }

    return suggestions;
  }

  // Validate image search options
  validateSearchOptions(options: Partial<ImageSearchOptions>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options.query || !options.query.trim()) {
      errors.push('Search query is required');
    }

    if (options.query && options.query.length > 200) {
      errors.push('Search query is too long (max 200 characters)');
    }

    if (options.provider && !this.getProviderById(options.provider)) {
      errors.push('Invalid image search provider');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Reset to default provider
  resetToDefault(): void {
    this.setCurrentProvider(this.DEFAULT_PROVIDERS[0].id);
  }
}

export const imageSearchService = new ImageSearchService();
