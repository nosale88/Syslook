import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, X, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import SearchInput from './SearchInput';

export interface SearchFilter {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'range';
  options?: { value: string; label: string }[];
  value?: any;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  count?: number;
}

export interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string, filters: Record<string, any>) => void;
  placeholder?: string;
  filters?: SearchFilter[];
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  isLoading?: boolean;
  showFilters?: boolean;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = '검색어를 입력하세요...',
  filters = [],
  suggestions = [],
  recentSearches = [],
  isLoading = false,
  showFilters = true,
  showSuggestions = true,
  showRecentSearches = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize filter values
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    filters.forEach(filter => {
      if (filter.value !== undefined) {
        initialValues[filter.key] = filter.value;
      }
    });
    setFilterValues(initialValues);
  }, [filters]);

  // Filter suggestions based on search value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = suggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);

    setFilteredSuggestions(filtered);
  }, [value, suggestions]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    onSearch(query, filterValues);
    setShowDropdown(false);
    
    // Save to recent searches (in real app, this would be saved to localStorage)
    if (query.trim() && !recentSearches.includes(query)) {
      // This would typically update parent state or localStorage
    }
  }, [onSearch, filterValues, recentSearches]);

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    
    // Auto-search when filters change
    if (value) {
      handleSearch(value);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm: string) => {
    onChange(searchTerm);
    handleSearch(searchTerm);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterValues({});
    handleSearch(value);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterValues).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Main Search Input */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <SearchInput
            value={value}
            onChange={onChange}
            onSearch={handleSearch}
            placeholder={placeholder}
            isLoading={isLoading}
            onFocus={() => setShowDropdown(true)}
            size="lg"
          />
        </div>

        {/* Filter Toggle Button */}
        {showFilters && filters.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              px-4 py-3 border border-gray-300 rounded-md flex items-center space-x-2
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
              ${hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-700'}
            `}
            title="필터"
          >
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">필터</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {Object.values(filterValues).filter(v => v).length}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && showFilters && filters.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">검색 필터</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                모든 필터 지우기
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">전체</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Dropdown */}
      {showDropdown && (showSuggestions || showRecentSearches) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <TrendingUp className="h-4 w-4 mr-2" />
                추천 검색어
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md"
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{suggestion.text}</span>
                    {suggestion.category && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                        {suggestion.category}
                      </span>
                    )}
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-gray-500">{suggestion.count}개</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <Clock className="h-4 w-4 mr-2" />
                최근 검색어
              </div>
              {recentSearches.slice(0, 5).map((searchTerm, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(searchTerm)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md group"
                >
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-700">{searchTerm}</span>
                  </div>
                  <X className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showSuggestions && filteredSuggestions.length === 0 && value.trim() && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 