import { Toaster } from 'react-hot-toast';

/**
 * 전역 토스트 알림 컴포넌트
 * 앱 전체에서 사용할 수 있는 알림 시스템을 제공합니다.
 */
export const Toast = () => {
  const duration = parseInt(import.meta.env.VITE_NOTIFICATION_DURATION || '5000');
  
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: duration,
        style: {
          background: '#fff',
          color: '#363636',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default Toast;
