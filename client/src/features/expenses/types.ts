export type PaymentMethod = "Cash" | "UPI" | "Bank" | "Card";

export interface ExpenseCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  expenseCategoryId: string;
  expenseCategoryName: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateExpenseRequest {
  expenseCategoryId: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}
