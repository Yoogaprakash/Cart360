export type InvoicePaymentMethod = "Cash" | "UPI" | "Bank" | "Card" | "Credit";
export type InvoiceStatus = "Draft" | "Pending" | "PartiallyPaid" | "Paid" | "Cancelled";

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  gstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  customerId: string;
  customerName: string;
  subtotal: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod: InvoicePaymentMethod;
  status: InvoiceStatus;
  notes?: string | null;
  terms?: string | null;
  printCount: number;
  items: InvoiceItem[];
  createdAt: string;
}

export interface CreateInvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice?: number | null;
  discountPercent: number;
}

export interface CreateInvoiceRequest {
  customerId: string;
  invoiceDate: string;
  dueDate?: string | null;
  paymentMethod: InvoicePaymentMethod;
  paidAmount: number;
  notes?: string | null;
  terms?: string | null;
  items: CreateInvoiceItemRequest[];
}
