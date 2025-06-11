import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate7: React.FC<QuotationTemplateProps> = ({ data }) => {
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
    <div className="w-[210mm] min-h-[297mm] p-10 font-['Georgia',_serif] text-gray-800 bg-white">
      {/* 헤더 - 클래식 그린 테마 */}
      <div className="flex justify-between items-center pb-6 mb-8 border-b-4 border-green-700">
        <div>
          <h1 className="text-4xl font-bold text-green-700">견 적 서</h1>
          <p className="text-gray-600 mt-1 text-sm">QUOTATION</p>
        </div>
        <div className="text-right">
          {data.companyInfo?.logo && <img src={data.companyInfo.logo} alt="Company Logo" className="h-14 mb-2 ml-auto"/>}
          <h2 className="text-lg font-semibold text-green-700">{data.companyInfo?.name}</h2>
          <p className="text-xs mt-1 text-gray-700">{data.companyInfo?.address}</p>
          <p className="text-xs text-gray-700">Tel: {data.companyInfo?.phone} / Email: {data.companyInfo?.email}</p>
        </div>
      </div>

      {/* 견적 정보 - 라이트 그린 배경 박스 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-base font-semibold mb-3 text-green-600 border-b border-green-200 pb-2">CLIENT INFORMATION</h3>
          <p className="font-medium text-sm text-gray-800">{data.clientInfo?.name}</p>
          <p className="text-xs mt-1 text-gray-600">{data.clientInfo?.address}</p>
          <p className="text-xs text-gray-600">Tel: {data.clientInfo?.phone}</p>
          <p className="text-xs text-gray-600">Email: {data.clientInfo?.email}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-base font-semibold mb-3 text-green-600 border-b border-green-200 pb-2">QUOTATION DETAILS</h3>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-gray-600">견적번호:</span><span className="text-gray-800">{data.id}</span>
            <span className="font-medium text-gray-600">견적명:</span><span className="text-gray-800">{data.title}</span>
            <span className="font-medium text-gray-600">견적일자:</span><span className="text-gray-800">{new Date().toLocaleDateString('ko-KR')}</span>
            <span className="font-medium text-gray-600">유효기간:</span><span className="text-gray-800">{formatDate(data.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* 견적 항목 - 테이블 헤더 라이트 그린 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-green-600">견적 항목 / ITEMS</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-green-200 text-green-800">
              <th className="border border-green-300 p-3 font-medium text-left">품목 (Description)</th>
              <th className="border border-green-300 p-3 font-medium text-center w-1/6">수량 (Qty)</th>
              <th className="border border-green-300 p-3 font-medium text-right w-1/5">단가 (Unit Price)</th>
              <th className="border border-green-300 p-3 font-medium text-right w-1/5">금액 (Amount)</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                <td className="border border-green-300 p-3 text-left">{item.description}</td>
                <td className="border border-green-300 p-3 text-center">{item.quantity}</td>
                <td className="border border-green-300 p-3 text-right">{formatCurrency(item.unitPrice)}원</td>
                <td className="border border-green-300 p-3 text-right">{formatCurrency(item.amount)}원</td>
              </tr>
            ))}
            {(!data.items || data.items.length === 0) && (
              <tr>
                <td colSpan={4} className="border border-green-300 p-12 text-center text-gray-500">견적 항목이 없습니다.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-green-100 font-semibold text-green-800">
              <td colSpan={3} className="border border-green-300 p-3 text-right">총 합계 (Total Amount)</td>
              <td className="border border-green-300 p-3 text-right text-base">{formatCurrency(calculateTotal())}원</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 참고사항 - 그린 테두리 */}
      <div className="mb-8">
        <h3 className="text-base font-semibold mb-2 text-green-600">참고사항 / REMARKS</h3>
        <div className="border border-green-300 rounded-lg p-5 text-xs bg-green-50">
          <p className="mb-1">1. 본 견적서의 유효기간은 명시된 유효기간까지입니다.</p>
          <p className="mb-1">2. 상기 금액은 부가가치세(VAT)가 포함된 금액입니다.</p>
          <p>3. 계약 조건 및 내용은 상호 협의 하에 변경될 수 있습니다.</p>
          {data.terms && <p className="mt-2 pt-2 border-t border-green-200">기타 조건: {data.terms}</p>}
        </div>
      </div>

      {/* 하단 회사 정보 및 날인 */} 
      <div className="mt-16 pt-8 border-t-2 border-green-700 flex justify-between items-end">
        <div className="text-xs text-gray-600">
          <p>위와 같이 견적합니다.</p>
          <p className="mt-1">작성일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg text-green-700">{data.companyInfo?.name}</p>
          {/* 날인 공간 또는 실제 도장 이미지 */} 
          <div className="w-24 h-24 border-2 border-dashed border-green-400 ml-auto mt-2 flex items-center justify-center text-gray-400 text-sm">[ 인 ]</div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate7;
