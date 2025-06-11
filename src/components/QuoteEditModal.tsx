import React, { useState } from 'react';
import Modal from './Modal';

interface QuoteItem {
  name: string;
  quantity: number;
  price: number;
  days: number;
}

interface Quote {
  id: string;
  clientName: string;
  eventName: string;
  date: string;
  amount: number;
  status: string;
  validUntil: string;
  items?: QuoteItem[];
  description?: string;
  terms?: string;
}

interface QuoteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  onSave: (quote: Quote) => void;
}

const statusOptions = ['승인대기', '승인완료', '검토중', '반려'];

const QuoteEditModal: React.FC<QuoteEditModalProps> = ({
  isOpen,
  onClose,
  quote,
  onSave,
}) => {
  const [formData, setFormData] = useState(quote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: number | string) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: typeof value === 'string' ? value : Number(value),
    };

    // 총액 재계산
    const newAmount = newItems.reduce(
      (sum, item) => sum + item.price * item.quantity * item.days,
      0
    );

    setFormData({
      ...formData,
      items: newItems,
      amount: newAmount,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        { name: '', quantity: 1, price: 0, days: 1 },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = form

Data.items?.filter((_, i) => i !== index);
    const newAmount = newItems?.reduce(
      (sum, item) => sum + item.price * item.quantity * item.days,
      0
    ) || 0;

    setFormData({
      ...formData,
      items: newItems,
      amount: newAmount,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="견적서 수정">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">고객사</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">행사명</label>
            <input
              type="text"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">상태</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">견적일</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">유효기간</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">견적 항목</label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 항목 추가
            </button>
          </div>
          <div className="space-y-2">
            {formData.items?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="품목명"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  placeholder="수량"
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                  placeholder="단가"
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.days}
                  onChange={(e) => updateItem(index, 'days', e.target.value)}
                  placeholder="일수"
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">견적 설명</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">계약 조건</label>
          <textarea
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-lg font-medium">
            총 금액: {formData.amount.toLocaleString()}원
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default QuoteEditModal;