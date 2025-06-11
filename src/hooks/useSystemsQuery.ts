import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { SystemService, SystemInfo, SystemMetric } from '../services/systemService';
import { PaginationParams, PaginatedResponse, ServiceResponse } from '../services/dataService';
import toast from 'react-hot-toast';

// 시스템 목록 쿼리 키
export const SYSTEMS_QUERY_KEY = 'systems';

/**
 * 시스템 목록 페이지네이션 훅
 */
export const useSystemsQuery = (params: PaginationParams): UseQueryResult<PaginatedResponse<SystemInfo>> => {
  const query = useQuery<PaginatedResponse<SystemInfo>, Error>({
    queryKey: [SYSTEMS_QUERY_KEY, params],
    queryFn: () => SystemService.getAllSystemsPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60, // 1분
    gcTime: 1000 * 60 * 5, // 5분
    retry: 1
  });
  
  // 오류 처리
  if (query.error) {
    toast.error(`시스템 목록을 불러오는 중 오류가 발생했습니다: ${query.error.message}`);
  }
  
  return query;
};

/**
 * 단일 시스템 정보 쿼리 훅
 */
export const useSystemQuery = (id: string): UseQueryResult<ServiceResponse<SystemInfo>> => {
  const query = useQuery<ServiceResponse<SystemInfo>, Error>({
    queryKey: [SYSTEMS_QUERY_KEY, id],
    queryFn: () => SystemService.getSystemById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1분
    gcTime: 1000 * 60 * 5, // 5분
    retry: 1
  });
  
  // 오류 처리
  if (query.error) {
    toast.error(`시스템 정보를 불러오는 중 오류가 발생했습니다: ${query.error.message}`);
  }
  
  return query;
};

/**
 * 시스템 생성 뮤테이션 훅
 */
export const useCreateSystemMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (system: Omit<SystemInfo, 'id' | 'created_at' | 'updated_at'>) => 
      SystemService.createSystem(system),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SYSTEMS_QUERY_KEY] });
      toast.success('시스템이 성공적으로 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(`시스템 생성 중 오류가 발생했습니다: ${error.message}`);
    }
  });
};

/**
 * 시스템 업데이트 뮤테이션 훅
 */
export const useUpdateSystemMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<SystemInfo> }) => 
      SystemService.updateSystem(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SYSTEMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SYSTEMS_QUERY_KEY, variables.id] });
      toast.success('시스템이 성공적으로 업데이트되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(`시스템 업데이트 중 오류가 발생했습니다: ${error.message}`);
    }
  });
};

/**
 * 시스템 삭제 뮤테이션 훅
 */
export const useDeleteSystemMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SystemService.deleteSystem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SYSTEMS_QUERY_KEY] });
      toast.success('시스템이 성공적으로 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(`시스템 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  });
};

/**
 * 시스템 메트릭 쿼리 훅
 */
export const useSystemMetricsQuery = (systemId: string): UseQueryResult<ServiceResponse<SystemMetric[]>> => {
  const query = useQuery<ServiceResponse<SystemMetric[]>, Error>({
    queryKey: [SYSTEMS_QUERY_KEY, systemId, 'metrics'],
    queryFn: () => SystemService.getSystemMetrics(systemId),
    enabled: !!systemId,
    refetchInterval: 60000, // 1분마다 자동 갱신
    staleTime: 30000, // 30초
    gcTime: 1000 * 60 * 5, // 5분
    retry: 1
  });
  
  // 오류 처리
  if (query.error) {
    toast.error(`시스템 메트릭을 불러오는 중 오류가 발생했습니다: ${query.error.message}`);
  }
  
  return query;
};
