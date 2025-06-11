import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Vendors from './pages/Vendors';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import Settings from './pages/Settings';
import ThreeDConfigurator from './pages/ThreeDConfigurator';
import Equipment from './pages/Equipment';
import ChatIcon from './components/chat/ChatIcon';

// 프로필 관리 컴포넌트
import ProfileForm from './components/profile/ProfileForm';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 메인 애플리케이션 컨텐츠
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 ${isSidebarOpen ? 'ml-72' : 'ml-16'} transition-all duration-300 ease-in-out`}>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <PageTitle />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            {/* 3D 견적 도구가 메인 기능이므로 기본 경로를 견적 계산기로 설정 */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/configurator" element={<ThreeDConfigurator isSidebarOpen={isSidebarOpen} />} />
            
            {/* 견적 관리 */}
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/projects" element={<Projects />} />
            
            {/* 장비 & 업체 */}
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/vendors" element={<Vendors />} />
            
            {/* 분석 & 리포트 */}
            <Route path="/analytics" element={<Analytics />} />
            
            {/* 설정 */}
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {/* 채팅 아이콘 */}
      <ChatIcon />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

function PageTitle() {
  const location = useLocation();
  const titles: { [key: string]: string } = {
    '/': '견적 계산기',
    '/configurator': '3D 견적 도구',
    '/quotes': '견적서 목록',
    '/projects': '프로젝트',
    '/equipment': '장비 카탈로그',
    '/vendors': '협력 업체',
    '/analytics': '견적 분석',
    '/profile': '내 프로필',
    '/settings': '시스템 설정'
  };

  return <h1 className="text-2xl font-bold text-gray-900">{titles[location.pathname] || '3D 견적 솔루션'}</h1>;
}

export default App;