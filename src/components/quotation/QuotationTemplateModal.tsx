import React, { useState, useEffect } from 'react';
import { X, Download, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QuotationTemplate1 from './templates/QuotationTemplate1';
import QuotationTemplate2 from './templates/QuotationTemplate2';
import QuotationTemplate3 from './templates/QuotationTemplate3';
import QuotationTemplate4 from './templates/QuotationTemplate4';
import QuotationTemplate5 from './templates/QuotationTemplate5';
import QuotationTemplate6 from './templates/QuotationTemplate6';
import QuotationTemplate7 from './templates/QuotationTemplate7';
import QuotationTemplate8 from './templates/QuotationTemplate8';
import QuotationTemplate9 from './templates/QuotationTemplate9';

interface QuotationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationData: QuotationData;
}

export interface QuotationData {
  id: string;
  client: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
  description?: string; // 견적 설명
  terms?: string; // 계약 조건
  items?: QuotationItem[];
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  clientInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const QuotationTemplateModal: React.FC<QuotationTemplateModalProps> = ({ isOpen, onClose, quotationData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  
  // 템플릿 썸네일 데이터
  const templates = [
    { id: 1, name: 'Template 1' },
    { id: 2, name: 'Template 2' },
    { id: 3, name: 'Template 3' },
    { id: 4, name: 'Template 4' },
    { id: 5, name: 'Template 5' },
    { id: 6, name: 'Template 6' },
    { id: 7, name: 'Template 7' },
    { id: 8, name: 'Template 8' },
    { id: 9, name: 'Template 9' },
  ];

  // 견적서 항목 기본값 설정
  const defaultItems: QuotationItem[] = [
    {
      id: '1',
      description: '장비 대여',
      quantity: 1,
      unitPrice: quotationData.amount,
      amount: quotationData.amount
    }
  ];

  // 회사 정보 기본값
  const defaultCompanyInfo = {
    name: '시스룩 (Syslook)',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    email: 'contact@syslook.com'
  };

  // 고객 정보 기본값
  const defaultClientInfo = {
    name: quotationData.client,
    address: '고객 주소',
    phone: '고객 연락처',
    email: '고객 이메일'
  };

  // 견적서 데이터 준비
  const preparedQuotationData: QuotationData = {
    ...quotationData,
    items: quotationData.items || defaultItems,
    companyInfo: quotationData.companyInfo || defaultCompanyInfo,
    clientInfo: quotationData.clientInfo || defaultClientInfo
  };

  // PDF 다운로드 함수
  const handleDownloadPDF = async () => {
    const element = document.getElementById('quotation-template');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`견적서_${quotationData.id}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(1);
      setIsPreviewMode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 선택된 템플릿 렌더링
  const renderSelectedTemplate = () => {
    switch (selectedTemplate) {
      case 1:
        return <QuotationTemplate1 data={preparedQuotationData} />;
      case 2:
        return <QuotationTemplate2 data={preparedQuotationData} />;
      case 3:
        return <QuotationTemplate3 data={preparedQuotationData} />;
      case 4:
        return <QuotationTemplate4 data={preparedQuotationData} />;
      case 5:
        return <QuotationTemplate5 data={preparedQuotationData} />;
      case 6:
        return <QuotationTemplate6 data={preparedQuotationData} />;
      case 7:
        return <QuotationTemplate7 data={preparedQuotationData} />;
      case 8:
        return <QuotationTemplate8 data={preparedQuotationData} />;
      case 9:
        return <QuotationTemplate9 data={preparedQuotationData} />;
      default:
        return <QuotationTemplate1 data={preparedQuotationData} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          {isPreviewMode ? (
            <button 
              onClick={() => setIsPreviewMode(false)} 
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              템플릿 선택으로 돌아가기
            </button>
          ) : (
            <h2 className="text-xl font-semibold">견적서 템플릿 선택</h2>
          )}
          
          <div className="flex items-center gap-2">
            {isPreviewMode && (
              <button 
                onClick={handleDownloadPDF} 
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* 모달 본문 */}
        <div className="flex-1 overflow-auto">
          {isPreviewMode ? (
            <div className="p-4 flex justify-center">
              <div id="quotation-template" className="bg-white shadow-lg max-w-[210mm]">
                {renderSelectedTemplate()}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="aspect-[210/297] bg-gray-50 flex items-center justify-center overflow-hidden">
                      {/* 템플릿 이미지 대신 미리보기 텍스트 표시 */}
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className={`w-16 h-16 mb-2 flex items-center justify-center rounded-full ${template.id % 3 === 0 ? 'bg-blue-100' : template.id % 3 === 1 ? 'bg-green-100' : 'bg-purple-100'}`}>
                          <span className={`text-2xl font-bold ${template.id % 3 === 0 ? 'text-blue-600' : template.id % 3 === 1 ? 'text-green-600' : 'text-purple-600'}`}>{template.id}</span>
                        </div>
                        <h3 className="text-lg font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-2">템플릿 미리보기</p>
                      </div>
                    </div>
                    <div className="p-3 text-center border-t">
                      <span className="font-medium">{template.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 모달 푸터 */}
        {!isPreviewMode && (
          <div className="p-4 border-t flex justify-end">
            <button 
              onClick={() => setIsPreviewMode(true)} 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              선택한 템플릿으로 미리보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationTemplateModal;
