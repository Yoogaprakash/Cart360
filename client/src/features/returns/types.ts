export type ReturnStatus = "Draft" | "Completed" | "Cancelled";

export interface SalesReturnItem {
  id: string;
  invoiceItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  returnDate: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  reason?: string | null;
  status: ReturnStatus;
  items: SalesReturnItem[];
  createdAt: string;
}

export interface CreateSalesReturnItemRequest {
  invoiceItemId: string;
  quantity: number;
}

export interface CreateSalesReturnRequest {
  invoiceId: string;
  reason?: string | null;
  items: CreateSalesReturnItemRequest[];
}

export interface PurchaseReturnItem {
  id: string;
  purchaseItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  returnDate: string;
  purchaseId: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  reason?: string | null;
  status: ReturnStatus;
  items: PurchaseReturnItem[];
  createdAt: string;
}

export interface CreatePurchaseReturnItemRequest {
  purchaseItemId: string;
  quantity: number;
}

export interface CreatePurchaseReturnRequest {
  purchaseId: string;
  reason?: string | null;
  items: CreatePurchaseReturnItemRequest[];
}
