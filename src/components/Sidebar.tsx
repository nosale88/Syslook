import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart as ChartBar, Building2, FolderKanban, FileText, UserCircle, Settings, Menu, MonitorSmartphone, User } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: '대시보드', path: '/' },
    { icon: <ChartBar className="w-5 h-5" />, label: '분석', path: '/analytics' },
    { icon: <Building2 className="w-5 h-5" />, label: '업체 관리', path: '/vendors' },
    { icon: <FolderKanban className="w-5 h-5" />, label: '프로젝트', path: '/projects' },
    { icon: <FileText className="w-5 h-5" />, label: '견적서', path: '/quotes' },
    { icon: <UserCircle className="w-5 h-5" />, label: '사용자', path: '/users' },
    { icon: <MonitorSmartphone className="w-5 h-5" />, label: '시스템 관리', path: '/systems' },
    { icon: <User className="w-5 h-5" />, label: '내 프로필', path: '/profile' },
    { icon: <Settings className="w-5 h-5" />, label: '설정', path: '/settings' }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Syslook</h1>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 ${
              location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;