import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // 로컬 스토리지 또는 환경 변수에서 초기 테마 가져오기
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const defaultTheme = import.meta.env.VITE_DEFAULT_THEME as Theme || 'light';
    
    // 시스템 테마 감지
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : defaultTheme;
    }
    
    return savedTheme;
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 테마 변경 함수
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // 테마 변경 시 HTML 클래스 업데이트
  useEffect(() => {
    const root = window.document.documentElement;
    
    // 이전 테마 클래스 제거
    root.classList.remove('light', 'dark');
    
    // 새 테마 클래스 추가
    root.classList.add(theme);
    
    // 메타 테마 색상 업데이트
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'light' ? '#ffffff' : '#1f2937'
      );
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마 컨텍스트 사용을 위한 훅
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
