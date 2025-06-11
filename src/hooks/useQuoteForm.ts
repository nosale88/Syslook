import { useState } from 'react';
import { QuoteFormState, QuoteItem } from '../types';

const initialFormState: QuoteFormState = {
  clientName: '',
  eventName: '',
  eventType: '기업 세미나',
  attendees: 100,
  dateRange: [null, null],
  items: [],
  paymentTerms: {
    deposit: 30,
    interim: 40,
    final: 30,
    depositDueDate: '',
    interimDueDate: '',
    finalDueDate: '',
  },
  additionalTerms: {
    cancellationPolicy: '',
    deliveryTerms: '',
    setupTerms: '',
    insuranceRequirements: '',
    specialRequirements: '',
  },
  contactInfo: {
    managerName: '',
    phone: '',
    email: '',
    department: '',
  },
};

export function useQuoteForm() {
  const [form, setForm] = useState<QuoteFormState>(initialFormState);

  const setField = <K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => setForm(initialFormState);

  const addItem = (item: QuoteItem) => {
    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));
  };

  const removeItem = (id: string) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  };

  const updateItem = (id: string, update: Partial<QuoteItem>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...update } : item
      ),
    }));
  };

  return {
    form,
    setField,
    resetForm,
    addItem,
    removeItem,
    updateItem,
    setForm, // 전체 교체용
  };
} 