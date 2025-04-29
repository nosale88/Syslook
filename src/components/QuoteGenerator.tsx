import React, { useState } from 'react';
import { FileText, Plus, Trash } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import Modal from './Modal';
import { Equipment, EventTemplate } from '../types';
import { eventTemplates, sampleEquipment } from '../data/mockData';

interface QuoteItem {
  id: string;
  equipment: Equipment;
  quantity: number;
  days: number;
  totalPrice: number;
}

interface QuoteGeneratorProps {
  onGenerate: (quote: any) => void;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventType, setEventType] = useState<string>('기업 세미나');
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [attendees, setAttendees] = useState(100);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [paymentTerms, setPaymentTerms] = useState({
    deposit: 30,
    interim: 40,
    final: 30,
    depositDueDate: '',
    interimDueDate: '',
    finalDueDate: '',
  });
  const [additionalTerms, setAdditionalTerms] = useState({
    cancellationPolicy: '',
    deliveryTerms: '',
    setupTerms: '',
    insuranceRequirements: '',
    specialRequirements: '',
  });
  const [contactInfo, setContactInfo] = useState({
    managerName: '',
    phone: '',
    email: '',
    department: '',
  });

  const template = eventTemplates[eventType];

  const calculateDays = () => {
    if (dateRange[0] && dateRange[1]) {
      const diffTime = Math.abs(dateRange[1].getTime() - dateRange[0].getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 1;
  };

  const addItem = (equipment: Equipment) => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      equipment,
      quantity: 1,
      days: calculateDays(),
      totalPrice: equipment.price,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity,
          totalPrice: item.equipment.price * quantity * item.days,
        };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleGenerate = () => {
    const quote = {
      id: `Q${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      clientName,
      eventName,
      eventType,
      startDate: dateRange[0],
      endDate: dateRange[1],
      attendees,
      items,
      totalAmount: calculateTotal(),
      status: '승인대기',
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15일 후
      paymentTerms,
      additionalTerms,
      contactInfo,
    };

    onGenerate(quote);
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setClientName('');
    setEventName('');
    setEventType('기업 세미나');
    setAttendees(100);
    setDateRange([null, null]);
    setItems([]);
    setPaymentTerms({
      deposit: 30,
      interim: 40,
      final: 30,
      depositDueDate: '',
      interimDueDate: '',
      finalDueDate: '',
    });
    setAdditionalTerms({
      cancellationPolicy: '',
      deliveryTerms: '',
      setupTerms: '',
      insuranceRequirements: '',
      specialRequirements: '',
    });
    setContactInfo({
      managerName: '',
      phone: '',
      email: '',
      department: '',
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <FileText className="w-5 h-5 mr-2" />
        견적서 자동 생성
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="견적서 자동 생성"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이벤트 유형</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.keys(eventTemplates).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">고객사명</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">행사명</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">참석자 수</label>
              <input
                type="number"
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">행사 기간</label>
              <DateRangePicker
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => setDateRange(update)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">담당자 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">담당자명</label>
                <input
                  type="text"
                  value={contactInfo.managerName}
                  onChange={(e) => setContactInfo({ ...contactInfo, managerName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">부서</label>
                <input
                  type="text"
                  value={contactInfo.department}
                  onChange={(e) => setContactInfo({ ...contactInfo, department: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">연락처</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">장비 선택</h3>
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.equipment.name}</p>
                    <p className="text-sm text-gray-500">{item.equipment.price.toLocaleString()}원/일</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <div className="mt-2">
                <select
                  onChange={(e) => {
                    const equipment = sampleEquipment.find(eq => eq.id === e.target.value);
                    if (equipment) addItem(equipment);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value=""
                >
                  <option value="">장비 추가...</option>
                  {sampleEquipment.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name} - {equipment.price.toLocaleString()}원/일
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">결제 조건</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">계약금 (%)</label>
                  <input
                    type="number"
                    value={paymentTerms.deposit}
                    onChange={(e) => setPaymentTerms({ ...paymentTerms, deposit: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">중도금 (%)</label>
                  <input
                    type="number"
                    value={paymentTerms.interim}
                    onChange={(e) => setPaymentTerms({ ...paymentTerms, interim: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">잔금 (%)</label>
                  <input
                    type="number"
                    value={paymentTerms.final}
                    onChange={(e) => setPaymentTerms({ ...paymentTerms, final: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">계약금 납부일</label>
                  <input
                    type="date"
                    value={paymentTerms.depositDueDate}
                    onChange={(e) => setPaymentTerms({ ...paymentTerms, depositDueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">중도금 납부일</label>
                  <input
                    type="date"
                    value={paymentTerms.interimDueDate}
                    onChange={(e) => setPaymentTerms({ ...paymentTerms, interimDueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">잔금 납부일</label>
                  <input
                    type="date"
                    value={paymentTerms.finalDueDate}
                    onChange={(e) => setPaymentTerms({ ...paymentTerms, finalDueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">추가 계약 조건</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">취소 정책</label>
                <textarea
                  value={additionalTerms.cancellationPolicy}
                  onChange={(e) => setAdditionalTerms({ ...additionalTerms, cancellationPolicy: e.target.value })}
                  placeholder="예) 행사 7일 전 취소 시 계약금 환불 불가"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">배송 조건</label>
                <textarea
                  value={additionalTerms.deliveryTerms}
                  onChange={(e) => setAdditionalTerms({ ...additionalTerms, deliveryTerms: e.target.value })}
                  placeholder="예) 행사 전일 오후 설치, 행사 종료 후 철수"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">설치 조건</label>
                <textarea
                  value={additionalTerms.setupTerms}
                  onChange={(e) => setAdditionalTerms({ ...additionalTerms, setupTerms: e.target.value })}
                  placeholder="예) 전기 및 인터넷 설비 고객사 제공"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">보험 요구사항</label>
                <textarea
                  value={additionalTerms.insuranceRequirements}
                  onChange={(e) => setAdditionalTerms({ ...additionalTerms, insuranceRequirements: e.target.value })}
                  placeholder="예) 행사 배상책임보험 가입 필수"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">특별 요구사항</label>
                <textarea
                  value={additionalTerms.specialRequirements}
                  onChange={(e) => setAdditionalTerms({ ...additionalTerms, specialRequirements: e.target.value })}
                  placeholder="예) 비상 전력 공급 장치 필수"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>총 견적 금액</span>
              <span>{calculateTotal().toLocaleString()}원</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleGenerate}
              disabled={!clientName || !eventName || items.length === 0 || !dateRange[0] || !dateRange[1]}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              견적서 생성
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QuoteGenerator;