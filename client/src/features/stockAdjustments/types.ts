export interface StockAdjustmentItem {
  id: string;
  productId: string;
  productName: string;
  systemQuantity: number;
  actualQuantity: number;
  differenceQuantity: number;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  adjustmentDate: string;
  reason?: string | null;
  notes?: string | null;
  items: StockAdjustmentItem[];
  createdAt: string;
}

export interface CreateStockAdjustmentItemRequest {
  productId: string;
  actualQuantity: number;
}

export interface CreateStockAdjustmentRequest {
  reason?: string | null;
  notes?: string | null;
  items: CreateStockAdjustmentItemRequest[];
}
