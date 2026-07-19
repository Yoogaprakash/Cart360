export interface SalesReportRow {
  date: string;
  invoiceCount: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
}
export interface SalesReportDto {
  rows: SalesReportRow[];
  totalSales: number;
  totalInvoices: number;
}

export interface PurchaseReportRow {
  date: string;
  purchaseCount: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
}
export interface PurchaseReportDto {
  rows: PurchaseReportRow[];
  totalPurchases: number;
  totalPurchaseCount: number;
}

export interface GstReportDto {
  outputCgst: number;
  outputSgst: number;
  inputCgst: number;
  inputSgst: number;
  netGstPayable: number;
}

export interface ProfitLossDto {
  salesRevenue: number;
  otherIncome: number;
  costOfGoodsSold: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface TopProductRow {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface InventoryReportRow {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStockLevel: number;
  stockValue: number;
  isLowStock: boolean;
}
export interface InventoryReportDto {
  rows: InventoryReportRow[];
  totalStockValue: number;
  lowStockCount: number;
}

export interface OutstandingRow {
  partyId: string;
  partyName: string;
  outstandingAmount: number;
}
export interface OutstandingReportDto {
  customers: OutstandingRow[];
  suppliers: OutstandingRow[];
}

export interface MonthlySalesRow {
  year: number;
  month: number;
  totalSales: number;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}
