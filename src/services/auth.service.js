// ─────────────────────────────────────────
//  AUTH SERVICE
//  Token management & session logic
// ─────────────────────────────────────────

import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROLES, ROUTES } from '../../config/constants.js';
import { localStorage_ } from './storage.service.js';
import store from '../store/index.js';

class AuthService {
  /** Save tokens and user after login */
  setSession(data) {
    const { token, refreshToken, user } = data;
    localStorage_.set(TOKEN_KEY, token);
    if (refreshToken) localStorage_.set(REFRESH_TOKEN_KEY, refreshToken);
    localStorage_.set(USER_KEY, user);
    store.set({ user, isAuth: true });
  }

  /** Clear session on logout */
  clearSession() {
    localStorage_.remove(TOKEN_KEY);
    localStorage_.remove(REFRESH_TOKEN_KEY);
    localStorage_.remove(USER_KEY);
    store.set({ user: null, isAuth: false });
  }

  /** Restore session from storage (call on app init) */
  restoreSession() {
    const token = this.getToken();
    const user  = localStorage_.get(USER_KEY);
    if (token && user && !this.isTokenExpired(token)) {
      store.set({ user, isAuth: true });
      return true;
    }
    this.clearSession();
    return false;
  }

  /** Get the access token */
  getToken() {
    return localStorage_.get(TOKEN_KEY);
  }

  /** Get refresh token */
  getRefreshToken() {
    return localStorage_.get(REFRESH_TOKEN_KEY);
  }

  /** Get the current user object */
  getUser() {
    return store.get('user') || localStorage_.get(USER_KEY);
  }

  /** Check if user is authenticated */
  isAuthenticated() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /** Decode a JWT payload (no verification) */
  decodeToken(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }

  /** Check if token is expired */
  isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  }

  /** Check if user has a specific role */
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  /** Check if user is admin */
  isAdmin() {
    return this.hasRole(ROLES.ADMIN);
  }

  /** Check if user is editor */
  isEditor() {
    return this.hasRole(ROLES.EDITOR) || this.isAdmin();
  }

  /** Redirect to login (save current URL for redirect-back) */
  redirectToLogin(reason = '') {
    const current = window.location.href;
    const url = new URL(ROUTES.LOGIN, window.location.origin);
    url.searchParams.set('redirect', current);
    if (reason) url.searchParams.set('reason', reason);
    window.location.href = url.toString();
  }

  /** Redirect after successful login */
  redirectAfterLogin() {
    const params  = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && redirect.startsWith(window.location.origin)) {
      window.location.href = redirect;
    } else {
      window.location.href = ROUTES.HOME;
    }
  }
}

export const authService = new AuthService();
export default authService;