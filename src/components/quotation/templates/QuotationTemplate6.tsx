import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate6: React.FC<QuotationTemplateProps> = ({ data }) => {
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
    <div className="w-[210mm] min-h-[297mm] font-sans text-gray-800">
      {/* 헤더 - 모던 미니멀 디자인 */}
      <div className="bg-gray-900 text-white p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">견적서</h1>
              <p className="text-gray-400 mt-2">Quotation</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">{data.companyInfo?.name}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-10">
        {/* 견적 정보 */}
        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">견적 대상</h3>
            <div className="space-y-2">
              <p className="font-medium text-lg">{data.clientInfo?.name}</p>
              <p className="text-gray-600">{data.clientInfo?.address}</p>
              <p className="text-gray-600">{data.clientInfo?.phone}</p>
              <p className="text-gray-600">{data.clientInfo?.email}</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">견적 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">견적번호:</span>
                <span>{data.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">견적명:</span>
                <span>{data.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">견적일자:</span>
                <span>{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">유효기간:</span>
                <span>{data.dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 견적 항목 */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">견적 항목</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-3 text-left">항목</th>
                <th className="py-3 text-center">수량</th>
                <th className="py-3 text-right">단가</th>
                <th className="py-3 text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              {data.items && data.items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-200">
                  <td className="py-4 text-left">{item.description}</td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">{formatCurrency(item.unitPrice)}원</td>
                  <td className="py-4 text-right">{formatCurrency(item.amount)}원</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-4 text-right font-semibold">합계</td>
                <td className="py-4 text-right font-bold text-xl">{formatCurrency(calculateTotal())}원</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 견적 설명 */}
        {data.description && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-purple-600 border-b border-purple-200 pb-2">견적 설명</h3>
            <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
              <p>{data.description}</p>
            </div>
          </div>
        )}

        {/* 계약 조건 */}
        {data.terms && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-purple-600 border-b border-purple-200 pb-2">계약 조건</h3>
            <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
              <p>{data.terms}</p>
            </div>
          </div>
        )}

        {/* 참고사항 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-purple-600 border-b border-purple-200 pb-2">참고사항</h3>
          <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
            <p className="mb-2">1. 본 견적서의 유효기간은 발행일로부터 30일입니다.</p>
            <p className="mb-2">2. 견적 금액은 부가가치세가 포함된 금액입니다.</p>
            <p>3. 최종 계약 시 세부 사항은 변경될 수 있습니다.</p>
          </div>
        </div>

        {/* 서명 */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-gray-600">위와 같이 견적합니다.</p>
          <p className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</p>
          <div className="mt-8 inline-block border-t border-gray-400 pt-4">
            <p className="font-bold text-xl">{data.companyInfo?.name}</p>
            <p className="text-gray-600 mt-1">{data.companyInfo?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate6;
