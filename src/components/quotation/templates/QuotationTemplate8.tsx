import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';
import BaseTemplate from './BaseTemplate';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate8: React.FC<QuotationTemplateProps> = ({ data }) => {
  return (
    <BaseTemplate data={data}>
      {/* 견적 설명 */}
      {data.description && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b border-blue-200 pb-2">견적 설명</h3>
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <p>{data.description}</p>
          </div>
        </div>
      )}

      {/* 계약 조건 */}
      {data.terms && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b border-blue-200 pb-2">계약 조건</h3>
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <p>{data.terms}</p>
          </div>
        </div>
      )}

      {/* 참고사항 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b border-blue-200 pb-2">참고사항</h3>
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <p className="mb-2">1. 본 견적서의 유효기간은 발행일로부터 30일입니다.</p>
          <p className="mb-2">2. 견적 금액은 부가가치세가 포함된 금액입니다.</p>
          <p>3. 최종 계약 시 세부 사항은 변경될 수 있습니다.</p>
        </div>
      </div>
    </BaseTemplate>
  );
};

export default QuotationTemplate8;
