import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate9: React.FC<QuotationTemplateProps> = ({ data }) => {
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
    <div className="w-[210mm] min-h-[297mm] p-10 font-['Helvetica',_'Arial',_sans-serif] text-gray-700 bg-orange-50">
      {/* 헤더 - 웜 오렌지 테마 */}
      <div className="flex justify-between items-center pb-5 mb-8 border-b-4 border-orange-600">
        <div>
          <h1 className="text-4xl font-extrabold text-orange-700">견 적 서</h1>
          <p className="text-orange-500 mt-1 text-sm">QUOTATION</p>
        </div>
        <div className="text-right">
          {data.companyInfo?.logo && <img src={data.companyInfo.logo} alt="Company Logo" className="h-12 mb-2 ml-auto rounded"/>}
          <h2 className="text-xl font-bold text-orange-700">{data.companyInfo?.name}</h2>
          <p className="text-xs mt-1 text-gray-600">{data.companyInfo?.address}</p>
          <p className="text-xs text-gray-600">Tel: {data.companyInfo?.phone} / Email: {data.companyInfo?.email}</p>
        </div>
      </div>

      {/* 견적 정보 - 라이트 오렌지 배경 박스 */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-10">
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-500">
          <h3 className="text-md font-semibold mb-3 text-orange-600 border-b border-orange-200 pb-2">CLIENT DETAILS</h3>
          <p className="font-semibold text-sm text-gray-800">{data.clientInfo?.name}</p>
          <p className="text-xs mt-1 text-gray-600">{data.clientInfo?.address}</p>
          <p className="text-xs text-gray-600">Tel: {data.clientInfo?.phone}</p>
          <p className="text-xs text-gray-600">Email: {data.clientInfo?.email}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-500">
          <h3 className="text-md font-semibold mb-3 text-orange-600 border-b border-orange-200 pb-2">QUOTATION INFO</h3>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <span className="font-medium text-gray-600">견적번호:</span><span className="text-gray-800">{data.id}</span>
            <span className="font-medium text-gray-600">견적명:</span><span className="text-gray-800">{data.title}</span>
            <span className="font-medium text-gray-600">견적일자:</span><span className="text-gray-800">{new Date().toLocaleDateString('ko-KR')}</span>
            <span className="font-medium text-gray-600">유효기간:</span><span className="text-gray-800">{formatDate(data.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* 견적 항목 - 테이블 헤더 오렌지 */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-orange-600">견적 항목 (ITEMS)</h3>
        <table className="w-full border-collapse text-sm shadow-sm rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="border-b border-orange-300 p-3 font-semibold text-left">품목</th>
              <th className="border-b border-orange-300 p-3 font-semibold text-center w-20">수량</th>
              <th className="border-b border-orange-300 p-3 font-semibold text-right w-32">단가</th>
              <th className="border-b border-orange-300 p-3 font-semibold text-right w-36">금액</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.items && data.items.map((item, index) => (
              <tr key={item.id || index} className={`border-b ${index % 2 === 0 ? 'border-orange-100' : 'bg-orange-50 border-orange-100'}`}>
                <td className="p-3 text-left text-gray-700">{item.description}</td>
                <td className="p-3 text-center text-gray-700">{item.quantity}</td>
                <td className="p-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}원</td>
                <td className="p-3 text-right text-gray-700 font-medium">{formatCurrency(item.amount)}원</td>
              </tr>
            ))}
            {(!data.items || data.items.length === 0) && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400 italic">견적 항목이 없습니다.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-orange-100 font-bold text-orange-700">
              <td colSpan={3} className="p-3 text-right">총 합계 (TOTAL AMOUNT)</td>
              <td className="p-3 text-right text-base">{formatCurrency(calculateTotal())}원</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 참고사항 - 오렌지 강조 */}
      <div className="mb-8">
        <h3 className="text-md font-semibold mb-2 text-orange-600">참고사항 (REMARKS)</h3>
        <div className="border-t-2 border-orange-500 rounded bg-white p-5 text-xs shadow-sm">
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>본 견적서의 유효기간은 명시된 유효기간까지입니다.</li>
            <li>상기 금액은 부가가치세(VAT)가 포함된 금액입니다.</li>
            <li>계약 조건 및 내용은 상호 협의 하에 변경될 수 있습니다.</li>
            {data.terms && <li className="mt-1 pt-1 border-t border-orange-100">기타 조건: {data.terms}</li>}
          </ul>
        </div>
      </div>

      {/* 하단 회사 정보 및 서명 */}
      <div className="mt-12 pt-6 border-t-2 border-dashed border-orange-400 flex justify-between items-end">
        <div className="text-xs text-gray-500">
          <p>위와 같이 견적합니다.</p>
          <p className="mt-1">작성일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-orange-700">{data.companyInfo?.name}</p>
          <div className="w-48 h-16 mt-2 text-gray-400 text-xs flex items-end justify-center">
            <span className="italic">(서명 또는 날인)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate9;
