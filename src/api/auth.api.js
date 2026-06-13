// ─────────────────────────────────────────
//  AUTH API  —  Supabase implementation
// ─────────────────────────────────────────

import supabase from './supabase.js';

export const authApi = {

  /** Login with email & password */
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw { message: error.message, status: 400 };

    // Fetch profile (role, name…)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      token:        data.session.access_token,
      refreshToken: data.session.refresh_token,
      user:         { ...data.user, ...profile },
    };
  },

  /** Register new user */
  register: async ({ email, password, full_name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw { message: error.message, status: 400 };
    return {
      token:        data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user:         { ...data.user, full_name, role: 'user' },
    };
  },

  /** Logout */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw { message: error.message };
    return { success: true };
  },

  /** Get current logged-in user + profile */
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw { message: 'Not authenticated', status: 401 };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, ...profile };
  },

  /** Update profile */
  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw { message: 'Not authenticated', status: 401 };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw { message: error.message };
    return data;
  },

  /** Forgot password — sends reset email */
  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/auth/reset-password.html`,
    });
    if (error) throw { message: error.message };
    return { success: true };
  },

  /** Reset password (called after email link) */
  resetPassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw { message: error.message };
    return { success: true };
  },

  /** Change password (while logged in) */
  changePassword: async ({ password }) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw { message: error.message };
    return { success: true };
  },

  /** Restore session from Supabase (call on app init) */
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

export default authApi;
