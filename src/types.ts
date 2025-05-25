export interface Equipment {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  specs?: {
    [key: string]: string | number;
  };
  alternatives?: string[];
}

export interface BudgetAllocation {
  category: string;
  percentage: number;
  amount: number;
}

export interface EventDetails {
  type: string;
  attendees: number;
  budget: number;
  vipCount?: number;
}

export interface EventTemplate {
  defaultBudget: number;
  minAttendees: number;
  maxAttendees: number;
  budgetAllocations: BudgetAllocation[];
  recommendedEquipment: string[];
}

export interface ComparisonItem {
  id: string;
  selected: boolean;
}

// 견적 관련 타입 통합
export interface QuoteItem {
  id?: string; // 생성용, DB용
  name: string;
  equipment?: Equipment; // 장비 정보가 있을 때
  quantity: number;
  price: number; // 단가
  days: number;
  totalPrice?: number; // 계산용
}

export interface Quote {
  id: string;
  clientName: string;
  eventName: string;
  eventType?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  attendees?: number;
  items: QuoteItem[];
  totalAmount: number;
  status: string;
  createdAt?: Date | string;
  validUntil?: Date | string;
  paymentTerms?: any;
  additionalTerms?: any;
  contactInfo?: any;
  description?: string;
  terms?: string;
}

export interface QuoteFormState {
  clientName: string;
  eventName: string;
  eventType: string;
  attendees: number;
  dateRange: [Date | null, Date | null];
  items: QuoteItem[];
  paymentTerms: any;
  additionalTerms: any;
  contactInfo: any;
}