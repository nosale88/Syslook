import { PostgrestError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getEnvVar } from '../utils/envValidator';

/**
 * Generic interface for database records
 */
export interface BaseRecord {
  id: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

/**
 * Error response type
 */
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error';
}

/**
 * Query options interface
 */
export interface QueryOptions {
  select?: string;
  filters?: Array<{ column: string; operator: string; value: any }>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 간단한 메모리 캐시 구현
 */
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly DEFAULT_TTL = 60 * 1000; // 기본 TTL: 1분

  /**
   * 캐시에서 데이터 가져오기
   * @param key 캐시 키
   * @returns 캐시된 데이터 또는 undefined
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    const now = Date.now();
    if (now - item.timestamp > this.DEFAULT_TTL) {
      this.cache.delete(key);
      return undefined;
    }

    return item.data as T;
  }

  /**
   * 데이터를 캐시에 저장
   * @param key 캐시 키
   * @param data 저장할 데이터
   * @param ttl 캐시 유효 시간 (밀리초)
   */
  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    this.cache.set(key, { data, timestamp });

    // TTL 후 자동 삭제 설정
    setTimeout(() => {
      const item = this.cache.get(key);
      if (item && item.timestamp === timestamp) {
        this.cache.delete(key);
      }
    }, ttl);
  }

  /**
   * 캐시에서 데이터 삭제
   * @param key 캐시 키 또는 키 패턴
   */
  invalidate(keyPattern: string | RegExp): void {
    if (typeof keyPattern === 'string') {
      this.cache.delete(keyPattern);
    } else {
      // 정규식 패턴과 일치하는 모든 키 삭제
      for (const key of this.cache.keys()) {
        if (keyPattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * 모든 캐시 데이터 삭제
   */
  clear(): void {
    this.cache.clear();
  }
}

// 전역 캐시 인스턴스
const globalCache = new MemoryCache();

/**
 * Service for handling data operations with Supabase
 */
export class DataService {
  /**
   * Check if Supabase is configured before performing operations
   */
  private static checkConfiguration(): void {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not properly configured. Check your environment variables.');
    }
  }
  
  /**
   * 캐싱 사용 여부 확인
   */
  private static isCachingEnabled(): boolean {
    return getEnvVar('VITE_ENABLE_DATA_CACHING', true);
  }
  
  /**
   * 캐시 키 생성
   */
  private static createCacheKey(tableName: string, operation: string, params?: any): string {
    let key = `${tableName}:${operation}`;
    if (params) {
      key += `:${JSON.stringify(params)}`;
    }
    return key;
  }

  /**
   * Handle Supabase errors consistently
   */
  private static handleError<T>(error: PostgrestError | Error | null, operation: string): ServiceResponse<T> {
    const errorMessage = error ? error.message : 'Unknown error occurred';
    console.error(`Error during ${operation}:`, error);
    return {
      data: null,
      error: errorMessage,
      status: 'error'
    };
  }

  /**
   * Fetch all records from a table
   */
  static async getAll<T extends BaseRecord>(tableName: string, useCache = true): Promise<ServiceResponse<T[]>> {
    try {
      this.checkConfiguration();
      
      // 캐시 확인
      const cacheKey = this.createCacheKey(tableName, 'getAll');
      if (useCache && this.isCachingEnabled()) {
        const cachedData = globalCache.get<ServiceResponse<T[]>>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) {
        return this.handleError<T[]>(error, `fetching data from ${tableName}`);
      }
      
      const response: ServiceResponse<T[]> = {
        data: data as unknown as T[],
        error: null,
        status: 'success'
      };
      
      // 캐시에 저장
      if (useCache && this.isCachingEnabled()) {
        globalCache.set(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      return this.handleError<T[]>(error as Error, `fetching data from ${tableName}`);
    }
  }
  
  /**
   * Fetch a single record by ID
   */
  static async getById<T extends BaseRecord>(tableName: string, id: number | string, useCache = true): Promise<ServiceResponse<T>> {
    try {
      this.checkConfiguration();
      
      // 캐시 확인
      const cacheKey = this.createCacheKey(tableName, 'getById', id);
      if (useCache && this.isCachingEnabled()) {
        const cachedData = globalCache.get<ServiceResponse<T>>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return this.handleError<T>(error, `fetching ${tableName} with id ${id}`);
      }
      
      const response = {
        data: data as T,
        error: null,
        status: 'success' as const
      };
      
      // 캐시에 저장
      if (useCache && this.isCachingEnabled()) {
        globalCache.set(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      return this.handleError<T>(error as Error, `fetching ${tableName} with id ${id}`);
    }
  }
  
  /**
   * Create a new record
   */
  static async create<T extends BaseRecord>(tableName: string, record: Omit<T, 'id' | 'created_at'>): Promise<ServiceResponse<T>> {
    try {
      this.checkConfiguration();
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select();
      
      if (error) {
        return this.handleError<T>(error, `creating record in ${tableName}`);
      }
      
      // 새 레코드가 추가되면 해당 테이블 관련 캐시 무효화
      if (this.isCachingEnabled()) {
        // getAll 메서드 관련 캐시 무효화
        globalCache.invalidate(new RegExp(`^${tableName}:getAll`));
        // 페이지네이션 관련 캐시 무효화
        globalCache.invalidate(new RegExp(`^${tableName}:getPaginated`));
        // 쿼리 관련 캐시 무효화
        globalCache.invalidate(new RegExp(`^${tableName}:query`));
      }
      
      return {
        data: (data && data[0]) as T,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return this.handleError<T>(error as Error, `creating record in ${tableName}`);
    }
  }
  
  /**
   * Update an existing record
   */
  static async update<T extends BaseRecord>(tableName: string, id: number | string, updates: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      this.checkConfiguration();
      
      // updated_at 필드 추가 (없는 경우)
      const updatedRecord = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(tableName)
        .update(updatedRecord)
        .eq('id', id)
        .select();
      
      if (error) {
        return this.handleError<T>(error, `updating ${tableName} with id ${id}`);
      }
      
      // 레코드 업데이트 후 관련 캐시 무효화
      if (this.isCachingEnabled()) {
        // 해당 레코드 캐시 무효화
        globalCache.invalidate(this.createCacheKey(tableName, 'getById', id));
        
        // 목록 캐시 무효화
        globalCache.invalidate(new RegExp(`^${tableName}:getAll`));
        globalCache.invalidate(new RegExp(`^${tableName}:getPaginated`));
        globalCache.invalidate(new RegExp(`^${tableName}:query`));
      }
      
      return {
        data: (data && data[0]) as T,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return this.handleError<T>(error as Error, `updating ${tableName} with id ${id}`);
    }
  }
  
  /**
   * Delete a record
   */
  static async delete(tableName: string, id: number | string): Promise<ServiceResponse<boolean>> {
    try {
      this.checkConfiguration();
      
      // 삭제 전에 레코드의 캐시를 무효화하기 위해 먼저 레코드 조회
      if (this.isCachingEnabled()) {
        await this.getById(tableName, id, false);
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        return this.handleError<boolean>(error, `deleting ${tableName} with id ${id}`);
      }
      
      // 레코드 삭제 후 관련 캐시 무효화
      if (this.isCachingEnabled()) {
        // 해당 레코드 캐시 무효화
        globalCache.invalidate(this.createCacheKey(tableName, 'getById', id));
        
        // 목록 캐시 무효화
        globalCache.invalidate(new RegExp(`^${tableName}:getAll`));
        globalCache.invalidate(new RegExp(`^${tableName}:getPaginated`));
        globalCache.invalidate(new RegExp(`^${tableName}:query`));
      }
      
      return {
        data: true,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return this.handleError<boolean>(error as Error, `deleting ${tableName} with id ${id}`);
    }
  }
  
  /**
   * Get paginated data from a table
   */
  static async getPaginated<T extends BaseRecord>(
    tableName: string, 
    { page, pageSize }: PaginationParams, 
    options: Omit<QueryOptions, 'limit' | 'offset'> = {},
    useCache = true
  ): Promise<PaginatedResponse<T>> {
    try {
      this.checkConfiguration();
      
      // 캐시 확인
      const cacheKey = this.createCacheKey(tableName, 'getPaginated', { page, pageSize, options });
      if (useCache && this.isCachingEnabled()) {
        const cachedData = globalCache.get<PaginatedResponse<T>>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      // 전체 개수 쿼리
      const countQuery = supabase
        .from(tableName)
        .select('id', { count: 'exact', head: true });
      
      // 필터 적용
      if (options.filters) {
        options.filters.forEach(filter => {
          countQuery.filter(filter.column, filter.operator, filter.value);
        });
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        return {
          data: null,
          error: countError.message,
          status: 'error',
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
          pageSize: pageSize
        };
      }
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // 데이터 쿼리
      let dataQuery = supabase
        .from(tableName)
        .select(options.select || '*')
        .range(from, to);
      
      // 필터 적용
      if (options.filters) {
        options.filters.forEach(filter => {
          dataQuery = dataQuery.filter(filter.column, filter.operator, filter.value);
        });
      }
      
      // 정렬 적용
      if (options.orderBy) {
        dataQuery = dataQuery.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }
      
      const { data, error: dataError } = await dataQuery;
      
      if (dataError) {
        return {
          data: null,
          error: dataError.message,
          status: 'error',
          totalCount,
          totalPages,
          currentPage: page,
          pageSize
        };
      }
      
      const result: PaginatedResponse<T> = {
        data: data as unknown as T[],
        error: null,
        status: 'success',
        totalCount,
        totalPages,
        currentPage: page,
        pageSize
      };
      
      // 결과 캐싱
      if (this.isCachingEnabled() && useCache) {
        globalCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
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
   * Custom query with filters
   */
  static async query<T extends BaseRecord>(tableName: string, options: QueryOptions, useCache = true): Promise<ServiceResponse<T[]>> {
    try {
      this.checkConfiguration();
      
      // 캐시 확인
      const cacheKey = this.createCacheKey(tableName, 'query', options);
      if (useCache && this.isCachingEnabled()) {
        const cachedData = globalCache.get<ServiceResponse<T[]>>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      let query = supabase
        .from(tableName)
        .select(options.select || '*');
      
      // Apply filters
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return this.handleError<T[]>(error, `querying ${tableName}`);
      }
      
      const result: ServiceResponse<T[]> = {
        data: data as unknown as T[],
        error: null,
        status: 'success'
      };
      
      // 결과 캐싱
      if (this.isCachingEnabled() && useCache) {
        globalCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      return this.handleError<T[]>(error as Error, `querying ${tableName}`);
    }
  }
}
