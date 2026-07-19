import { apiClient } from "../../../lib/apiClient";
import type { UserSummary } from "../../../lib/types";

export interface RegisterCompanyRequest {
  companyName: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}

export interface RegisterCompanyResponse {
  tenantId: string;
  userId: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  user: UserSummary;
}

export const authApi = {
  register: (payload: RegisterCompanyRequest) =>
    apiClient.post<RegisterCompanyResponse>("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginRequest) => apiClient.post<LoginResponse>("/auth/login", payload).then((r) => r.data),

  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) => apiClient.post("/auth/forgot-password", { email }),

  resendOtp: (email: string, purpose: "EmailVerification" | "PasswordReset") =>
    apiClient.post("/auth/resend-otp", { email, purpose }),

  verifyEmail: (email: string, code: string) => apiClient.post("/auth/verify-email", { email, code }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiClient.post("/auth/reset-password", { email, code, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post("/auth/change-password", { currentPassword, newPassword })
};
