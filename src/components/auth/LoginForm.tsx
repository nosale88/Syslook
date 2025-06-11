import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signIn, signUp, user, resetPassword, signInWithGoogle } = useAuth();
  
  // 네비게이션과 위치 정보 가져오기
  const navigate = useNavigate();
  const location = useLocation();
  
  // 로그인 후 리디렉션을 위한 상태 확인
  const from = location.state?.from || '/';

  // 구글 로그인 기능은 Supabase에서 구글 OAuth 제공자가 활성화되지 않아 현재 비활성화되어 있습니다.

  // 사용자가 인증되면 원래 페이지로 리디렉션
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // 비밀번호 재설정 함수
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!email) {
        throw new Error('이메일을 입력해주세요.');
      }

      // AuthContext의 resetPassword 함수 사용
      await resetPassword(email);

      setSuccessMessage('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
    } catch (err: any) {
      setError(err.message || '비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isResetPassword) {
        await handleResetPassword(e);
        return;
      }

      if (isSignUp) {
        // 회원가입 처리
        await signUp(email, password);
        setSuccessMessage('회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.');
        setIsSignUp(false); // 회원가입 후 로그인 모드로 전환
      } else {
        // 로그인 처리
        await signIn(email, password);
        // 로그인 성공 시 useEffect에서 리디렉션 처리
      }
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError(isSignUp ? '회원가입 중 오류가 발생했습니다.' : '로그인 정보가 올바르지 않습니다.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isResetPassword ? '비밀번호 재설정' : isSignUp ? '회원가입' : '로그인'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            autoComplete="email"
            aria-describedby="email-error"
            placeholder="your@email.com"
          />
          {error && error.includes('email') && (
            <p id="email-error" className="text-red-500 text-xs italic mt-1">유효한 이메일을 입력해주세요</p>
          )}
        </div>
        
        {!isResetPassword && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required={!isResetPassword}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              aria-describedby="password-error"
              minLength={6}
            />
            {error && error.includes('password') && (
              <p id="password-error" className="text-red-500 text-xs italic mt-1">비밀번호는 최소 6자 이상이어야 합니다</p>
            )}
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading 
              ? (isResetPassword ? '이메일 발송 중...' : isSignUp ? '회원가입 중...' : '로그인 중...') 
              : (isResetPassword ? '비밀번호 재설정 이메일 발송' : isSignUp ? '회원가입' : '로그인')}
          </button>
          
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500 text-sm">또는</span>
            <hr className="flex-grow border-gray-300" />
          </div>
          
          <button
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                await signInWithGoogle();
              } catch (err: any) {
                setError(err.message || '구글 로그인 중 오류가 발생했습니다.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded focus:outline-none w-full hover:bg-gray-50"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Google로 로그인
          </button>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (isResetPassword) {
                  setIsResetPassword(false);
                } else {
                  setIsSignUp(!isSignUp);
                }
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              {isResetPassword 
                ? '로그인으로 돌아가기' 
                : isSignUp 
                  ? '이미 계정이 있으신가요? 로그인' 
                  : '계정이 없으신가요? 회원가입'}
            </button>
            
            {!isSignUp && !isResetPassword && (
              <button 
                type="button"
                onClick={() => {
                  setIsResetPassword(true);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-sm text-blue-500 hover:text-blue-800"
              >
                비밀번호 찾기
              </button>
            )}
          </div>
          

        </div>
      </form>
    </div>
  );
};

export default LoginForm;
