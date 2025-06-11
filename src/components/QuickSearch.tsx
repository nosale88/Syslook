import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import SearchInput from './SearchInput';

interface QuickSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  className?: string;
}

const QuickSearch: React.FC<QuickSearchProps> = ({
  onSearch,
  placeholder = '검색어를 입력하세요...',
  suggestions = [],
  recentSearches = [],
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Filter suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    setFilteredSuggestions(filtered);
  }, [query, suggestions]);

  // Handle search
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowDropdown(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  return (
    <div className={`relative ${className}`}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
        size="lg"
      />

      {/* Search Dropdown */}
      {showDropdown && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <TrendingUp className="h-4 w-4 mr-2" />
                추천 검색어
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-md"
                >
                  <Search className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
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
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredSuggestions.length === 0 && query.trim() && (
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

export default QuickSearch; 