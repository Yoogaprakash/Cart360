export type PurchaseStatus = "Draft" | "Received" | "Cancelled";

export interface PurchaseItem {
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

export interface Purchase {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierId: string;
  supplierName: string;
  referenceBillNumber?: string | null;
  subtotal: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: PurchaseStatus;
  notes?: string | null;
  items: PurchaseItem[];
  createdAt: string;
}

export interface CreatePurchaseItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export interface CreatePurchaseRequest {
  supplierId: string;
  purchaseDate: string;
  referenceBillNumber?: string | null;
  paidAmount: number;
  notes?: string | null;
  items: CreatePurchaseItemRequest[];
}
