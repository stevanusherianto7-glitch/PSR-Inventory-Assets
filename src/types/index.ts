export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  items: { name: string; qty: number; price: number }[];
  total: number;
  paymentMethod: 'Tunai' | 'QRIS';
  cashReceived?: number;
  change?: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  timestamp: Date;
}

export type ViewType = 'Inventory' | 'POS' | 'History' | 'Expenses';
export type CategoryType = 'Kitchen' | 'Mini Bar';
export type PaymentMethod = 'Tunai' | 'QRIS';
