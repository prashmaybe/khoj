export interface TabState {
  id: string;
  url: string;
  title: string;
  isLoading: boolean;
  isLoaded: boolean;
  isSuspended: boolean;
  lastAccessed: number;
  memoryUsage: number;
  priority: 'high' | 'medium' | 'low';
}

export interface LoadingStrategy {
  name: string;
  threshold: number;
  priority: number;
  condition: (tab: TabState) => boolean;
}

export interface MemoryThresholds {
  maxTabs: number;
  maxMemoryUsage: number;
  suspensionThreshold: number;
  recoveryThreshold: number;
}

class LazyLoadingService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private readonly DEFAULT_LOADING_STRATEGIES: LoadingStrategy[] = [
    {
      name: 'active-tab',
      threshold: 1,
      priority: 1,
      condition: (tab) => tab.isLoading && !tab.isSuspended
    },
    {
      name: 'visible-tab',
      threshold: 2,
      priority: 2,
      condition: (tab) => !tab.isSuspended && tab.priority !== 'low'
    },
    {
      name: 'background-tab',
      threshold: 5,
      priority: 3,
      condition: (tab) => !tab.isSuspended && tab.priority === 'low'
    },
    {
      name: 'suspended-tab',
      threshold: 10,
      priority: 4,
      condition: (tab) => tab.isSuspended
    }
  ];

  private readonly DEFAULT_THRESHOLDS: MemoryThresholds = {
    maxTabs: 10,
    maxMemoryUsage: 512 * 1024 * 1024, // 512MB
    suspensionThreshold: 256 * 1024 * 1024, // 256MB
    recoveryThreshold: 128 * 1024 * 1024, // 128MB
  };

  private tabStates: Map<string, TabState> = new Map();
  private loadingQueue: string[] = [];
  private memoryMonitor: number | null = null;
  private isMonitoring = false;

  // Initialize tab state
  initializeTab(tabId: string, url: string, title: string = 'New Tab'): TabState {
    const tabState: TabState = {
      id: tabId,
      url,
      title,
      isLoading: false,
      isLoaded: false,
      isSuspended: false,
      lastAccessed: Date.now(),
      memoryUsage: 0,
      priority: this.calculateTabPriority(url)
    };

    this.tabStates.set(tabId, tabState);
    this.saveTabStates();
    return tabState;
  }

  // Calculate tab priority based on URL patterns
  private calculateTabPriority(url: string): 'high' | 'medium' | 'low' {
    if (!url) return 'low';

    // High priority: search engines, social media, email
    const highPriorityPatterns = [
      /google\.com/,
      /facebook\.com/,
      /twitter\.com/,
      /linkedin\.com/,
      /gmail\.com/,
      /outlook\.com/,
      /github\.com/,
      /stackoverflow\.com/
    ];

    // Medium priority: work-related sites, news
    const mediumPriorityPatterns = [
      /reddit\.com/,
      /youtube\.com/,
      /wikipedia\.org/,
      /medium\.com/,
      /dev\.to/,
      /producthunt\.com/
    ];

    if (highPriorityPatterns.some(pattern => pattern.test(url))) {
      return 'high';
    } else if (mediumPriorityPatterns.some(pattern => pattern.test(url))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Update tab state
  updateTabState(tabId: string, updates: Partial<TabState>): TabState | null {
    const currentState = this.tabStates.get(tabId);
    if (!currentState) return null;

    const updatedState: TabState = {
      ...currentState,
      ...updates,
      lastAccessed: Date.now()
    };

    this.tabStates.set(tabId, updatedState);
    this.saveTabStates();
    return updatedState;
  }

  // Get tab state
  getTabState(tabId: string): TabState | null {
    return this.tabStates.get(tabId) || null;
  }

  // Get all tab states
  getAllTabStates(): TabState[] {
    return Array.from(this.tabStates.values());
  }

  // Start loading tab content
  startLoading(tabId: string): boolean {
    const tabState = this.tabStates.get(tabId);
    if (!tabState) return false;

    if (tabState.isSuspended) {
      this.resumeTab(tabId);
    }

    this.updateTabState(tabId, {
      isLoading: true,
      isLoaded: false
    });

    this.addToLoadingQueue(tabId);
    return true;
  }

  // Complete loading
  completeLoading(tabId: string, memoryUsage: number = 0): void {
    this.updateTabState(tabId, {
      isLoading: false,
      isLoaded: true,
      memoryUsage
    });

    this.removeFromLoadingQueue(tabId);
    this.checkMemoryPressure();
  }

  // Suspend tab for memory management
  suspendTab(tabId: string): boolean {
    const tabState = this.tabStates.get(tabId);
    if (!tabState || tabState.isSuspended || tabState.priority === 'high') {
      return false;
    }

    this.updateTabState(tabId, {
      isSuspended: true,
      isLoading: false
    });

    this.saveTabStates();
    return true;
  }

  // Resume suspended tab
  resumeTab(tabId: string): boolean {
    const tabState = this.tabStates.get(tabId);
    if (!tabState || !tabState.isSuspended) return false;

    this.updateTabState(tabId, {
      isSuspended: false,
      isLoading: true
    });

    this.addToLoadingQueue(tabId);
    return true;
  }

  // Get loading queue
  getLoadingQueue(): string[] {
    return [...this.loadingQueue];
  }

  // Add to loading queue
  private addToLoadingQueue(tabId: string): void {
    if (this.loadingQueue.indexOf(tabId) === -1) {
      this.loadingQueue.push(tabId);
    }
  }

  // Remove from loading queue
  private removeFromLoadingQueue(tabId: string): void {
    const index = this.loadingQueue.indexOf(tabId);
    if (index > -1) {
      this.loadingQueue.splice(index, 1);
    }
  }

  // Get next tab to load based on strategy
  getNextTabToLoad(): string | null {
    const availableStrategies = this.DEFAULT_LOADING_STRATEGIES.filter(strategy => {
      const matchingTabs = Array.from(this.tabStates.values()).filter(strategy.condition);
      return matchingTabs.length <= strategy.threshold;
    });

    if (availableStrategies.length === 0) return null;

    const bestStrategy = availableStrategies.sort((a, b) => a.priority - b.priority)[0];
    const matchingTabs = Array.from(this.tabStates.values()).filter(bestStrategy.condition);
    
    if (matchingTabs.length === 0) return null;

    // Return the most recently accessed tab
    return matchingTabs
      .sort((a, b) => b.lastAccessed - a.lastAccessed)[0]
      .id;
  }

  // Check memory pressure and take action
  checkMemoryPressure(): void {
    const tabStates = Array.from(this.tabStates.values());
    const totalMemoryUsage = tabStates.reduce((sum, tab) => sum + tab.memoryUsage, 0);
    const thresholds = this.getMemoryThresholds();

    // If memory usage is high, suspend low priority tabs
    if (totalMemoryUsage > thresholds.suspensionThreshold) {
      const lowPriorityTabs = tabStates
        .filter(tab => tab.priority === 'low' && !tab.isSuspended)
        .sort((a, b) => a.lastAccessed - b.lastAccessed);

      // Suspend oldest low priority tabs
      const tabsToSuspend = lowPriorityTabs.slice(0, Math.ceil(lowPriorityTabs.length / 2));
      tabsToSuspend.forEach(tab => this.suspendTab(tab.id));
    }

    // If memory is critical, suspend more tabs
    if (totalMemoryUsage > thresholds.maxMemoryUsage) {
      const mediumPriorityTabs = tabStates
        .filter(tab => tab.priority === 'medium' && !tab.isSuspended)
        .sort((a, b) => a.lastAccessed - b.lastAccessed);

      const tabsToSuspend = mediumPriorityTabs.slice(0, Math.ceil(mediumPriorityTabs.length / 2));
      tabsToSuspend.forEach(tab => this.suspendTab(tab.id));
    }
  }

  // Get memory thresholds
  getMemoryThresholds(): MemoryThresholds {
    if (!this.isClient()) return this.DEFAULT_THRESHOLDS;

    try {
      const stored = localStorage.getItem('khoj_memory_thresholds');
      return stored ? JSON.parse(stored) : this.DEFAULT_THRESHOLDS;
    } catch (error) {
      console.error('Error loading memory thresholds:', error);
      return this.DEFAULT_THRESHOLDS;
    }
  }

  // Set memory thresholds
  setMemoryThresholds(thresholds: Partial<MemoryThresholds>): void {
    if (!this.isClient()) return;

    try {
      const currentThresholds = this.getMemoryThresholds();
      const updatedThresholds = { ...currentThresholds, ...thresholds };
      localStorage.setItem('khoj_memory_thresholds', JSON.stringify(updatedThresholds));
    } catch (error) {
      console.error('Error saving memory thresholds:', error);
    }
  }

  // Get memory usage statistics
  getMemoryStats(): {
    totalTabs: number;
    activeTabs: number;
    suspendedTabs: number;
    totalMemoryUsage: number;
    averageMemoryUsage: number;
  } {
    const tabStates = Array.from(this.tabStates.values());
    const activeTabs = tabStates.filter(tab => !tab.isSuspended);
    const suspendedTabs = tabStates.filter(tab => tab.isSuspended);
    const totalMemoryUsage = tabStates.reduce((sum, tab) => sum + tab.memoryUsage, 0);
    const averageMemoryUsage = tabStates.length > 0 ? totalMemoryUsage / tabStates.length : 0;

    return {
      totalTabs: tabStates.length,
      activeTabs: activeTabs.length,
      suspendedTabs: suspendedTabs.length,
      totalMemoryUsage,
      averageMemoryUsage
    };
  }

  // Start memory monitoring
  startMemoryMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.memoryMonitor = (setInterval as any)(() => {
      this.checkMemoryPressure();
    }, 30000) as any; // Check every 30 seconds
  }

  // Stop memory monitoring
  stopMemoryMonitoring(): void {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = null;
    }
    this.isMonitoring = false;
  }

  // Optimize memory usage
  optimizeMemory(): void {
    const tabStates = Array.from(this.tabStates.values());
    
    // Sort tabs by last accessed time (oldest first)
    const sortedTabs = tabStates.sort((a, b) => a.lastAccessed - b.lastAccessed);
    
    // Keep only the most recently accessed tabs active
    const maxActiveTabs = this.getMemoryThresholds().maxTabs;
    const tabsToKeep = sortedTabs.slice(-maxActiveTabs);
    const tabsToSuspend = sortedTabs.slice(0, -maxActiveTabs);
    
    // Suspend older tabs
    tabsToSuspend.forEach(tab => {
      if (!tab.isSuspended && tab.priority !== 'high') {
        this.suspendTab(tab.id);
      }
    });

    // Resume recently accessed tabs
    tabsToKeep.forEach(tab => {
      if (tab.isSuspended) {
        this.resumeTab(tab.id);
      }
    });
  }

  // Save tab states to localStorage
  private saveTabStates(): void {
    if (!this.isClient()) return;

    try {
      const states = Array.from(this.tabStates.entries());
      localStorage.setItem('khoj_tab_states', JSON.stringify(states));
    } catch (error) {
      console.error('Error saving tab states:', error);
    }
  }

  // Load tab states from localStorage
  loadTabStates(): void {
    if (!this.isClient()) return;

    try {
      const stored = localStorage.getItem('khoj_tab_states');
      if (stored) {
        const states = JSON.parse(stored);
        this.tabStates = new Map(states);
      }
    } catch (error) {
      console.error('Error loading tab states:', error);
    }
  }

  // Clear tab states
  clearTabStates(): void {
    this.tabStates.clear();
    this.loadingQueue = [];
    
    if (this.isClient()) {
      try {
        localStorage.removeItem('khoj_tab_states');
      } catch (error) {
        console.error('Error clearing tab states:', error);
      }
    }
  }

  // Remove tab state
  removeTabState(tabId: string): void {
    this.tabStates.delete(tabId);
    this.removeFromLoadingQueue(tabId);
    this.saveTabStates();
  }

  // Get performance metrics
  getPerformanceMetrics(): {
    averageLoadTime: number;
    memoryEfficiency: number;
    tabUtilization: number;
  } {
    const tabStates = Array.from(this.tabStates.values());
    const loadedTabs = tabStates.filter(tab => tab.isLoaded);
    const totalMemoryUsage = tabStates.reduce((sum, tab) => sum + tab.memoryUsage, 0);
    
    // Mock average load time calculation
    const averageLoadTime = loadedTabs.length > 0 ? 2000 : 0; // 2 seconds average
    
    // Memory efficiency (lower is better)
    const memoryEfficiency = totalMemoryUsage > 0 ? (1 - (totalMemoryUsage / (512 * 1024 * 1024))) * 100 : 100;
    
    // Tab utilization (percentage of tabs that are actively loaded)
    const tabUtilization = tabStates.length > 0 ? (loadedTabs.length / tabStates.length) * 100 : 0;

    return {
      averageLoadTime,
      memoryEfficiency,
      tabUtilization
    };
  }

  // Predict memory usage for new tab
  predictMemoryUsage(url: string): number {
    // Base memory usage estimation
    const baseUsage = 50 * 1024 * 1024; // 50MB base
    
    // Add extra based on content type
    if (url.includes('youtube.com') || url.includes('vimeo.com')) {
      return baseUsage * 2; // Video content uses more memory
    } else if (url.includes('facebook.com') || url.includes('instagram.com')) {
      return baseUsage * 1.5; // Social media
    } else if (url.includes('github.com') || url.includes('stackoverflow.com')) {
      return baseUsage * 1.2; // Code repositories
    }
    
    return baseUsage;
  }

  // Get recommended actions
  getRecommendedActions(): Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }> {
    const stats = this.getMemoryStats();
    const actions = [];

    if (stats.totalMemoryUsage > this.getMemoryThresholds().suspensionThreshold) {
      actions.push({
        action: 'suspend-low-priority-tabs',
        priority: 'high' as const,
        description: 'Suspend low priority tabs to free memory'
      });
    }

    if (stats.suspendedTabs > 5) {
      actions.push({
        action: 'resume-recent-tabs',
        priority: 'medium' as const,
        description: 'Resume recently used suspended tabs'
      });
    }

    if (stats.averageMemoryUsage > 100 * 1024 * 1024) {
      actions.push({
        action: 'optimize-memory',
        priority: 'high' as const,
        description: 'Optimize memory usage by suspending inactive tabs'
      });
    }

    return actions;
  }

  // Cleanup old tab states
  cleanupOldStates(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const statesToRemove: string[] = [];

    this.tabStates.forEach((state, id) => {
      if (now - state.lastAccessed > maxAge) {
        statesToRemove.push(id);
      }
    });

    statesToRemove.forEach(id => this.removeTabState(id));
  }
}

export const lazyLoadingService = new LazyLoadingService();
