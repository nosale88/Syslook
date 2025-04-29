import React from 'react';
import Modal from './Modal';
import { Calendar, DollarSign, Building2, FileText } from 'lucide-react';

interface Quote {
  id: string;
  clientName: string;
  eventName: string;
  date: string;
  amount: number;
  status: string;
  validUntil: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    days: number;
  }>;
  description?: string;
  terms?: string;
}

interface QuoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
}

const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  isOpen,
  onClose,
  quote,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="견적서 상세 정보">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold">{quote.eventName}</h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2
              ${
                quote.status === '승인완료'
                  ? 'bg-green-100 text-green-800'
                  : quote.status === '승인대기'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
          >
            {quote.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Building2 className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">고객사</p>
              <p className="font-medium">{quote.clientName}</p>
            </div>
          </div>
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">견적번호</p>
              <p className="font-medium">{quote.id}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">견적일</p>
              <p className="font-medium">{quote.date}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">유효기간</p>
              <p className="font-medium">{quote.validUntil}</p>
            </div>
          </div>
        </div>

        {quote.items && quote.items.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">견적 항목</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500">품목</th>
                    <th className="text-right text-sm font-medium text-gray-500">수량</th>
                    <th className="text-right text-sm font-medium text-gray-500">일수</th>
                    <th className="text-right text-sm font-medium text-gray-500">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 text-sm text-gray-900">{item.name}</td>
                      <td className="py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="py-2 text-sm text-gray-900 text-right">{item.days}일</td>
                      <td className="py-2 text-sm text-gray-900 text-right">
                        {(item.price * item.quantity * item.days).toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-medium">총 금액</td>
                    <td className="py-2 text-right font-medium text-blue-600">
                      {quote.amount.toLocaleString()}원
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {quote.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">견적 설명</h4>
            <p className="text-gray-600">{quote.description}</p>
          </div>
        )}

        {quote.terms && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">계약 조건</h4>
            <p className="text-gray-600">{quote.terms}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuoteDetailModal;