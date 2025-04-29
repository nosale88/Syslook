import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate1: React.FC<QuotationTemplateProps> = ({ data }) => {
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
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">견적서</h1>
          <p className="text-gray-500 mt-1">Quotation</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{data.companyInfo?.name}</h2>
          <p className="text-sm mt-1">{data.companyInfo?.address}</p>
          <p className="text-sm">{data.companyInfo?.phone}</p>
          <p className="text-sm">{data.companyInfo?.email}</p>
        </div>
      </div>

      {/* 견적 정보 */}
      <div className="flex justify-between mb-8">
        <div className="w-1/2 pr-4">
          <h3 className="text-lg font-semibold mb-2">견적 대상</h3>
          <div className="border rounded p-4 bg-gray-50">
            <p className="font-medium">{data.clientInfo?.name}</p>
            <p className="text-sm mt-1">{data.clientInfo?.address}</p>
            <p className="text-sm">{data.clientInfo?.phone}</p>
            <p className="text-sm">{data.clientInfo?.email}</p>
          </div>
        </div>
        <div className="w-1/2 pl-4">
          <h3 className="text-lg font-semibold mb-2">견적 정보</h3>
          <div className="border rounded p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
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
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">견적 항목</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="border p-2 text-left">항목</th>
              <th className="border p-2 text-center">수량</th>
              <th className="border p-2 text-right">단가</th>
              <th className="border p-2 text-right">금액</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border p-2 text-left">{item.description}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2 text-right">{formatCurrency(item.unitPrice)}원</td>
                <td className="border p-2 text-right">{formatCurrency(item.amount)}원</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={3} className="border p-2 text-right">합계</td>
              <td className="border p-2 text-right">{formatCurrency(calculateTotal())}원</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 참고사항 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">참고사항</h3>
        <div className="border rounded p-4 bg-gray-50 text-sm">
          <p>1. 본 견적서의 유효기간은 발행일로부터 30일입니다.</p>
          <p>2. 견적 금액은 부가가치세가 포함된 금액입니다.</p>
          <p>3. 최종 계약 시 세부 사항은 변경될 수 있습니다.</p>
        </div>
      </div>

      {/* 서명 */}
      <div className="mt-12 text-center">
        <p className="mb-8">위와 같이 견적합니다.</p>
        <p className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</p>
        <p className="mt-4 font-semibold text-lg">{data.companyInfo?.name}</p>
      </div>
    </div>
  );
};

export default QuotationTemplate1;
