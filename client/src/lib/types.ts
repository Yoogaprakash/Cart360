export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface ProblemDetails {
  title?: string;
  status?: number;
  correlationId?: string;
  errors?: Record<string, string[]>;
}

export type UserRole = "SuperAdmin" | "CompanyAdmin" | "Employee" | "CompanyUser";

export interface PermissionDto {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPrint: boolean;
  canExport: boolean;
}

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: UserRole;
  tenantId?: string | null;
  tenantName?: string | null;
  tenantStatus?: string | null;
  permissions: PermissionDto[];
}
