// Import searchSystems function - using dynamic import to handle JS module
declare const searchSystems: (keyword: string) => Promise<any[]>;

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'system' | 'equipment' | 'project' | 'vendor' | 'quote';
  category?: string;
  url?: string;
  metadata?: Record<string, any>;
  score?: number;
}

export interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  types?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  suggestions?: string[];
  facets?: Record<string, { value: string; count: number }[]>;
}

class SearchService {
  private static instance: SearchService;
  private searchHistory: string[] = [];
  private popularSearches: { term: string; count: number }[] = [];

  private constructor() {
    this.loadSearchHistory();
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Load search history from localStorage
  private loadSearchHistory(): void {
    try {
      const history = localStorage.getItem('search_history');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }

      const popular = localStorage.getItem('popular_searches');
      if (popular) {
        this.popularSearches = JSON.parse(popular);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }

  // Save search history to localStorage
  private saveSearchHistory(): void {
    try {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
      localStorage.setItem('popular_searches', JSON.stringify(this.popularSearches));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  // Add search term to history
  public addToHistory(term: string): void {
    if (!term.trim()) return;

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(t => t !== term);
    
    // Add to beginning
    this.searchHistory.unshift(term);
    
    // Keep only last 20 searches
    this.searchHistory = this.searchHistory.slice(0, 20);

    // Update popular searches
    const existing = this.popularSearches.find(p => p.term === term);
    if (existing) {
      existing.count++;
    } else {
      this.popularSearches.push({ term, count: 1 });
    }

    // Sort by count and keep top 10
    this.popularSearches.sort((a, b) => b.count - a.count);
    this.popularSearches = this.popularSearches.slice(0, 10);

    this.saveSearchHistory();
  }

  // Get search history
  public getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  // Get popular searches
  public getPopularSearches(): string[] {
    return this.popularSearches.map(p => p.term);
  }

  // Clear search history
  public clearHistory(): void {
    this.searchHistory = [];
    this.popularSearches = [];
    this.saveSearchHistory();
  }

  // Universal search across all content types
  public async search(options: SearchOptions): Promise<SearchResponse> {
    const { query, filters = {}, types = [], limit = 20, offset = 0 } = options;
    
    if (!query.trim()) {
      return {
        results: [],
        total: 0,
        suggestions: this.getSearchSuggestions(query),
      };
    }

    // Add to search history
    this.addToHistory(query);

    const results: SearchResult[] = [];
    let total = 0;

    try {
      // Search systems if no specific types or systems included
      if (types.length === 0 || types.includes('system')) {
        const systemResults = await this.searchSystems(query, filters);
        results.push(...systemResults);
        total += systemResults.length;
      }

      // Search equipment
      if (types.length === 0 || types.includes('equipment')) {
        const equipmentResults = await this.searchEquipment(query, filters);
        results.push(...equipmentResults);
        total += equipmentResults.length;
      }

      // Search projects
      if (types.length === 0 || types.includes('project')) {
        const projectResults = await this.searchProjects(query, filters);
        results.push(...projectResults);
        total += projectResults.length;
      }

      // Search vendors
      if (types.length === 0 || types.includes('vendor')) {
        const vendorResults = await this.searchVendors(query, filters);
        results.push(...vendorResults);
        total += vendorResults.length;
      }

      // Search quotes
      if (types.length === 0 || types.includes('quote')) {
        const quoteResults = await this.searchQuotes(query, filters);
        results.push(...quoteResults);
        total += quoteResults.length;
      }

      // Sort results by relevance score
      results.sort((a, b) => (b.score || 0) - (a.score || 0));

      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit);

      return {
        results: paginatedResults,
        total,
        suggestions: this.getSearchSuggestions(query),
        facets: this.generateFacets(results),
      };

    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        total: 0,
        suggestions: this.getSearchSuggestions(query),
      };
    }
  }

  // Search systems
  private async searchSystems(query: string, filters: Record<string, any>): Promise<SearchResult[]> {
    try {
      // Mock system data for now - in production this would call the actual API
      const mockSystems = [
        { id: '1', name: '웹 서버', description: '메인 웹 서버 시스템', type: 'server', status: 'online', location: '서울', ip: '192.168.1.10' },
        { id: '2', name: '데이터베이스 서버', description: 'PostgreSQL 데이터베이스', type: 'database', status: 'online', location: '서울', ip: '192.168.1.20' },
        { id: '3', name: '파일 서버', description: '파일 저장 서버', type: 'storage', status: 'maintenance', location: '부산', ip: '192.168.1.30' },
      ];

      const filtered = mockSystems.filter(system =>
        system.name.toLowerCase().includes(query.toLowerCase()) ||
        system.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return filtered.map((system: any) => ({
        id: `system-${system.id}`,
        title: system.name,
        description: system.description,
        type: 'system' as const,
        category: system.type,
        url: `/systems/${system.id}`,
        metadata: {
          status: system.status,
          location: system.location,
          ip: system.ip,
        },
        score: this.calculateRelevanceScore(query, system.name, system.description),
      }));
    } catch (error) {
      console.error('System search error:', error);
      return [];
    }
  }

  // Search equipment (mock implementation)
  private async searchEquipment(query: string, filters: Record<string, any>): Promise<SearchResult[]> {
    // This would typically call an equipment search API
    const mockEquipment = [
      { id: '1', name: '음향 시스템', description: '프리미엄 음향 장비', category: '음향/영상' },
      { id: '2', name: 'LED 스크린', description: '고해상도 LED 디스플레이', category: '음향/영상' },
      { id: '3', name: '무대 조명', description: '전문 무대 조명 시스템', category: '조명' },
    ];

    const filtered = mockEquipment.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(item => ({
      id: `equipment-${item.id}`,
      title: item.name,
      description: item.description,
      type: 'equipment' as const,
      category: item.category,
      url: `/equipment/${item.id}`,
      score: this.calculateRelevanceScore(query, item.name, item.description),
    }));
  }

  // Search projects (mock implementation)
  private async searchProjects(query: string, filters: Record<string, any>): Promise<SearchResult[]> {
    const mockProjects = [
      { id: '1', name: '2024 테크 컨퍼런스', description: '기술 컨퍼런스 프로젝트', status: '진행중' },
      { id: '2', name: '신제품 런칭 이벤트', description: '제품 출시 행사', status: '완료' },
    ];

    const filtered = mockProjects.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(item => ({
      id: `project-${item.id}`,
      title: item.name,
      description: item.description,
      type: 'project' as const,
      url: `/projects/${item.id}`,
      metadata: { status: item.status },
      score: this.calculateRelevanceScore(query, item.name, item.description),
    }));
  }

  // Search vendors (mock implementation)
  private async searchVendors(query: string, filters: Record<string, any>): Promise<SearchResult[]> {
    const mockVendors = [
      { id: '1', name: '테크노사운드', description: '전문 음향 및 영상 장비 공급업체', category: '음향/영상' },
      { id: '2', name: '라이트매직', description: '무대 및 이벤트 조명 전문업체', category: '조명' },
    ];

    const filtered = mockVendors.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(item => ({
      id: `vendor-${item.id}`,
      title: item.name,
      description: item.description,
      type: 'vendor' as const,
      category: item.category,
      url: `/vendors/${item.id}`,
      score: this.calculateRelevanceScore(query, item.name, item.description),
    }));
  }

  // Search quotes (mock implementation)
  private async searchQuotes(query: string, filters: Record<string, any>): Promise<SearchResult[]> {
    const mockQuotes = [
      { id: 'Q2024001', clientName: '테크놀로지 컴퍼니', eventName: '2024 테크 컨퍼런스', status: '승인대기' },
      { id: 'Q2024002', clientName: '글로벌 전자', eventName: '신제품 런칭 이벤트', status: '승인완료' },
    ];

    const filtered = mockQuotes.filter(item =>
      item.id.toLowerCase().includes(query.toLowerCase()) ||
      item.clientName.toLowerCase().includes(query.toLowerCase()) ||
      item.eventName.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(item => ({
      id: `quote-${item.id}`,
      title: `${item.id} - ${item.eventName}`,
      description: `고객: ${item.clientName}`,
      type: 'quote' as const,
      url: `/quotes/${item.id}`,
      metadata: { status: item.status },
      score: this.calculateRelevanceScore(query, item.id + item.clientName + item.eventName),
    }));
  }

  // Calculate relevance score
  private calculateRelevanceScore(query: string, title: string, description?: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description?.toLowerCase() || '';

    let score = 0;

    // Exact match in title gets highest score
    if (titleLower === queryLower) {
      score += 100;
    } else if (titleLower.includes(queryLower)) {
      score += 50;
    }

    // Partial matches in title
    const titleWords = titleLower.split(' ');
    const queryWords = queryLower.split(' ');
    
    queryWords.forEach(word => {
      if (titleWords.some(titleWord => titleWord.includes(word))) {
        score += 20;
      }
    });

    // Matches in description
    if (descLower.includes(queryLower)) {
      score += 10;
    }

    queryWords.forEach(word => {
      if (descLower.includes(word)) {
        score += 5;
      }
    });

    return score;
  }

  // Generate search suggestions
  private getSearchSuggestions(query: string): string[] {
    const suggestions = [
      ...this.getPopularSearches(),
      '시스템', '장비', '프로젝트', '업체', '견적',
      '음향', '조명', '무대', '영상', '전력',
      '온라인', '오프라인', '유지보수',
    ];

    if (!query.trim()) {
      return suggestions.slice(0, 5);
    }

    return suggestions
      .filter(s => s.toLowerCase().includes(query.toLowerCase()) && s !== query)
      .slice(0, 5);
  }

  // Generate facets for filtering
  private generateFacets(results: SearchResult[]): Record<string, { value: string; count: number }[]> {
    const facets: Record<string, Record<string, number>> = {
      type: {},
      category: {},
    };

    results.forEach(result => {
      // Type facet
      facets.type[result.type] = (facets.type[result.type] || 0) + 1;

      // Category facet
      if (result.category) {
        facets.category[result.category] = (facets.category[result.category] || 0) + 1;
      }
    });

    // Convert to required format
    const formattedFacets: Record<string, { value: string; count: number }[]> = {};
    
    Object.entries(facets).forEach(([key, values]) => {
      formattedFacets[key] = Object.entries(values)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    });

    return formattedFacets;
  }
}

export const searchService = SearchService.getInstance(); 