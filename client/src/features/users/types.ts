export type UserRole = "SuperAdmin" | "CompanyAdmin" | "Employee" | "CompanyUser";

export interface UserPermission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPrint: boolean;
  canExport: boolean;
}

export interface CompanyUser {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  permissions: UserPermission[];
}

export interface InviteUserRequest {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  temporaryPassword: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface SetUserPermissionsRequest {
  permissions: UserPermission[];
}
