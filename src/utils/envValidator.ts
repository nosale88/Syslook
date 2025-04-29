/**
 * 환경 변수 검증 유틸리티
 * 애플리케이션 시작 시 필요한 모든 환경 변수가 설정되어 있는지 확인합니다.
 */

// 필수 환경 변수 목록
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_NAME',
  'VITE_APP_VERSION'
];

// 선택적 환경 변수 목록 (설정되지 않아도 기본값 사용)
const OPTIONAL_ENV_VARS = [
  'VITE_ENABLE_NOTIFICATIONS',
  'VITE_NOTIFICATION_DURATION',
  'VITE_DEFAULT_PAGE_SIZE'
];

/**
 * 환경 변수 검증 함수
 * @returns {boolean} 모든 필수 환경 변수가 설정되어 있으면 true, 아니면 false
 */
export const validateEnv = (): boolean => {
  const missingVars: string[] = [];

  // 필수 환경 변수 검증
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  });

  // 누락된 환경 변수가 있으면 콘솔에 경고 메시지 출력
  if (missingVars.length > 0) {
    console.error('필수 환경 변수가 설정되지 않았습니다:', missingVars.join(', '));
    console.error('애플리케이션이 제대로 작동하지 않을 수 있습니다. .env 파일을 확인해주세요.');
    return false;
  }

  // 선택적 환경 변수 확인 및 경고
  const missingOptionalVars: string[] = [];
  OPTIONAL_ENV_VARS.forEach(varName => {
    if (!import.meta.env[varName]) {
      missingOptionalVars.push(varName);
    }
  });

  if (missingOptionalVars.length > 0) {
    console.warn('선택적 환경 변수가 설정되지 않았습니다:', missingOptionalVars.join(', '));
    console.warn('기본값이 사용됩니다.');
  }

  return true;
};

/**
 * 환경 변수 값 가져오기 (타입 안전)
 * @param key 환경 변수 이름
 * @param defaultValue 기본값 (환경 변수가 없을 경우 사용)
 * @returns 환경 변수 값 또는 기본값
 */
export const getEnvVar = <T>(key: string, defaultValue: T): T => {
  const value = import.meta.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  
  // 타입에 따라 변환
  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as unknown as T;
  } else if (typeof defaultValue === 'number') {
    return Number(value) as unknown as T;
  }
  
  return value as unknown as T;
};

/**
 * 애플리케이션 환경 정보 가져오기
 */
export const getAppInfo = () => {
  return {
    name: getEnvVar('VITE_APP_NAME', 'Syslook'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    enableNotifications: getEnvVar('VITE_ENABLE_NOTIFICATIONS', true),
    notificationDuration: getEnvVar('VITE_NOTIFICATION_DURATION', 5000),
    defaultPageSize: getEnvVar('VITE_DEFAULT_PAGE_SIZE', 10)
  };
};
