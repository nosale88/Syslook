import React, { useState, useEffect } from 'react';
import { X, Download, ArrowLeft, Edit3, Plus, Trash2, Save } from 'lucide-react';
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
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // 편집 가능한 견적서 데이터 상태
  const [editableData, setEditableData] = useState<QuotationData>(quotationData);
  
  // 템플릿 썸네일 데이터
  const templates = [
    { id: 1, name: 'Template 1', image: '/images/templates/template1.svg' },
    { id: 2, name: 'Template 2', image: '/images/templates/template2.svg' },
    { id: 3, name: 'Template 3', image: '/images/templates/template3.svg' },
    { id: 4, name: 'Template 4', image: '/images/templates/template4.svg' },
    { id: 5, name: 'Template 5', image: '/images/templates/template5.svg' },
    { id: 6, name: 'Template 6', image: '/images/templates/template6.svg' },
    { id: 7, name: 'Template 7', image: '/images/templates/template7.svg' },
    { id: 8, name: 'Template 8', image: '/images/templates/template8.svg' },
    { id: 9, name: 'Template 9', image: '/images/templates/template9.svg' },
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
    ...editableData,
    items: editableData.items && editableData.items.length > 0 ? editableData.items : defaultItems,
    companyInfo: editableData.companyInfo || defaultCompanyInfo,
    clientInfo: editableData.clientInfo || defaultClientInfo
  };

  // 썸네일용 더미 견적서 데이터 (숫자값 0으로)
  const dummyQuotationDataForThumbnail: QuotationData = {
    ...preparedQuotationData,
    amount: 0,
    items: (preparedQuotationData.items || defaultItems).map(item => ({
      ...item,
      quantity: 0,
      unitPrice: 0,
      amount: 0,
    })),
    client: preparedQuotationData.client || "샘플 고객명",
    title: preparedQuotationData.title || "샘플 견적서 제목",
  };

  // 견적 항목 추가
  const addQuotationItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: '새 항목',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    
    const updatedItems = [...(editableData.items || []), newItem];
    setEditableData({
      ...editableData,
      items: updatedItems,
      amount: updatedItems.reduce((sum, item) => sum + item.amount, 0)
    });
  };

  // 견적 항목 수정
  const updateQuotationItem = (itemId: string, field: keyof QuotationItem, value: string | number) => {
    const updatedItems = (editableData.items || []).map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        // 수량이나 단가가 변경되면 금액 자동 계산
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    
    setEditableData({
      ...editableData,
      items: updatedItems,
      amount: updatedItems.reduce((sum, item) => sum + item.amount, 0)
    });
  };

  // 견적 항목 삭제
  const deleteQuotationItem = (itemId: string) => {
    const updatedItems = (editableData.items || []).filter(item => item.id !== itemId);
    setEditableData({
      ...editableData,
      items: updatedItems,
      amount: updatedItems.reduce((sum, item) => sum + item.amount, 0)
    });
  };

  // 기본 정보 수정
  const updateBasicInfo = (field: keyof QuotationData, value: string) => {
    setEditableData({
      ...editableData,
      [field]: value
    });
  };

  // 회사 정보 수정
  const updateCompanyInfo = (field: string, value: string) => {
    setEditableData({
      ...editableData,
      companyInfo: {
        ...editableData.companyInfo,
        ...defaultCompanyInfo,
        [field]: value
      }
    });
  };

  // 고객 정보 수정
  const updateClientInfo = (field: string, value: string) => {
    setEditableData({
      ...editableData,
      clientInfo: {
        ...editableData.clientInfo,
        ...defaultClientInfo,
        [field]: value
      }
    });
  };

  // 편집 모드 저장
  const saveEditChanges = () => {
    setIsEditMode(false);
    // 여기서 필요하다면 상위 컴포넌트로 변경사항을 전달할 수 있음
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
      pdf.save(`견적서_${editableData.id}_${new Date().toISOString().slice(0, 10)}.pdf`);
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
      setIsEditMode(false);
      setEditableData(quotationData);
    }
  }, [isOpen, quotationData]);

  // quotationData가 변경될 때 editableData 업데이트
  useEffect(() => {
    setEditableData(quotationData);
  }, [quotationData]);

  if (!isOpen) return null;

  // 템플릿 ID에 따라 해당 컴포넌트를 반환하는 헬퍼 함수
  const getTemplateComponent = (templateId: number): React.FC<{ data: QuotationData }> | null => {
    switch (templateId) {
      case 1: return QuotationTemplate1;
      case 2: return QuotationTemplate2;
      case 3: return QuotationTemplate3;
      case 4: return QuotationTemplate4;
      case 5: return QuotationTemplate5;
      case 6: return QuotationTemplate6;
      case 7: return QuotationTemplate7;
      case 8: return QuotationTemplate8;
      case 9: return QuotationTemplate9;
      default: return QuotationTemplate1;
    }
  };

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

  // 편집 모드 렌더링
  const renderEditMode = () => (
    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
      {/* 기본 정보 편집 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">견적서 제목</label>
            <input
              type="text"
              value={editableData.title}
              onChange={(e) => updateBasicInfo('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">고객명</label>
            <input
              type="text"
              value={editableData.client}
              onChange={(e) => updateBasicInfo('client', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={editableData.status}
              onChange={(e) => updateBasicInfo('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="초안">초안</option>
              <option value="발송됨">발송됨</option>
              <option value="승인됨">승인됨</option>
              <option value="거절됨">거절됨</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
            <input
              type="date"
              value={editableData.dueDate}
              onChange={(e) => updateBasicInfo('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            value={editableData.description || ''}
            onChange={(e) => updateBasicInfo('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="견적서 설명을 입력하세요..."
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">계약 조건</label>
          <textarea
            value={editableData.terms || ''}
            onChange={(e) => updateBasicInfo('terms', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="계약 조건을 입력하세요..."
          />
        </div>
      </div>

      {/* 회사 정보 편집 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">회사 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
            <input
              type="text"
              value={editableData.companyInfo?.name || defaultCompanyInfo.name}
              onChange={(e) => updateCompanyInfo('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <input
              type="text"
              value={editableData.companyInfo?.address || defaultCompanyInfo.address}
              onChange={(e) => updateCompanyInfo('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input
              type="text"
              value={editableData.companyInfo?.phone || defaultCompanyInfo.phone}
              onChange={(e) => updateCompanyInfo('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={editableData.companyInfo?.email || defaultCompanyInfo.email}
              onChange={(e) => updateCompanyInfo('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 고객 정보 편집 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">고객 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">고객명</label>
            <input
              type="text"
              value={editableData.clientInfo?.name || defaultClientInfo.name}
              onChange={(e) => updateClientInfo('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <input
              type="text"
              value={editableData.clientInfo?.address || defaultClientInfo.address}
              onChange={(e) => updateClientInfo('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input
              type="text"
              value={editableData.clientInfo?.phone || defaultClientInfo.phone}
              onChange={(e) => updateClientInfo('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={editableData.clientInfo?.email || defaultClientInfo.email}
              onChange={(e) => updateClientInfo('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 견적 항목 편집 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">견적 항목</h3>
          <button
            onClick={addQuotationItem}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            항목 추가
          </button>
        </div>
        
        <div className="space-y-3">
          {(editableData.items || []).map((item, index) => (
            <div key={item.id} className="bg-white p-4 rounded-md border">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">항목명</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateQuotationItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuotationItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">단가</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateQuotationItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
                    <input
                      type="text"
                      value={item.amount.toLocaleString()}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                  <button
                    onClick={() => deleteQuotationItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-right">
          <div className="text-lg font-semibold">
            총 금액: {editableData.amount?.toLocaleString() || 0}원
          </div>
        </div>
      </div>
    </div>
  );

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
          ) : isEditMode ? (
            <button 
              onClick={() => setIsEditMode(false)} 
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              미리보기로 돌아가기
            </button>
          ) : (
            <h2 className="text-xl font-semibold">견적서 템플릿 선택</h2>
          )}
          
          <div className="flex items-center gap-2">
            {isPreviewMode && (
              <>
                <button 
                  onClick={() => setIsEditMode(true)} 
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  편집
                </button>
                <button 
                  onClick={handleDownloadPDF} 
                  className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF 다운로드
                </button>
              </>
            )}
            {isEditMode && (
              <button 
                onClick={saveEditChanges} 
                className="flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                저장
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
          {isEditMode ? (
            renderEditMode()
          ) : isPreviewMode ? (
            <div className="p-4 flex justify-center">
              <div id="quotation-template" className="bg-white shadow-lg max-w-[210mm]">
                {renderSelectedTemplate()}
              </div>
            </div>
          ) : (
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {templates.map((template) => {
                    const TemplateComponent = getTemplateComponent(template.id);
                    return (
                      <div
                        key={template.id}
                        className={`border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all duration-200 transform hover:scale-105 relative overflow-hidden bg-white group
                                    ${selectedTemplate === template.id ? 'border-blue-600 shadow-xl ring-2 ring-blue-500 ring-offset-1' : 'border-gray-300'}`}
                        onClick={() => setSelectedTemplate(template.id)}
                        style={{ width: '100%', aspectRatio: '210 / 297' }}
                      >
                        <div className="absolute inset-0 pointer-events-none"
                            style={{
                                transform: 'scale(0.45)',
                                transformOrigin: 'top left',
                                width: '222.22%',
                                height: '222.22%',
                                overflow: 'hidden',
                                backgroundColor: 'white',
                            }}
                        >
                          {TemplateComponent ? <TemplateComponent data={dummyQuotationDataForThumbnail} /> : <p className="text-red-500 p-4">Template Error</p>}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-50 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {template.name}
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="absolute inset-0 border-2 border-blue-500 rounded-md pointer-events-none"></div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
        
        {/* 모달 푸터 */}
        {!isPreviewMode && !isEditMode && (
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
