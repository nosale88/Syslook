import React, { useState } from 'react';
import { sampleEquipment } from '../data/mockData';
import { ComparisonItem, Equipment } from '../types';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  budget: number;
  attendees: number;
  eventType: string;
}

const EquipmentRecommendations: React.FC<Props> = ({ budget, attendees, eventType }) => {
  const [comparisonList, setComparisonList] = useState<ComparisonItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const recommendedEquipment = sampleEquipment.filter(item => item.price <= budget * 0.3);

  const toggleComparison = (equipmentId: string) => {
    setComparisonList(prev => {
      const exists = prev.find(item => item.id === equipmentId);
      if (exists) {
        return prev.filter(item => item.id !== equipmentId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, { id: equipmentId, selected: true }];
    });
  };

  const toggleExpand = (equipmentId: string) => {
    setExpandedItems(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const renderSpecifications = (equipment: Equipment) => {
    if (!equipment.specs) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <h4 className="font-semibold text-sm">상세 사양</h4>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(equipment.specs).map(([key, value]) => (
            <React.Fragment key={key}>
              <dt className="text-gray-600">{key}</dt>
              <dd className="font-medium">{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    );
  };

  const renderComparisonTable = () => {
    if (comparisonList.length === 0) return null;

    const comparedEquipment = comparisonList
      .map(item => sampleEquipment.find(eq => eq.id === item.id))
      .filter((item): item is Equipment => item !== undefined);

    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">장비 비교</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">특성</th>
                {comparedEquipment.map(equipment => (
                  <th key={equipment.id} className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    {equipment.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 text-sm text-gray-500">가격</td>
                {comparedEquipment.map(equipment => (
                  <td key={equipment.id} className="px-4 py-2 text-sm">
                    {equipment.price.toLocaleString()}원
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-gray-500">카테고리</td>
                {comparedEquipment.map(equipment => (
                  <td key={equipment.id} className="px-4 py-2 text-sm">
                    {equipment.category}
                  </td>
                ))}
              </tr>
              {comparedEquipment[0]?.specs && Object.keys(comparedEquipment[0].specs).map(specKey => (
                <tr key={specKey}>
                  <td className="px-4 py-2 text-sm text-gray-500">{specKey}</td>
                  {comparedEquipment.map(equipment => (
                    <td key={equipment.id} className="px-4 py-2 text-sm">
                      {equipment.specs?.[specKey] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">추천 장비 목록</h3>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showComparison ? '비교 종료' : '장비 비교하기'}
        </button>
      </div>

      {recommendedEquipment.map(item => (
        <div key={item.id} className="border rounded-lg overflow-hidden">
          <div className="flex items-start p-4">
            <div className="flex-shrink-0 w-24 h-24">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="ml-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {item.price.toLocaleString()}원
                  </p>
                </div>
                {showComparison && (
                  <button
                    onClick={() => toggleComparison(item.id)}
                    className={`ml-4 p-2 rounded-full ${
                      comparisonList.find(i => i.id === item.id)
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {comparisonList.find(i => i.id === item.id) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
              <button
                onClick={() => toggleExpand(item.id)}
                className="mt-2 text-sm text-gray-600 flex items-center"
              >
                {expandedItems.includes(item.id) ? (
                  <>
                    상세정보 접기 <ChevronUp className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    상세정보 보기 <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
          {expandedItems.includes(item.id) && (
            <div className="px-4 pb-4 border-t">
              {renderSpecifications(item)}
              {item.alternatives && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">대체 가능 장비</h4>
                  <ul className="text-sm text-gray-600">
                    {item.alternatives.map((alt, index) => (
                      <li key={index}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {showComparison && renderComparisonTable()}

      {recommendedEquipment.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          현재 예산에 맞는 장비 추천이 없습니다.
        </p>
      )}
    </div>
  );
};

export default EquipmentRecommendations;