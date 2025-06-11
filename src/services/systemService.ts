import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ServiceResponse, BaseRecord, PaginationParams, PaginatedResponse, DataService } from './dataService';

/**
 * 시스템 정보 인터페이스
 */
export interface SystemInfo extends BaseRecord {
  name: string;
  description?: string;
  status?: string;
  ip_address?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

/**
 * 시스템 메트릭 인터페이스
 */
export interface SystemMetric extends BaseRecord {
  system_id: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  timestamp?: string;
  created_at?: string;
}

/**
 * 시스템 관리 서비스
 */
export class SystemService {
  /**
   * 모든 시스템 정보 가져오기 (페이지네이션 적용)
   */
  static async getAllSystemsPaginated({ page, pageSize }: PaginationParams): Promise<PaginatedResponse<SystemInfo>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      return await DataService.getPaginated<SystemInfo>('systems', { page, pageSize }, {
        orderBy: { column: 'created_at', ascending: false }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 정보 가져오기 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error',
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize
      };
    }
  }

  /**
   * 모든 시스템 정보 가져오기
   */
  static async getAllSystems(): Promise<ServiceResponse<SystemInfo[]>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      const { data, error } = await supabase
        .from('systems')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('시스템 정보 가져오기 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as SystemInfo[],
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 정보 가져오기 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 시스템 정보 가져오기
   */
  static async getSystemById(id: string): Promise<ServiceResponse<SystemInfo>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      const { data, error } = await supabase
        .from('systems')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('시스템 정보 가져오기 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as SystemInfo,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 정보 가져오기 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 시스템 생성
   */
  static async createSystem(system: Omit<SystemInfo, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<SystemInfo>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      // 현재 세션 확인
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('세션 가져오기 오류:', sessionError);
        return {
          data: null,
          error: '인증 세션을 가져올 수 없습니다.',
          status: 'error'
        };
      }
      
      if (!sessionData.session) {
        return {
          data: null,
          error: '로그인되어 있지 않습니다.',
          status: 'error'
        };
      }
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('systems')
        .insert({
          ...system,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('시스템 생성 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as SystemInfo,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 생성 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 시스템 업데이트
   */
  static async updateSystem(id: string, updates: Partial<SystemInfo>): Promise<ServiceResponse<SystemInfo>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      // 현재 세션 확인
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('세션 가져오기 오류:', sessionError);
        return {
          data: null,
          error: '인증 세션을 가져올 수 없습니다.',
          status: 'error'
        };
      }
      
      if (!sessionData.session) {
        return {
          data: null,
          error: '로그인되어 있지 않습니다.',
          status: 'error'
        };
      }
      
      const userId = sessionData.session.user.id;
      
      // 시스템이 현재 사용자의 것인지 확인
      const { data: existingSystem, error: fetchError } = await supabase
        .from('systems')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        return {
          data: null,
          error: '시스템을 찾을 수 없습니다.',
          status: 'error'
        };
      }
      
      if (existingSystem.user_id !== userId) {
        return {
          data: null,
          error: '이 시스템을 업데이트할 권한이 없습니다.',
          status: 'error'
        };
      }
      
      const { data, error } = await supabase
        .from('systems')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('시스템 업데이트 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as SystemInfo,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 업데이트 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 시스템 삭제
   */
  static async deleteSystem(id: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      // 현재 세션 확인
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('세션 가져오기 오류:', sessionError);
        return {
          data: null,
          error: '인증 세션을 가져올 수 없습니다.',
          status: 'error'
        };
      }
      
      if (!sessionData.session) {
        return {
          data: null,
          error: '로그인되어 있지 않습니다.',
          status: 'error'
        };
      }
      
      const userId = sessionData.session.user.id;
      
      // 시스템이 현재 사용자의 것인지 확인
      const { data: existingSystem, error: fetchError } = await supabase
        .from('systems')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        return {
          data: null,
          error: '시스템을 찾을 수 없습니다.',
          status: 'error'
        };
      }
      
      if (existingSystem.user_id !== userId) {
        return {
          data: null,
          error: '이 시스템을 삭제할 권한이 없습니다.',
          status: 'error'
        };
      }
      
      const { error } = await supabase
        .from('systems')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('시스템 삭제 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: true,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 삭제 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 시스템 메트릭 가져오기
   */
  static async getSystemMetrics(systemId: string, limit: number = 100): Promise<ServiceResponse<SystemMetric[]>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .eq('system_id', systemId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('시스템 메트릭 가져오기 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as SystemMetric[],
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 메트릭 가져오기 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 시스템 메트릭 추가
   */
  static async addSystemMetric(metric: Omit<SystemMetric, 'id' | 'created_at'>): Promise<ServiceResponse<SystemMetric>> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase가 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.');
      }
      
      const { data, error } = await supabase
        .from('system_metrics')
        .insert({
          ...metric,
          timestamp: metric.timestamp || new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('시스템 메트릭 추가 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as SystemMetric,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('시스템 메트릭 추가 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
}
