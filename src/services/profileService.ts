import { PostgrestError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ServiceResponse, BaseRecord } from './dataService';

/**
 * 사용자 프로필 인터페이스
 */
export interface UserProfile extends BaseRecord {
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 사용자 프로필 관리 서비스
 */
export class ProfileService {
  /**
   * 현재 로그인한 사용자의 프로필 정보 가져오기
   */
  static async getCurrentProfile(): Promise<ServiceResponse<UserProfile>> {
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
      
      // 프로필 정보 가져오기
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('프로필 가져오기 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as UserProfile,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('프로필 가져오기 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 사용자 프로필 업데이트
   */
  static async updateProfile(profile: Partial<UserProfile>): Promise<ServiceResponse<UserProfile>> {
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
      
      // 프로필 정보 업데이트
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('프로필 업데이트 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: data as UserProfile,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('프로필 업데이트 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * 사용자 아바타 업로드
   */
  static async uploadAvatar(file: File): Promise<ServiceResponse<string>> {
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // 파일 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('아바타 업로드 오류:', uploadError);
        return {
          data: null,
          error: uploadError.message,
          status: 'error'
        };
      }
      
      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = urlData.publicUrl;
      
      // 프로필 업데이트
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('프로필 업데이트 오류:', error);
        return {
          data: null,
          error: error.message,
          status: 'error'
        };
      }
      
      return {
        data: avatarUrl,
        error: null,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('아바타 업로드 중 오류:', error);
      return {
        data: null,
        error: errorMessage,
        status: 'error'
      };
    }
  }
}
