import { QuoteItem } from '../types';

export function calculateQuoteTotal(items: QuoteItem[]): number {
  return items.reduce((sum, item) => {
    // price 우선, 없으면 equipment.price 사용
    const price = item.price ?? item.equipment?.price ?? 0;
    const days = item.days ?? 1;
    const quantity = item.quantity ?? 1;
    return sum + price * quantity * days;
  }, 0);
}

export function generateQuoteId(): string {
  return `Q${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
} 