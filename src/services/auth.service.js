// ─────────────────────────────────────────
//  AUTH SERVICE  —  Supabase session manager
// ─────────────────────────────────────────

import { USER_KEY, ROLES, ROUTES } from '../../config/constants.js';
import supabase from '../api/supabase.js';
import store from '../store/index.js';

class AuthService {

  /** Save user in store + localStorage after login/register */
  setSession({ token, refreshToken, user }) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      store.set({ user, isAuth: true });
    }
  }

  /** Clear session on logout */
  clearSession() {
    localStorage.removeItem(USER_KEY);
    store.set({ user: null, isAuth: false });
  }

  /** Restore session on page load — checks Supabase session */
  async restoreSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      this.clearSession();
      return false;
    }

    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const user = { ...session.user, ...profile };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    store.set({ user, isAuth: true });
    return true;
  }

  /** Get the Supabase access token */
  async getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /** Get the current user from store or localStorage */
  getUser() {
    const stored = store.get('user');
    if (stored) return stored;
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch { return null; }
  }

  /** Check if user is authenticated (has valid Supabase session) */
  isAuthenticated() {
    // Sync check using stored user (async check via restoreSession)
    return !!this.getUser();
  }

  /** Check if user has a specific role */
  hasRole(role) {
    return this.getUser()?.role === role;
  }

  isAdmin()  { return this.hasRole(ROLES.ADMIN); }
  isEditor() { return this.hasRole(ROLES.EDITOR) || this.isAdmin(); }

  /** Redirect to login page */
  redirectToLogin(reason = '') {
    const current = window.location.href;
    const url = new URL(ROUTES.LOGIN, window.location.origin);
    url.searchParams.set('redirect', current);
    if (reason) url.searchParams.set('reason', reason);
    window.location.href = url.toString();
  }

  /** Redirect after successful login */
  redirectAfterLogin() {
    const params   = new URLSearchParams(window.location.search);
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
