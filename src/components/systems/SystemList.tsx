import { useState, useCallback } from 'react';
import { SystemInfo } from '../../services/systemService';
import { Link } from 'react-router-dom';
import { useSystemsQuery, useDeleteSystemMutation } from '../../hooks/useSystemsQuery';
import { PaginationParams } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiSearch, FiChevronLeft, FiChevronRight, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const DEFAULT_PAGE_SIZE = parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10');

const SystemList = () => {
  // 페이지네이션 상태
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });
  
  // 필터링 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 시스템 데이터 조회
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useSystemsQuery(pagination);
  
  // 시스템 삭제 뮤테이션
  const deleteMutation = useDeleteSystemMutation();
  
  // 페이지 변경 함수
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // 페이지 크기 변경 함수
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, page: 1, pageSize: newSize }));
  };
  
  // 검색어 변경 함수
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // 검색 제출 함수
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // 검색 시 첫 페이지로 이동
    refetch();
  };
  
  // 필터 변경 함수
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // 필터 변경 시 첫 페이지로 이동
  };
  
  // 삭제 처리 함수
  const handleDeleteSystem = (id: string | number) => {
    if (window.confirm('정말로 이 시스템을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id.toString(), {
        onSuccess: () => {
          toast.success('시스템이 성공적으로 삭제되었습니다.');
        },
        onError: (error) => {
          toast.error(`시스템 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
      });
    }
  };

  // 로딩 상태 표시 - 스켈레톤 UI로 개선
  const renderSkeletonLoaders = useCallback(() => {
    return Array(6).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ));
  }, []);
  
  // 초기 로딩 상태 표시
  if (isLoading && (!data || !(data as any).data || (data as any).data.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="h-10 bg-gray-200 rounded w-full md:w-64 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {renderSkeletonLoaders()}
        </div>
      </div>
    );
  }

  // 시스템 데이터 추출
  const systems = (data as any)?.data || [];
  const totalPages = (data as any)?.totalPages || 1;
  const currentPage = (data as any)?.currentPage || 1;
  const totalCount = (data as any)?.totalCount || 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">시스템 목록</h1>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* 검색 폼 */}
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="시스템 검색..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          {/* 필터 선택 */}
          <div className="flex items-center">
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 상태</option>
              <option value="online">온라인</option>
              <option value="offline">오프라인</option>
              <option value="maintenance">유지보수</option>
            </select>
            <button 
              onClick={() => refetch()} 
              className="ml-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded"
              title="새로고침"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
          
          <Link 
            to="/systems/new" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            새 시스템 추가
          </Link>
        </div>
      </div>
      
      {isError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2" />
            <p className="font-medium">{error?.message || '시스템 정보를 가져오는 중 오류가 발생했습니다.'}</p>
          </div>
          <div className="mt-2">
            <button 
              onClick={() => refetch()} 
              className="bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 rounded text-sm inline-flex items-center"
            >
              <FiRefreshCw className="w-4 h-4 mr-1" /> 다시 시도
            </button>
          </div>
        </div>
      )}
      
      {systems.length === 0 && !isLoading ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">등록된 시스템이 없습니다.</p>
          <Link 
            to="/systems/new" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            첫 시스템 추가하기
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {systems.map((system: SystemInfo) => (
              <div 
                key={system.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:text-white"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 dark:text-white">{system.name}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      system.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      system.status === 'offline' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      system.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {system.status || '상태 없음'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2 dark:text-gray-300">
                    {system.description || '설명 없음'}
                  </p>
                  
                  {system.ip_address && (
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                      IP: {system.ip_address}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-4 dark:text-gray-400">
                    생성: {new Date(system.created_at || '').toLocaleDateString()}
                  </div>
                  
                  <div className="flex justify-between">
                    <Link 
                      to={`/systems/${system.id}`} 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      상세보기
                    </Link>
                    
                    <div className="space-x-2">
                      <Link 
                        to={`/systems/${system.id}/edit`} 
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        수정
                      </Link>
                      <button 
                        onClick={() => handleDeleteSystem(system.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending && deleteMutation.variables === system.id.toString() ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 페이지네이션 */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6">
            <div className="mb-4 md:mb-0">
              <select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="5">5개씩 보기</option>
                <option value="10">10개씩 보기</option>
                <option value="20">20개씩 보기</option>
                <option value="50">50개씩 보기</option>
              </select>
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                총 {totalCount}개 중 {(currentPage - 1) * pagination.pageSize + 1}-
                {Math.min(currentPage * pagination.pageSize, totalCount)}개 표시
              </span>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-white text-blue-500 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-400'}`}
              >
                <FiChevronLeft />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // 현재 페이지 주변 5개의 페이지 번호만 표시
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`mx-1 px-3 py-1 rounded ${pageNum === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-400'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-2 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-white text-blue-500 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-400'}`}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemList;
