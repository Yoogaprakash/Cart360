import type { UserSummary } from "../lib/types";

const ACCESS_TOKEN_KEY = "cart360.accessToken";
const REFRESH_TOKEN_KEY = "cart360.refreshToken";
const USER_KEY = "cart360.user";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

/**
 * Session is stored in localStorage (not sessionStorage) specifically so "Remember Login"
 * survives closing the tab — the refresh token's own expiry (7 or 30 days, chosen at login)
 * is what actually bounds the session, not the storage mechanism.
 */
export const authStorage = {
  save(session: StoredSession) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },
  updateTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  getUser(): UserSummary | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserSummary) : null;
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
