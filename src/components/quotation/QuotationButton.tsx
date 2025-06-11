import React, { useState } from 'react';
import { FileCheck } from 'lucide-react';
import QuotationTemplateModal, { QuotationData } from './QuotationTemplateModal';

interface QuotationButtonProps {
  quotationData: QuotationData;
}

const QuotationButton: React.FC<QuotationButtonProps> = ({ quotationData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        title="견적서 생성"
      >
        <FileCheck className="w-5 h-5" />
      </button>
      
      <QuotationTemplateModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        quotationData={quotationData} 
      />
    </>
  );
};

export default QuotationButton;
