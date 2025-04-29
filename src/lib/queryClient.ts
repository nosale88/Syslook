import { QueryClient } from '@tanstack/react-query';

// React Query 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
      retry: 2, // 실패 시 2번 재시도
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터 신선 유지
      gcTime: 1000 * 60 * 30, // 30분 동안 가비지 컬렉션 시간 (이전의 cacheTime)
    },
  },
});
