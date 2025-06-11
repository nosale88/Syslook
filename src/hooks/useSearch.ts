import { useState, useEffect, useCallback, useRef } from 'react';
import { searchService, SearchOptions, SearchResponse, SearchResult } from '../services/searchService';

export interface UseSearchOptions {
  debounceMs?: number;
  autoSearch?: boolean;
  cacheResults?: boolean;
  initialQuery?: string;
  initialFilters?: Record<string, any>;
}

export interface UseSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  suggestions: string[];
  facets: Record<string, { value: string; count: number }[]>;
  
  // Actions
  setQuery: (query: string) => void;
  search: (options?: Partial<SearchOptions>) => Promise<void>;
  clearResults: () => void;
  clearHistory: () => void;
  
  // History
  searchHistory: string[];
  popularSearches: string[];
}

const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    debounceMs = 300,
    autoSearch = false,
    cacheResults = true,
    initialQuery = '',
    initialFilters = {},
  } = options;

  // State
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [facets, setFacets] = useState<Record<string, { value: string; count: number }[]>>({});

  // Refs
  const debounceRef = useRef<NodeJS.Timeout>();
  const cacheRef = useRef<Map<string, SearchResponse>>(new Map());
  const abortControllerRef = useRef<AbortController>();

  // Get search history and popular searches
  const searchHistory = searchService.getSearchHistory();
  const popularSearches = searchService.getPopularSearches();

  // Create cache key
  const createCacheKey = useCallback((searchOptions: SearchOptions): string => {
    return JSON.stringify({
      query: searchOptions.query,
      filters: searchOptions.filters,
      types: searchOptions.types,
      sortBy: searchOptions.sortBy,
      sortOrder: searchOptions.sortOrder,
    });
  }, []);

  // Perform search
  const search = useCallback(async (searchOptions: Partial<SearchOptions> = {}) => {
    const searchQuery = searchOptions.query || query || '';
    
    const fullOptions: SearchOptions = {
      query: searchQuery,
      filters: { ...initialFilters, ...searchOptions.filters },
      types: searchOptions.types ?? [],
      limit: searchOptions.limit ?? 20,
      offset: searchOptions.offset ?? 0,
      sortBy: searchOptions.sortBy ?? 'relevance',
      sortOrder: searchOptions.sortOrder ?? 'desc',
    };

    // Don't search if query is empty
    if (!fullOptions.query.trim()) {
      setResults([]);
      setTotalResults(0);
      setSuggestions([]);
      setFacets({});
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cacheKey = createCacheKey(fullOptions);
      if (cacheResults && cacheRef.current.has(cacheKey)) {
        const cachedResponse = cacheRef.current.get(cacheKey)!;
        setResults(cachedResponse.results);
        setTotalResults(cachedResponse.total);
        setSuggestions(cachedResponse.suggestions || []);
        setFacets(cachedResponse.facets || {});
        setIsLoading(false);
        return;
      }

      // Perform search
      const response = await searchService.search(fullOptions);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Update state
      setResults(response.results);
      setTotalResults(response.total);
      setSuggestions(response.suggestions || []);
      setFacets(response.facets || {});

      // Cache results
      if (cacheResults) {
        cacheRef.current.set(cacheKey, response);
        
        // Limit cache size
        if (cacheRef.current.size > 50) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
      }

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        console.error('Search error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, initialFilters, cacheResults, createCacheKey]);

  // Debounced search
  const debouncedSearch = useCallback((searchOptions: Partial<SearchOptions> = {}) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search({ ...searchOptions, query: searchOptions.query || query });
    }, debounceMs);
  }, [search, debounceMs]);

  // Auto search when query changes
  useEffect(() => {
    if (autoSearch && query.trim()) {
      debouncedSearch();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, autoSearch, debouncedSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setSuggestions([]);
    setFacets({});
    setError(null);
    
    // Clear cache
    if (cacheResults) {
      cacheRef.current.clear();
    }
  }, [cacheResults]);

  // Clear search history
  const clearHistory = useCallback(() => {
    searchService.clearHistory();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    query,
    results,
    isLoading,
    error,
    totalResults,
    suggestions,
    facets,
    
    // Actions
    setQuery,
    search,
    clearResults,
    clearHistory,
    
    // History
    searchHistory,
    popularSearches,
  };
};

export default useSearch; 