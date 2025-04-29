import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate3: React.FC<QuotationTemplateProps> = ({ data }) => {
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
    <div className="w-[210mm] min-h-[297mm] font-sans text-gray-800">
      {/* 헤더 - 모던 블루 테마 */}
      <div className="bg-blue-700 text-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">견적서</h1>
            <p className="text-blue-200 mt-1">Quotation</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{data.companyInfo?.name}</h2>
          </div>
        </div>
      </div>

      {/* 견적 정보 - 그리드 레이아웃 */}
      <div className="p-8 bg-white">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-200 pb-2">견적 대상</h3>
            <div className="space-y-2">
              <p className="font-medium text-lg">{data.clientInfo?.name}</p>
              <p>{data.clientInfo?.address}</p>
              <p>{data.clientInfo?.phone}</p>
              <p>{data.clientInfo?.email}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-200 pb-2">견적 정보</h3>
            <div className="grid grid-cols-2 gap-y-3">
              <p className="font-medium">견적번호:</p>
              <p>{data.id}</p>
              
              <p className="font-medium">견적명:</p>
              <p>{data.title}</p>
              
              <p className="font-medium">견적일자:</p>
              <p>{new Date().toLocaleDateString('ko-KR')}</p>
              
              <p className="font-medium">유효기간:</p>
              <p>{formatDate(data.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* 견적 항목 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">견적 항목</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-blue-600 text-white p-3 text-left rounded-tl-lg">항목</th>
                <th className="bg-blue-600 text-white p-3 text-center">수량</th>
                <th className="bg-blue-600 text-white p-3 text-right">단가</th>
                <th className="bg-blue-600 text-white p-3 text-right rounded-tr-lg">금액</th>
              </tr>
            </thead>
            <tbody>
              {data.items && data.items.map((item, index) => (
                <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="border-b border-blue-100 p-3 text-left">{item.description}</td>
                  <td className="border-b border-blue-100 p-3 text-center">{item.quantity}</td>
                  <td className="border-b border-blue-100 p-3 text-right">{formatCurrency(item.unitPrice)}원</td>
                  <td className="border-b border-blue-100 p-3 text-right">{formatCurrency(item.amount)}원</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="p-3 text-right font-semibold bg-blue-100">합계</td>
                <td className="p-3 text-right font-semibold bg-blue-100 text-blue-800 rounded-br-lg">{formatCurrency(calculateTotal())}원</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 참고사항 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">참고사항</h3>
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 text-blue-800">
            <p className="mb-2">1. 본 견적서의 유효기간은 발행일로부터 30일입니다.</p>
            <p className="mb-2">2. 견적 금액은 부가가치세가 포함된 금액입니다.</p>
            <p>3. 최종 계약 시 세부 사항은 변경될 수 있습니다.</p>
          </div>
        </div>

        {/* 서명 */}
        <div className="mt-12 text-center">
          <p className="mb-6 text-lg">위와 같이 견적합니다.</p>
          <p className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</p>
          <div className="mt-6 inline-block border-t-2 border-blue-700 pt-2">
            <p className="font-bold text-xl text-blue-700">{data.companyInfo?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate3;
