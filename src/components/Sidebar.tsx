import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Boxes, FileText, FolderKanban, BarChart as ChartBar, Building2, 
  Settings, ChevronLeft, ChevronRight, User, Zap, Calculator, Package } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // 3D 견적 도구 서비스에 최적화된 사이드바 아이템
  const sidebarCategories = [
    {
      name: '3D 견적 도구',
      items: [
        { icon: <Boxes className="w-5 h-5" />, label: '3D 견적 도구', path: '/configurator' },
        { icon: <Calculator className="w-5 h-5" />, label: '견적 계산기', path: '/' },
      ]
    },
    {
      name: '견적 관리',
      items: [
        { icon: <FileText className="w-5 h-5" />, label: '견적서 목록', path: '/quotes' },
        { icon: <FolderKanban className="w-5 h-5" />, label: '프로젝트', path: '/projects' },
      ]
    },
    {
      name: '장비 & 업체',
      items: [
        { icon: <Package className="w-5 h-5" />, label: '장비 카탈로그', path: '/equipment' },
        { icon: <Building2 className="w-5 h-5" />, label: '협력 업체', path: '/vendors' },
      ]
    },
    {
      name: '분석 & 리포트',
      items: [
        { icon: <ChartBar className="w-5 h-5" />, label: '견적 분석', path: '/analytics' },
      ]
    },
    {
      name: '설정',
      items: [
        { icon: <User className="w-5 h-5" />, label: '내 프로필', path: '/profile' },
        { icon: <Settings className="w-5 h-5" />, label: '시스템 설정', path: '/settings' },
      ]
    },
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-50 ${isOpen ? 'w-72' : 'w-16'} bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl transition-all duration-300 ease-in-out`}
    >
      {/* 로고 및 헤더 */}
      <div className={`${isOpen ? 'p-6' : 'p-3'} border-b border-gray-700`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className={`${isOpen ? 'w-8 h-8' : 'w-6 h-6'} text-indigo-400 ${isOpen ? 'mr-3' : ''} transition-all duration-300`} />
            {isOpen && (
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Syslook</h1>
            )}
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
        {isOpen && (
          <p className="text-xs text-gray-400 mt-2">3D 견적 솔루션</p>
        )}
      </div>

      {/* 네비게이션 */}
      <div className={`${isOpen ? 'py-6 px-4' : 'py-4 px-2'} h-[calc(100%-100px)] overflow-y-auto`}>
        {sidebarCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            {isOpen && (
              <h2 className="text-xs uppercase font-bold text-gray-400 mb-3 px-4">{category.name}</h2>
            )}
            <nav className="space-y-1">
              {category.items.map((item, itemIndex) => {
                const isActive = location.pathname === item.path;
                const index = categoryIndex * 10 + itemIndex; // 고유 인덱스 생성
                const isHovered = hoveredItem === index;

                return (
                  <div key={index} className="relative group">
                    <button
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4 py-3' : 'justify-center px-2 py-3'} rounded-lg transition-all duration-200 relative ${isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-300 hover:text-white'}`}
                    >
                      {/* 배경 효과 */}
                      {!isActive && isHovered && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg pointer-events-none" />
                      )}

                      {/* 왼쪽 액티브 인디케이터 */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-400 rounded-r-full" />
                      )}
                      
                      {/* 아이콘 */}
                      <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-300'} transition-colors`}>
                        {item.icon}
                      </div>
                      
                      {/* 라벨 */}
                      {isOpen && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </button>
                    
                    {/* 최소화 상태에서 호버 시 툴팁 */}
                    {!isOpen && isHovered && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;