export interface Product {
  id: string;
  categoryId?: string | null;
  categoryName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  unitId: string;
  unitName: string;
  warehouseId?: string | null;
  warehouseName?: string | null;
  name: string;
  sku: string;
  barcode?: string | null;
  hsnCode?: string | null;
  gstPercent: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  openingStock: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number | null;
  trackInventory: boolean;
  trackBatches: boolean;
  imageUrl?: string | null;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  categoryId?: string | null;
  brandId?: string | null;
  unitId: string;
  warehouseId?: string | null;
  name: string;
  sku: string;
  barcode?: string | null;
  hsnCode?: string | null;
  gstPercent: number;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  openingStock: number;
  minStockLevel: number;
  maxStockLevel?: number | null;
  trackInventory: boolean;
  trackBatches: boolean;
  imageUrl?: string | null;
}

export interface UpdateProductRequest extends Omit<CreateProductRequest, "openingStock"> {
  isActive: boolean;
}
