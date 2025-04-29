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