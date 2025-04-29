import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PhoneLoginForm = () => {
  // 상태 관리
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 모드 상태 (로그인, 회원가입, OTP 인증)
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  
  // Auth 컨텍스트에서 필요한 함수 가져오기
  const { signInWithPhone, signUpWithPhone, verifyPhoneOtp, user } = useAuth();
  
  // 네비게이션과 위치 정보 가져오기
  const navigate = useNavigate();
  const location = useLocation();
  
  // 로그인 후 리디렉션을 위한 상태 확인
  const from = location.state?.from || '/';

  // 사용자가 인증되면 원래 페이지로 리디렉션
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // 전화번호 형식 검증 함수
  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // E.164 형식 검증 (예: +821012345678)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  };

  // 전화번호 입력 핸들러 (자동으로 E.164 형식으로 변환)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // 숫자와 + 기호만 허용
    value = value.replace(/[^\d+]/g, '');
    
    // + 기호가 맨 앞에 없으면 추가
    if (!value.startsWith('+') && value.length > 0) {
      value = '+' + value;
    }
    
    setPhone(value);
  };

  // OTP 입력 핸들러 (숫자만 허용)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setOtpToken(value.substring(0, 6)); // 최대 6자리
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // 전화번호 형식 검증
      if (!validatePhoneNumber(phone)) {
        throw new Error('유효한 전화번호 형식이 아닙니다. 국가 코드를 포함한 전체 번호를 입력해주세요. (예: +821012345678)');
      }

      if (mode === 'login') {
        // 로그인 처리
        if (!password) {
          throw new Error('비밀번호를 입력해주세요.');
        }
        
        await signInWithPhone(phone, password);
        // 로그인 성공 시 useEffect에서 리디렉션 처리
      } 
      else if (mode === 'signup') {
        // 회원가입 처리
        if (!password) {
          throw new Error('비밀번호를 입력해주세요.');
        }
        
        await signUpWithPhone(phone, password);
        setSuccessMessage('SMS로 인증 코드가 전송되었습니다. 코드를 입력해주세요.');
        setMode('verify'); // OTP 인증 모드로 전환
      } 
      else if (mode === 'verify') {
        // OTP 인증 처리
        if (otpToken.length !== 6) {
          throw new Error('6자리 인증 코드를 입력해주세요.');
        }
        
        await verifyPhoneOtp(phone, otpToken);
        setSuccessMessage('전화번호 인증이 완료되었습니다. 로그인해주세요.');
        setMode('login'); // 로그인 모드로 전환
      }
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError('오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error('Phone auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === 'login' ? '전화번호 로그인' : 
           mode === 'signup' ? '전화번호 회원가입' : 
           '전화번호 인증'}
        </h2>
        
        {/* 오류 메시지 표시 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* 성공 메시지 표시 */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* 전화번호 입력 필드 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            전화번호 (국가 코드 포함, 예: +821012345678)
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+821012345678"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={phone}
            onChange={handlePhoneChange}
            disabled={loading || (mode === 'verify')}
            required
          />
        </div>

        {/* 비밀번호 입력 필드 (로그인 또는 회원가입 모드) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        )}

        {/* OTP 입력 필드 (인증 모드) */}
        {mode === 'verify' && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
              6자리 인증 코드
            </label>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={otpToken}
              onChange={handleOtpChange}
              disabled={loading}
              maxLength={6}
              required
            />
            <p className="text-sm text-gray-600">SMS로 전송된 6자리 코드를 입력해주세요.</p>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? '처리 중...' : 
             mode === 'login' ? '로그인' : 
             mode === 'signup' ? '회원가입' : 
             '인증하기'}
          </button>
          
          {/* 모드 전환 버튼 */}
          {mode !== 'verify' && (
            <button
              type="button"
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setSuccessMessage(null);
              }}
              disabled={loading}
            >
              {mode === 'login' ? '회원가입하기' : '로그인하기'}
            </button>
          )}
        </div>
        
        {/* 이메일 로그인으로 전환 링크 */}
        <div className="mt-4 text-center">
          <a 
            href="/login" 
            className="text-sm text-blue-500 hover:text-blue-800"
          >
            이메일로 로그인하기
          </a>
        </div>
      </form>
    </div>
  );
};

export default PhoneLoginForm;
