import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';
import BaseTemplate from './BaseTemplate';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate4: React.FC<QuotationTemplateProps> = ({ data }) => {
  // 금액 포맷팅 (천 단위 콤마)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 총액 계산
  const calculateTotal = () => {
    if (!data.items || data.items.length === 0) {
      return data.amount;
    }
    return data.items.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="w-[210mm] min-h-[297mm] p-10 font-sans text-gray-800">
      {/* 헤더 - 다크 테마 */}
      <div className="bg-gray-800 text-white p-8 rounded-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">견적서</h1>
            <p className="text-gray-400 mt-1">Quotation</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">{data.companyInfo?.name}</h2>
            <p className="text-sm mt-1 text-gray-400">{data.companyInfo?.address}</p>
            <p className="text-sm text-gray-400">{data.companyInfo?.phone}</p>
          </div>
        </div>
      </div>

      {/* 견적 정보 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">견적 대상</h3>
          <div className="space-y-2">
            <p className="font-medium">{data.clientInfo?.name}</p>
            <p className="text-sm">{data.clientInfo?.address}</p>
            <p className="text-sm">{data.clientInfo?.phone}</p>
            <p className="text-sm">{data.clientInfo?.email}</p>
          </div>
        </div>
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">견적 정보</h3>
          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-sm font-medium">견적번호:</p>
            <p className="text-sm">{data.id}</p>
            
            <p className="text-sm font-medium">견적명:</p>
            <p className="text-sm">{data.title}</p>
            
            <p className="text-sm font-medium">견적일자:</p>
            <p className="text-sm">{new Date().toLocaleDateString('ko-KR')}</p>
            
            <p className="text-sm font-medium">유효기간:</p>
            <p className="text-sm">{data.dueDate}</p>
          </div>
        </div>
      </div>

      {/* 견적 항목 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">견적 항목</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left rounded-tl-lg">항목</th>
              <th className="p-3 text-center">수량</th>
              <th className="p-3 text-right">단가</th>
              <th className="p-3 text-right rounded-tr-lg">금액</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border-b p-3 text-left">{item.description}</td>
                <td className="border-b p-3 text-center">{item.quantity}</td>
                <td className="border-b p-3 text-right">{formatCurrency(item.unitPrice)}원</td>
                <td className="border-b p-3 text-right">{formatCurrency(item.amount)}원</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-3 text-right font-semibold bg-gray-200">합계</td>
              <td className="p-3 text-right font-semibold bg-gray-800 text-white rounded-br-lg">{formatCurrency(calculateTotal())}원</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 참고사항 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">참고사항</h3>
        <div className="bg-gray-100 p-5 rounded-lg border border-gray-300">
          <p className="mb-2">1. 본 견적서의 유효기간은 발행일로부터 30일입니다.</p>
          <p className="mb-2">2. 견적 금액은 부가가치세가 포함된 금액입니다.</p>
          <p>3. 최종 계약 시 세부 사항은 변경될 수 있습니다.</p>
        </div>
      </div>

      {/* 서명 */}
      <div className="mt-12 text-center">
        <p className="mb-6">위와 같이 견적합니다.</p>
        <p className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</p>
        <div className="mt-6 inline-block border-t-2 border-gray-800 pt-2">
          <p className="font-bold text-xl">{data.companyInfo?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate4;
