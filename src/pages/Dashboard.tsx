import React, { useState, useMemo } from 'react';
import { Calculator, Boxes, FileText, TrendingUp, Users, Package, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventTypes, eventTemplates, equipmentDetails, sampleEquipment } from '../data/mockData';
import BudgetAllocationChart from '../components/BudgetAllocationChart';
import EquipmentRecommendations from '../components/EquipmentRecommendations';
import BudgetOptimization from '../components/BudgetOptimization';

function Dashboard() {
  const navigate = useNavigate();
  const defaultEventType = eventTypes[0] || '기업 세미나';
  const [eventDetails, setEventDetails] = React.useState({
    type: defaultEventType,
    customType: '',
    attendees: 100,
    budget: 10000000,
    vipCount: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const template = eventTemplates[eventDetails.type];
    
    if (name === 'attendees' && template) {
      const attendees = Math.max(template.minAttendees, Math.min(Number(value), template.maxAttendees));
      setEventDetails(prev => ({ ...prev, [name]: attendees }));
    } else {
      setEventDetails(prev => ({
        ...prev,
        [name]: name === 'type' ? value : Number(value)
      }));
    }
  };

  const currentTemplate = eventTemplates[eventDetails.type] ?? eventTemplates['기업 세미나'] ?? {
    budgetAllocations: [],
    minAttendees: 0,
    maxAttendees: 1000
  };

  // 빠른 통계
  const quickStats = [
    {
      title: '총 예산',
      value: `${(eventDetails.budget / 10000).toFixed(0)}만원`,
      icon: <span className="w-6 h-6 flex items-center justify-center text-lg font-bold">₩</span>,
      color: 'bg-blue-500'
    },
    {
      title: '참석자 수',
      value: `${eventDetails.attendees}명`,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: '1인당 예산',
      value: `${Math.round(eventDetails.budget / eventDetails.attendees).toLocaleString()}원`,
      icon: <Calculator className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: '장비 카테고리',
      value: `${Object.keys(equipmentDetails).length}개`,
      icon: <Package className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">3D 견적 계산기</h1>
            <p className="text-blue-100">시각적으로 무대를 구성하고 정확한 견적을 받아보세요</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/configurator')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
            >
              <Boxes className="w-5 h-5 mr-2" />
              3D 도구 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => navigate('/equipment')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors flex items-center"
            >
              <Package className="w-5 h-5 mr-2" />
              장비 카탈로그
            </button>
          </div>
        </div>
      </div>

      {/* 빠른 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} text-white p-3 rounded-lg mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 이벤트 상세 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Calculator className="mr-2" /> 견적 계산 설정
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이벤트 유형</label>
              <select
                name="type"
                value={eventDetails.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {eventDetails.type === '직접 입력' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">직접 입력</label>
                <input
                  type="text"
                  name="customType"
                  value={eventDetails.customType}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, customType: e.target.value }))}
                  placeholder="이벤트 유형을 입력하세요"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">총 예산</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="h-5 w-5 text-gray-400 flex items-center justify-center text-sm font-bold">₩</span>
              </div>
              <input
                type="number"
                name="budget"
                value={eventDetails.budget}
                onChange={handleInputChange}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">참석자 수</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="attendees"
                value={eventDetails.attendees}
                onChange={handleInputChange}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">VIP 참석자 수</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="vipCount"
                value={eventDetails.vipCount}
                onChange={handleInputChange}
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 예산 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2" /> 예산 배분 분석
          </h2>
          <BudgetAllocationChart
            budget={eventDetails.budget}
            allocations={currentTemplate?.budgetAllocations || []}
          />
        </div>

        <div className="lg:col-span-1">
          <BudgetOptimization
            budget={eventDetails.budget}
            attendees={eventDetails.attendees}
            eventType={eventDetails.type}
            template={currentTemplate}
          />
        </div>
      </div>

      {/* 빠른 액션 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/configurator')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center mb-4">
            <Boxes className="w-8 h-8 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold">3D 견적 도구</h3>
          </div>
          <p className="text-gray-600 mb-4">시각적으로 무대를 구성하고 실시간으로 견적을 확인하세요</p>
          <div className="flex items-center text-blue-500 font-medium">
            시작하기 <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/quotes')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold">견적서 관리</h3>
          </div>
          <p className="text-gray-600 mb-4">생성된 견적서를 관리하고 고객에게 전송하세요</p>
          <div className="flex items-center text-green-500 font-medium">
            관리하기 <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/equipment')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <div className="flex items-center mb-4">
            <Package className="w-8 h-8 text-purple-500 mr-3" />
            <h3 className="text-lg font-semibold">장비 카탈로그</h3>
          </div>
          <p className="text-gray-600 mb-4">사용 가능한 모든 장비와 가격을 확인하세요</p>
          <div className="flex items-center text-purple-500 font-medium">
            둘러보기 <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      </div>

      {/* 장비 추천 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="mr-2" /> 추천 장비
        </h2>
        <EquipmentRecommendations
          budget={eventDetails.budget}
          attendees={eventDetails.attendees}
          eventType={eventDetails.type}
        />
      </div>
    </div>
  );
}

export default Dashboard;