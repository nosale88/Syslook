import { PostgrestError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  static async getAll<T extends BaseRecord>(tableName: string): Promise<ServiceResponse<T[]>> {
    try {
      this.checkConfiguration();
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) {
        return this.handleError<T[]>(error, `fetching data from ${tableName}`);
      }
      
      return {
        data: data as T[],
        error: null,
        status: 'success'
      };
    } catch (error) {
      return this.handleError<T[]>(error as Error, `fetching data from ${tableName}`);
    }
  }
  
  /**
   * Fetch a single record by ID
   */
  static async getById<T extends BaseRecord>(tableName: string, id: number | string): Promise<ServiceResponse<T>> {
    try {
      this.checkConfiguration();
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return this.handleError<T>(error, `fetching ${tableName} with id ${id}`);
      }
      
      return {
        data: data as T,
        error: null,
        status: 'success'
      };
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
      
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        return this.handleError<T>(error, `updating ${tableName} with id ${id}`);
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
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        return this.handleError<boolean>(error, `deleting ${tableName} with id ${id}`);
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
   * Custom query with filters
   */
  static async query<T extends BaseRecord>(tableName: string, options: QueryOptions): Promise<ServiceResponse<T[]>> {
    try {
      this.checkConfiguration();
      
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
      
      return {
        data: data as T[],
        error: null,
        status: 'success'
      };
    } catch (error) {
      return this.handleError<T[]>(error as Error, `querying ${tableName}`);
    }
  }
}
