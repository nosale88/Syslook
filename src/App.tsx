import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Vendors from './pages/Vendors';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import Users from './pages/Users';
import Settings from './pages/Settings';
import LoginForm from './components/auth/LoginForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import { useAuth } from './contexts/AuthContext';
import ChatIcon from './components/chat/ChatIcon';

// 새로 추가한 컴포넌트들
import SystemList from './components/systems/SystemList';
import SystemDetail from './components/systems/SystemDetail';
import SystemForm from './components/systems/SystemForm';
import ProfileForm from './components/profile/ProfileForm';
import DataFetchExample from './components/examples/DataFetchExample';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, loading } = useAuth();

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  // If authenticated, show the app
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-300 ease-in-out`}>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <PageTitle />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* 시스템 관리 라우트 */}
            <Route path="/systems" element={<SystemList />} />
            <Route path="/systems/new" element={<SystemForm />} />
            <Route path="/systems/:id" element={<SystemDetail />} />
            <Route path="/systems/:id/edit" element={<SystemForm isEditing={true} />} />
            
            {/* 프로필 관리 라우트 */}
            <Route path="/profile" element={<ProfileForm />} />
            
            {/* 예제 컴포넌트 */}
            <Route path="/examples/data-fetch" element={<DataFetchExample />} />
            <Route path="/settings" element={<Settings />} />
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
        <Route path="/login" element={<LoginForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

function PageTitle() {
  const location = useLocation();
  const titles: { [key: string]: string } = {
    '/': '대시보드',
    '/analytics': '분석',
    '/vendors': '업체 관리',
    '/projects': '프로젝트',
    '/quotes': '견적서',
    '/users': '사용자',
    '/settings': '설정'
  };

  return <h1 className="text-2xl font-bold text-gray-900">{titles[location.pathname]}</h1>;
}

export default App;