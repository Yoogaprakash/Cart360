export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  gstNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  outstandingAmount: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  gstNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  isActive: boolean;
}
