import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authApi, type LoginRequest } from "../features/auth/api/authApi";
import type { UserSummary } from "../lib/types";
import { authStorage } from "./authStorage";

interface AuthContextValue {
  user: UserSummary | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<UserSummary>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action: "view" | "create" | "edit" | "delete" | "print" | "export") => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(() => authStorage.getUser());

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authApi.login(payload);
    authStorage.save(response);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // best-effort — clear the local session regardless of server-side revoke succeeding
      }
    }
    authStorage.clear();
    setUser(null);
  }, []);

  const hasPermission = useCallback<AuthContextValue["hasPermission"]>(
    (module, action) => {
      if (!user) return false;
      if (user.role === "SuperAdmin" || user.role === "CompanyAdmin") return true;
      if (user.role !== "Employee") return false;

      const permission = user.permissions.find((p) => p.module === module);
      if (!permission) return false;

      switch (action) {
        case "view": return permission.canView;
        case "create": return permission.canCreate;
        case "edit": return permission.canEdit;
        case "delete": return permission.canDelete;
        case "print": return permission.canPrint;
        case "export": return permission.canExport;
      }
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout, hasPermission }),
    [user, login, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
