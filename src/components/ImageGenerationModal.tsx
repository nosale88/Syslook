import React from 'react';
import { X } from 'lucide-react';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  isLoading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">AI 이미지 생성 결과</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">이미지 생성 중...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p className="font-medium">오류가 발생했습니다</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : imageUrl ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">프롬프트:</p>
                <p className="mt-1">{prompt}</p>
              </div>
              
              <div className="flex justify-center">
                <img 
                  src={imageUrl} 
                  alt="생성된 이미지" 
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              이미지가 생성되지 않았습니다
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationModal;
