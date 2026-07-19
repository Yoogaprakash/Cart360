export type PaymentMethod = "Cash" | "UPI" | "Bank" | "Card";

export interface IncomeCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Income {
  id: string;
  incomeCategoryId: string;
  incomeCategoryName: string;
  amount: number;
  incomeDate: string;
  source?: string | null;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  createdAt: string;
}

export interface CreateIncomeRequest {
  incomeCategoryId: string;
  amount: number;
  incomeDate: string;
  source?: string | null;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}
