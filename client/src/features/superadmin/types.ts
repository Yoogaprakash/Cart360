export type TenantStatus = "Pending" | "Active" | "Suspended" | "Rejected";

export interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  email: string;
  planName?: string | null;
  userCount: number;
  createdAt: string;
}

export interface MonthlyGrowthRow {
  year: number;
  month: number;
  newCompanies: number;
}

export interface SuperAdminDashboard {
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  suspendedCompanies: number;
  totalUsers: number;
  monthlyRecurringRevenue: number;
  monthlyGrowth: MonthlyGrowthRow[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  maxUsers: number;
  maxEmployees: number;
  maxProducts: number;
  maxCustomers: number;
  maxSuppliers: number;
  maxMonthlyInvoices: number;
  maxMonthlyQuotations: number;
  maxMonthlyPrints: number;
  maxStorageMb: number;
  maxWarehouses: number;
  canExportPdf: boolean;
  canExportExcel: boolean;
  canPrint: boolean;
  canAddLogo: boolean;
  canAddGst: boolean;
  canAddMultiBranch: boolean;
  canUseApi: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type UpsertSubscriptionPlanRequest = Omit<SubscriptionPlan, "id">;
