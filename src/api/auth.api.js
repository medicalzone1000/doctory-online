// ─────────────────────────────────────────
//  AUTH API — Supabase Integration
// ─────────────────────────────────────────

import supabase from './supabase.js';

export const authApi = {
  /** Login with email & password */
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Register new user */
  register: async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data;
  },

  /** Logout */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Request password reset email */
  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  /** Reset password (call after clicking email link) */
  resetPassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  /** Get current user with profile */
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return { ...user, profile };
  },

  /** Update profile */
  updateProfile: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);
    if (error) throw error;
  },

  /** Change password */
  changePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
};

export default authApi;
