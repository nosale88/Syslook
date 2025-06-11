import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdvancedSearch, { SearchFilter, SearchSuggestion } from '../components/AdvancedSearch';
import { searchService, SearchResult, SearchOptions } from '../services/searchService';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  FileText, 
  Server, 
  Package, 
  Users, 
  Building,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [facets, setFacets] = useState<Record<string, { value: string; count: number }[]>>({});
  
  const resultsPerPage = 10;

  // Search filters
  const searchFilters: SearchFilter[] = [
    {
      key: 'type',
      label: '콘텐츠 유형',
      type: 'select',
      options: [
        { value: 'system', label: '시스템' },
        { value: 'equipment', label: '장비' },
        { value: 'project', label: '프로젝트' },
        { value: 'vendor', label: '업체' },
        { value: 'quote', label: '견적' },
      ],
    },
    {
      key: 'category',
      label: '카테고리',
      type: 'select',
      options: [
        { value: '음향/영상', label: '음향/영상' },
        { value: '조명', label: '조명' },
        { value: '무대/구조물', label: '무대/구조물' },
        { value: 'server', label: '서버' },
        { value: 'database', label: '데이터베이스' },
      ],
    },
    {
      key: 'dateFrom',
      label: '시작 날짜',
      type: 'date',
    },
    {
      key: 'dateTo',
      label: '종료 날짜',
      type: 'date',
    },
  ];

  // Search suggestions
  const searchSuggestions: SearchSuggestion[] = [
    { id: '1', text: '음향 시스템', category: '장비', count: 15 },
    { id: '2', text: '웹 서버', category: '시스템', count: 8 },
    { id: '3', text: '2024 테크 컨퍼런스', category: '프로젝트', count: 3 },
    { id: '4', text: '테크노사운드', category: '업체', count: 12 },
    { id: '5', text: 'LED 스크린', category: '장비', count: 7 },
  ];

  // Recent searches from service
  const recentSearches = searchService.getSearchHistory();

  // Perform search
  const performSearch = async (query: string, filters: Record<string, any> = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    
    try {
      const searchOptions: SearchOptions = {
        query,
        filters,
        types: selectedTypes,
        limit: resultsPerPage,
        offset: (currentPage - 1) * resultsPerPage,
        sortBy: 'relevance',
      };

      const response = await searchService.search(searchOptions);
      
      setSearchResults(response.results);
      setTotalResults(response.total);
      setFacets(response.facets || {});

      // Update URL
      const params = new URLSearchParams();
      params.set('q', query);
      if (currentPage > 1) params.set('page', currentPage.toString());
      if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
      setSearchParams(params);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string, filters: Record<string, any>) => {
    setSearchQuery(query);
    setCurrentPage(1);
    performSearch(query, filters);
  };

  // Handle type filter change
  const handleTypeFilter = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newTypes);
    setCurrentPage(1);
    performSearch(searchQuery, {});
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      navigate(result.url);
    }
  };

  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Server className="h-5 w-5 text-blue-500" />;
      case 'equipment':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'project':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'vendor':
        return <Building className="h-5 w-5 text-orange-500" />;
      case 'quote':
        return <Users className="h-5 w-5 text-red-500" />;
      default:
        return <Search className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      system: '시스템',
      equipment: '장비',
      project: '프로젝트',
      vendor: '업체',
      quote: '견적',
    };
    return labels[type] || type;
  };

  // Load initial search from URL
  useEffect(() => {
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const types = searchParams.get('types')?.split(',').filter(Boolean) || [];

    if (query) {
      setSearchQuery(query);
      setCurrentPage(page);
      setSelectedTypes(types);
      performSearch(query, {});
    }
  }, []);

  // Pagination
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">통합 검색</h1>
          <p className="text-gray-600">시스템, 장비, 프로젝트, 업체, 견적을 한 번에 검색하세요</p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <AdvancedSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="검색어를 입력하세요..."
            filters={searchFilters}
            suggestions={searchSuggestions}
            recentSearches={recentSearches}
            isLoading={isLoading}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Results Section */}
        {searchQuery && (
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  필터
                </h3>

                {/* Type Filters */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">콘텐츠 유형</h4>
                  <div className="space-y-2">
                    {Object.entries(facets.type || {}).map(([type, { count }]) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeFilter(type)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex-1">
                          {getTypeLabel(type)}
                        </span>
                        <span className="text-xs text-gray-500">({count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filters */}
                {facets.category && Object.keys(facets.category).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">카테고리</h4>
                    <div className="space-y-2">
                      {Object.entries(facets.category).map(([category, { count }]) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{category}</span>
                          <span className="text-gray-500">({count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    인기 검색어
                  </h4>
                  <div className="space-y-1">
                    {searchService.getPopularSearches().slice(0, 5).map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(term, {})}
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Results */}
            <div className="flex-1">
              {/* Results Header */}
              {totalResults > 0 && (
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-gray-600">
                    <strong>"{searchQuery}"</strong>에 대한 검색 결과 
                    <span className="ml-2">
                      {startResult}-{endResult} / 총 {totalResults}개
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {(performance.now() / 1000).toFixed(2)}초
                  </div>
                </div>
              )}

              {/* Results List */}
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getResultIcon(result.type)}
                          <span className="ml-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {getTypeLabel(result.type)}
                          </span>
                          {result.category && (
                            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                              {result.category}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-1">
                          {result.title}
                        </h3>
                        
                        {result.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {result.description}
                          </p>
                        )}

                        {/* Metadata */}
                        {result.metadata && (
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <span key={key}>
                                <span className="font-medium">{key}:</span> {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex items-center text-gray-400">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {searchQuery && !isLoading && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    "<strong>{searchQuery}</strong>"에 대한 결과를 찾을 수 없습니다.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>검색 팁:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• 다른 키워드를 시도해보세요</li>
                      <li>• 검색어의 철자를 확인해보세요</li>
                      <li>• 더 일반적인 용어를 사용해보세요</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">검색 중...</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              검색어를 입력해주세요
            </h3>
            <p className="text-gray-500 mb-6">
              시스템, 장비, 프로젝트, 업체, 견적을 검색할 수 있습니다.
            </p>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1" />
                  최근 검색어
                </h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {recentSearches.slice(0, 5).map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term, {})}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch; 