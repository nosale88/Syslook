import React, { useState, useMemo } from 'react';
import { Package, Search, Filter, Eye, Plus, Ruler, Weight } from 'lucide-react';
import { sampleEquipment, equipmentDetails } from '../data/mockData';
import SearchInput from '../components/SearchInput';

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  specifications?: {
    dimensions?: string;
    weight?: string;
    power?: string;
    capacity?: string;
  };
  image?: string;
  availability: 'available' | 'limited' | 'unavailable';
  supplier?: string;
}

// 확장된 장비 데이터
const extendedEquipment: EquipmentItem[] = [
  ...sampleEquipment.map(item => ({
    ...item,
    description: `고품질 ${item.name} - 전문 이벤트용`,
    specifications: {
      dimensions: '가로 × 세로 × 높이',
      weight: '무게 정보',
      power: '전력 소비량',
      capacity: '수용 인원/용량'
    },
    availability: 'available' as const,
    supplier: '시스룩 파트너'
  })),
  // 추가 장비들
  {
    id: 'stage_extension_1',
    name: '무대 확장 모듈',
    category: '무대',
    price: 150000,
    description: '기본 무대에 연결 가능한 확장 모듈',
    specifications: {
      dimensions: '2m × 1m × 0.4m',
      weight: '25kg',
      capacity: '최대 200kg 하중'
    },
    availability: 'available',
    supplier: '스테이지 프로'
  },
  {
    id: 'led_wall_premium',
    name: '프리미엄 LED 월',
    category: '조명',
    price: 800000,
    description: '고해상도 실내용 LED 디스플레이',
    specifications: {
      dimensions: '3m × 2m × 0.1m',
      power: '2.5kW',
      capacity: '4K 해상도'
    },
    availability: 'limited',
    supplier: '디스플레이 테크'
  },
  {
    id: 'wireless_mic_set',
    name: '무선 마이크 세트 (4채널)',
    category: '음향',
    price: 120000,
    description: '전문가용 무선 마이크 시스템',
    specifications: {
      dimensions: '수신기: 30cm × 20cm × 5cm',
      weight: '2.5kg (세트)',
      capacity: '4채널 동시 사용'
    },
    availability: 'available',
    supplier: '사운드 마스터'
  }
];

const Equipment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

  // 카테고리 목록
  const categories = useMemo(() => {
    const cats = ['all', ...Object.keys(equipmentDetails)];
    return cats;
  }, []);

  // 필터링된 장비 목록
  const filteredEquipment = useMemo(() => {
    return extendedEquipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesAvailability = selectedAvailability === 'all' || item.availability === selectedAvailability;
      
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [searchTerm, selectedCategory, selectedAvailability]);

  // 가용성 상태에 따른 스타일
  const getAvailabilityStyle = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return '재고 충분';
      case 'limited':
        return '재고 부족';
      case 'unavailable':
        return '품절';
      default:
        return '확인 필요';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">장비 카탈로그</h2>
          <p className="text-gray-600 mt-1">3D 견적 도구에서 사용할 수 있는 모든 장비를 확인하세요</p>
        </div>
        <div className="text-sm text-gray-500">
          총 {filteredEquipment.length}개 장비
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 검색 */}
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="장비명 또는 설명으로 검색..."
            debounceMs={300}
            showClearButton={true}
            size="md"
          />

          {/* 카테고리 필터 */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 카테고리</option>
              {Object.keys(equipmentDetails).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* 가용성 필터 */}
          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 상태</option>
              <option value="available">재고 충분</option>
              <option value="limited">재고 부족</option>
              <option value="unavailable">품절</option>
            </select>
          </div>
        </div>
      </div>

      {/* 장비 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((equipment) => (
          <div
            key={equipment.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            {/* 장비 이미지 영역 */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>

            {/* 장비 정보 */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {equipment.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityStyle(equipment.availability)}`}>
                  {getAvailabilityText(equipment.availability)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {equipment.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-4 h-4 mr-1 flex items-center justify-center text-xs font-bold text-gray-500">₩</span>
                  <span className="font-semibold text-blue-600">
                    {equipment.price.toLocaleString()}원
                  </span>
                </div>
                
                {equipment.specifications?.dimensions && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Ruler className="w-4 h-4 mr-1" />
                    <span>{equipment.specifications.dimensions}</span>
                  </div>
                )}
                
                {equipment.specifications?.weight && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Weight className="w-4 h-4 mr-1" />
                    <span>{equipment.specifications.weight}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedEquipment(equipment)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  상세보기
                </button>
                <button
                  className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  disabled={equipment.availability === 'unavailable'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {equipment.supplier && (
                <div className="mt-2 text-xs text-gray-400">
                  공급업체: {equipment.supplier}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 장비 상세 모달 */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedEquipment.name}
                </h3>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이미지 */}
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>

                {/* 정보 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">기본 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">카테고리:</span>
                        <span>{selectedEquipment.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">가격:</span>
                        <span className="font-semibold text-blue-600">
                          {selectedEquipment.price.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getAvailabilityStyle(selectedEquipment.availability)}`}>
                          {getAvailabilityText(selectedEquipment.availability)}
                        </span>
                      </div>
                      {selectedEquipment.supplier && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">공급업체:</span>
                          <span>{selectedEquipment.supplier}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEquipment.specifications && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">사양</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedEquipment.description && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">설명</h4>
                  <p className="text-gray-600">{selectedEquipment.description}</p>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={selectedEquipment.availability === 'unavailable'}
                >
                  3D 도구에 추가
                </button>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default Equipment; 