export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired" | "Converted";

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  gstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  expiryDate?: string | null;
  customerId: string;
  customerName: string;
  subtotal: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  roundOff: number;
  grandTotal: number;
  status: QuotationStatus;
  convertedInvoiceId?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: QuotationItem[];
  createdAt: string;
}

export interface CreateQuotationItemRequest {
  productId: string;
  quantity: number;
  unitPrice?: number | null;
  discountPercent: number;
}

export interface CreateQuotationRequest {
  customerId: string;
  quotationDate: string;
  expiryDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: CreateQuotationItemRequest[];
}
