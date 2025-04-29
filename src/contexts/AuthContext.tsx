import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // 사용자가 로그인하거나 회원가입하면 프로필 자동 생성
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // 로그인 성공 시 프로필 확인 및 생성
      if (data.user) {
        await ensureUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  /**
   * 사용자 프로필이 존재하는지 확인하고, 없으면 생성하는 함수
   * 프로필 생성 실패 시 상세 에러 메시지 제공
   */
  const ensureUserProfile = async (user: User): Promise<void> => {
    try {
      // 프로필 존재 확인
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id') // 필요한 필드만 선택하여 성능 최적화
        .eq('id', user.id)
        .single();
      
      // 프로필이 없으면 생성
      if (fetchError || !profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert([ // insert 대신 upsert 사용하여 중복 방지
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
              updated_at: new Date().toISOString()
            }
          ], { onConflict: 'id' });
        
        if (insertError) {
          console.error('프로필 생성 오류:', insertError);
          throw new Error(`프로필 생성 실패: ${insertError.message}`);
        }
      }
    } catch (error: any) {
      console.error('프로필 확인/생성 오류:', error);
      // 에러를 로깅하지만 인증 흐름은 계속 진행
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      // 회원가입 성공 시 프로필 자동 생성
      if (data.user) {
        await ensureUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // 구글 로그인은 리디렉션을 통해 이루어지므로 여기서 프로필 생성을 할 수 없음
      // 대신 onAuthStateChange 이벤트에서 처리
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  /**
   * 비밀번호 재설정 이메일 발송
   * @param email 사용자 이메일
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  /**
   * 비밀번호 업데이트
   * @param newPassword 새 비밀번호
   */
  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };



  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
