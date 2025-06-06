import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate2: React.FC<QuotationTemplateProps> = ({ data }) => {
  // 총액 계산
  const calculateTotal = () => {
    if (!data.items || data.items.length === 0) {
      return data.amount;
    }
    return data.items.reduce((sum, item) => sum + item.amount, 0);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // 금액 포맷팅 (천 단위 콤마)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="w-[210mm] min-h-[297mm] p-10 font-sans text-gray-800">
      {/* 헤더 - 청록색 테마 */}
      <div className="bg-teal-500 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">견적서</h1>
            <p className="text-teal-100 mt-1">Quotation</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">{data.companyInfo?.name}</h2>
            <p className="text-sm mt-1 text-teal-100">{data.companyInfo?.address}</p>
            <p className="text-sm text-teal-100">{data.companyInfo?.phone}</p>
          </div>
        </div>
      </div>

      {/* 견적 정보 */}
      <div className="bg-white border-l border-r border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-teal-600 border-b pb-2">견적 대상</h3>
            <div className="space-y-1">
              <p className="font-medium">{data.clientInfo?.name}</p>
              <p className="text-sm">{data.clientInfo?.address}</p>
              <p className="text-sm">{data.clientInfo?.phone}</p>
              <p className="text-sm">{data.clientInfo?.email}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-teal-600 border-b pb-2">견적 정보</h3>
            <div className="grid grid-cols-2 gap-y-2">
              <p className="text-sm font-medium">견적번호:</p>
              <p className="text-sm">{data.id}</p>
              
              <p className="text-sm font-medium">견적명:</p>
              <p className="text-sm">{data.title}</p>
              
              <p className="text-sm font-medium">견적일자:</p>
              <p className="text-sm">{new Date().toLocaleDateString('ko-KR')}</p>
              
              <p className="text-sm font-medium">유효기간:</p>
              <p className="text-sm">{formatDate(data.dueDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 견적 항목 */}
      <div className="bg-white border-l border-r border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-3 text-teal-600 border-b pb-2">견적 항목</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-teal-50">
              <th className="border border-teal-100 p-2 text-left text-teal-700">항목</th>
              <th className="border border-teal-100 p-2 text-center text-teal-700">수량</th>
              <th className="border border-teal-100 p-2 text-right text-teal-700">단가</th>
              <th className="border border-teal-100 p-2 text-right text-teal-700">금액</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-teal-50'}>
                <td className="border border-teal-100 p-2 text-left">{item.description}</td>
                <td className="border border-teal-100 p-2 text-center">{item.quantity}</td>
                <td className="border border-teal-100 p-2 text-right">{formatCurrency(item.unitPrice)}원</td>
                <td className="border border-teal-100 p-2 text-right">{formatCurrency(item.amount)}원</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-teal-100 font-semibold">
              <td colSpan={3} className="border border-teal-200 p-2 text-right text-teal-800">합계</td>
              <td className="border border-teal-200 p-2 text-right text-teal-800">{formatCurrency(calculateTotal())}원</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 참고사항 */}
      <div className="bg-white border-l border-r border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-3 text-teal-600 border-b pb-2">참고사항</h3>
        <div className="bg-teal-50 p-4 rounded text-sm border border-teal-100">
          <p>1. 본 견적서의 유효기간은 발행일로부터 30일입니다.</p>
          <p>2. 견적 금액은 부가가치세가 포함된 금액입니다.</p>
          <p>3. 최종 계약 시 세부 사항은 변경될 수 있습니다.</p>
        </div>
      </div>

      {/* 서명 */}
      <div className="bg-white border-l border-r border-b border-gray-200 p-6 rounded-b-lg">
        <div className="mt-8 text-center">
          <p className="mb-6">위와 같이 견적합니다.</p>
          <p className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</p>
          <p className="mt-4 font-semibold text-lg text-teal-700">{data.companyInfo?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate2;
