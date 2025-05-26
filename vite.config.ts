import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('환경 변수 확인:', {
    SUPABASE_URL: env.VITE_SUPABASE_URL || '없음',
    SUPABASE_KEY: env.VITE_SUPABASE_ANON_KEY ? '존재함' : '없음'
  });
  
  return {
    plugins: [react()],
    base: '/',
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // 환경 변수를 전역으로 사용할 수 있게 함
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION),
      'import.meta.env.VITE_VERTEX_AI_API_KEY': JSON.stringify(env.VITE_VERTEX_AI_API_KEY),
      'import.meta.env.VITE_VERTEX_AI_PROJECT_ID': JSON.stringify(env.VITE_VERTEX_AI_PROJECT_ID),
      'import.meta.env.VITE_VERTEX_AI_LOCATION': JSON.stringify(env.VITE_VERTEX_AI_LOCATION),
      'import.meta.env.VITE_VERTEX_AI_MODEL': JSON.stringify(env.VITE_VERTEX_AI_MODEL)
    }
  };
});