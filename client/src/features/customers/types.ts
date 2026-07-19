export interface Customer {
  id: string;
  customerCode: string;
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
  creditLimit: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  gstNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  creditLimit: number;
  notes?: string | null;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  isActive: boolean;
}
