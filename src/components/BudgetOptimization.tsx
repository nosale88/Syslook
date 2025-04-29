import React from 'react';
import { AlertCircle, TrendingDown, CheckCircle } from 'lucide-react';
import { EventTemplate } from '../types';

interface Props {
  budget: number;
  attendees: number;
  eventType: string;
  template: EventTemplate;
}

const BudgetOptimization: React.FC<Props> = ({ budget, attendees, eventType, template }) => {
  const calculateBudgetStatus = () => {
    const perPersonBudget = budget / attendees;
    const recommendedPerPerson = template.defaultBudget / template.minAttendees;
    
    if (perPersonBudget < recommendedPerPerson * 0.7) {
      return 'low';
    } else if (perPersonBudget > recommendedPerPerson * 1.3) {
      return 'high';
    }
    return 'optimal';
  };

  const getOptimizationTips = () => {
    const status = calculateBudgetStatus();
    const tips = {
      low: [
        '참석자 수를 줄이는 것을 고려해보세요',
        '필수 장비에 우선순위를 두고 예산을 배정하세요',
        '대체 가능한 저가 장비를 활용하세요',
        '장비 렌탈 기간을 최적화하세요'
      ],
      high: [
        '고급 장비로 업그레이드하여 행사 품질을 높이세요',
        'VIP 서비스를 추가해보세요',
        '예비 장비를 확보하여 안정성을 높이세요',
        '프리미엄 서비스 옵션을 고려해보세요'
      ],
      optimal: [
        '현재 예산 배분이 적절합니다',
        '장기 렌탈 할인을 고려해보세요',
        '패키지 할인을 활용하세요',
        '예비 예산을 확보하세요'
      ]
    };
    return tips[status];
  };

  const getBudgetStatusColor = () => {
    const status = calculateBudgetStatus();
    return {
      low: 'text-red-600',
      high: 'text-yellow-600',
      optimal: 'text-green-600'
    }[status];
  };

  const getBudgetStatusIcon = () => {
    const status = calculateBudgetStatus();
    return {
      low: <AlertCircle className="w-5 h-5" />,
      high: <TrendingDown className="w-5 h-5" />,
      optimal: <CheckCircle className="w-5 h-5" />
    }[status];
  };

  const getStatusMessage = () => {
    const status = calculateBudgetStatus();
    return {
      low: '예산이 부족합니다',
      high: '예산이 여유있습니다',
      optimal: '예산이 적절합니다'
    }[status];
  };

  const calculateSavings = () => {
    const currentTotal = budget;
    const recommendedTotal = template.defaultBudget;
    const difference = currentTotal - recommendedTotal;
    
    if (difference > 0) {
      return `약 ${Math.abs(difference).toLocaleString()}원을 절약할 수 있습니다`;
    } else if (difference < 0) {
      return `약 ${Math.abs(difference).toLocaleString()}원의 추가 예산이 필요합니다`;
    }
    return '예산이 적절합니다';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">예산 최적화 추천</h2>
      
      <div className="mb-6">
        <div className={`flex items-center ${getBudgetStatusColor()}`}>
          {getBudgetStatusIcon()}
          <span className="ml-2 font-medium">{getStatusMessage()}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{calculateSavings()}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">1인당 예산</h3>
          <p className="text-lg font-bold">
            {Math.round(budget / attendees).toLocaleString()}원
          </p>
          <p className="text-sm text-gray-500">
            추천 1인당 예산: {Math.round(template.defaultBudget / template.minAttendees).toLocaleString()}원
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">최적화 제안</h3>
          <ul className="space-y-2">
            {getOptimizationTips().map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <span className="ml-2 text-gray-600">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">추가 팁</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 성수기/비성수기 가격 차이를 고려하세요</li>
            <li>• 장기 계약 시 할인을 협의해보세요</li>
            <li>• 패키지 상품 활용 시 비용을 절감할 수 있습니다</li>
            <li>• 예비 장비 확보로 돌발 상황에 대비하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetOptimization;