import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Calculator, Users, PieChart, Package, ChevronDown, ChevronUp, Check, DollarSign, Image } from 'lucide-react';
import { eventTypes, eventTemplates, equipmentDetails, sampleEquipment } from '../data/mockData';
import BudgetAllocationChart from '../components/BudgetAllocationChart';
import EquipmentRecommendations from '../components/EquipmentRecommendations';
import BudgetOptimization from '../components/BudgetOptimization';
import ImageGenerationModal from '../components/ImageGenerationModal';
import { generateImage } from '../services/imageGenerationService';

function Dashboard() {
  const defaultEventType = eventTypes[0] || '기업 세미나';
  const [eventDetails, setEventDetails] = React.useState({
    type: defaultEventType,
    customType: '',
    attendees: 100,
    budget: 10000000,
    vipCount: 0
  });

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const selectedEquipmentItems = useMemo(() => {
    return sampleEquipment.filter(equipment => selectedEquipment.includes(equipment.id));
  }, [selectedEquipment]);

  const totalSelectedEquipmentPrice = useMemo(() => {
    return selectedEquipmentItems.reduce((total, equipment) => total + equipment.price, 0);
  }, [selectedEquipmentItems]);

  const handleGenerateImage = useCallback(async () => {
    if (selectedEquipment.length === 0) {
      alert('이미지를 생성하려면 최소 하나 이상의 장비를 선택해주세요.');
      return;
    }

    try {
      setIsGeneratingImage(true);
      setImageError(null);
      setIsImageModalOpen(true);

      // 선택된 장비 이름 목록 생성
      const equipmentNames = selectedEquipmentItems.map(item => item.name);
      
      // 프롬프트 생성
      const basePrompt = `${eventDetails.type} 행사를 위한 장비 세팅 이미지`;
      setImagePrompt(basePrompt);
      
      // 이미지 생성 API 호출
      const result = await generateImage({
        prompt: basePrompt,
        selectedEquipment: equipmentNames
      });
      
      setGeneratedImageUrl(result.imageUrl);
      setImagePrompt(result.prompt);
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      setImageError(error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [selectedEquipment, selectedEquipmentItems, eventDetails.type]);

  const currentTemplate = eventTemplates[eventDetails.type] ?? eventTemplates['기업 세미나'] ?? {
    budgetAllocations: [],
    minAttendees: 0,
    maxAttendees: 1000
  };

  return (
    <div className="space-y-8">
      {/* 이벤트 상세 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="mr-2" /> 이벤트 정보
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
                <Calculator className="h-5 w-5 text-gray-400" />
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
            <PieChart className="mr-2" /> 예산 배분
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

      {/* 장비 선택 및 총액 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Package className="mr-2" /> 장비 선택
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
              <DollarSign className="mr-2 h-5 w-5" />
              <span className="font-semibold">선택된 장비 총액: {totalSelectedEquipmentPrice.toLocaleString()}원</span>
            </div>
            <button
              onClick={handleGenerateImage}
              disabled={selectedEquipment.length === 0 || isGeneratingImage}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${selectedEquipment.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
            >
              <Image className="mr-2 h-5 w-5" />
              <span className="font-medium">AI 이미지 생성</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(equipmentDetails).map(([category, items]) => (
            <div key={category} className="bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-800">{category}</span>
                {expandedCategories.includes(category) ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {expandedCategories.includes(category) && (
                <div className="p-4 space-y-2">
                  {sampleEquipment
                    .filter(equipment => equipment.category === category)
                    .map(equipment => {
                      const isSelected = selectedEquipment.includes(equipment.id);
                      return (
                        <div
                          key={equipment.id}
                          onClick={() => toggleEquipmentSelection(equipment.id)}
                          className={`flex justify-between items-center text-sm py-2 px-3 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span>{equipment.name}</span>
                          </div>
                          <span className="font-medium">{equipment.price.toLocaleString()}원</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 장비 추천 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="mr-2" /> 추천 장비
          </h2>
          <EquipmentRecommendations
            budget={eventDetails.budget}
            attendees={eventDetails.attendees}
            eventType={eventDetails.type}
          />
        </div>

        {/* 이미지 생성 모달 */}
        <ImageGenerationModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={generatedImageUrl}
          prompt={imagePrompt}
          isLoading={isGeneratingImage}
          error={imageError}
        />
      </div>
    );
}

export default Dashboard;