// ─────────────────────────────────────────
//  AUTH SERVICE — Supabase Session
// ─────────────────────────────────────────

import { USER_KEY, ROLES, ROUTES } from '../../config/constants.js';
import { localStorage_ } from './storage.service.js';
import supabase from '../api/supabase.js';
import store from '../store/index.js';
import { normalizeUser } from '../utils/normalize.js';

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
      await this.clearSession(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const normalized = normalizeUser({ ...user, profile });
    localStorage_.set(USER_KEY, normalized);
    store.set({ user: normalized, isAuth: true });
  }

  /** Save session after login/register */
  async setSession() {
    await this._loadUser();
  }

  /** Clear session on logout */
  async clearSession(signOut = true) {
    if (signOut) {
      await supabase.auth.signOut();
    }
    localStorage_.remove(USER_KEY);
    store.set({ user: null, isAuth: false });
  }

  restoreSession() {
    return this.init();
  }

  getUser() {
    return store.get('user') || localStorage_.get(USER_KEY);
  }

  getDisplayName(user = this.getUser()) {
    return user?.name || user?.profile?.full_name || user?.user_metadata?.full_name || 'User';
  }

  isAuthenticated() {
    return !!this.getUser();
  }

  hasRole(role) {
    const user = this.getUser();
    return user?.role === role || user?.profile?.role === role;
  }

  isAdmin() {
    return this.hasRole(ROLES.ADMIN);
  }

  isEditor() {
    return this.hasRole(ROLES.EDITOR) || this.isAdmin();
  }

  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        this._loadUser().then(() => callback(this.getUser()));
      } else if (event === 'SIGNED_OUT') {
        this.clearSession(false).then(() => callback(null));
      }
    });
  }

  redirectToLogin(reason = '') {
    const current = window.location.href;
    const url = new URL(ROUTES.LOGIN, window.location.origin);
    url.searchParams.set('redirect', current);
    if (reason) url.searchParams.set('reason', reason);
    window.location.href = url.toString();
  }

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
