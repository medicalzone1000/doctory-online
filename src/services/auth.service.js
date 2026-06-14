// ─────────────────────────────────────────
//  AUTH SERVICE — Supabase Session
//  Token managed by Supabase, profile from DB
// ─────────────────────────────────────────

import { USER_KEY, ROLES, ROUTES } from '../../config/constants.js';
import { localStorage_ } from './storage.service.js';
import supabase from '../api/supabase.js';
import store from '../store/index.js';

class AuthService {
  /** Initialize auth state on app start */
  async init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await this._loadUser();
      return true;
    }
    store.set({ user: null, isAuth: false });
    return false;
  }

  /** Load user + profile from Supabase */
  async _loadUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      this.clearSession();
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    const fullUser = { ...user, profile };
    localStorage_.set(USER_KEY, fullUser);
    store.set({ user: fullUser, isAuth: true });
  }

  /** Save session after login/register */
  setSession(data) {
    // Supabase manages tokens internally, just load user
    this._loadUser();
  }

  /** Clear session on logout */
  async clearSession() {
    await supabase.auth.signOut();
    localStorage_.remove(USER_KEY);
    store.set({ user: null, isAuth: false });
  }

  /** Restore session (alias for init) */
  restoreSession() {
    return this.init();
  }

  /** Get the current user object */
  getUser() {
    return store.get('user') || localStorage_.get(USER_KEY);
  }

  /** Check if user is authenticated */
  isAuthenticated() {
    const user = this.getUser();
    return !!user;
  }

  /** Check if user has a specific role */
  hasRole(role) {
    const user = this.getUser();
    return user?.profile?.role === role;
  }

  /** Check if user is admin */
  isAdmin() {
    return this.hasRole(ROLES.ADMIN);
  }

  /** Check if user is editor */
  isEditor() {
    return this.hasRole(ROLES.EDITOR) || this.isAdmin();
  }

  /** Listen to auth state changes */
  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        this._loadUser().then(() => callback(this.getUser()));
      } else if (event === 'SIGNED_OUT') {
        this.clearSession();
        callback(null);
      }
    });
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
    const params = new URLSearchParams(window.location.search);
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
