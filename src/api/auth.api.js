// ─────────────────────────────────────────
//  AUTH API — Supabase Integration
// ─────────────────────────────────────────

import supabase from './supabase.js';
import { resolvePath } from '../../config/paths.js';

export const authApi = {
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  register: async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  forgotPassword: async (email) => {
    const redirectTo = `${window.location.origin}${resolvePath('pages/auth/profile.html')}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  resetPassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

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

  updateProfile: async ({ name, fullName, bio }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const update = {};
    const displayName = name || fullName;
    if (displayName) update.full_name = displayName.trim();
    if (bio !== undefined) update.bio = bio.trim();

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id);

    if (error) throw error;
  },

  changePassword: async ({ newPassword, password }) => {
    const next = newPassword || password;
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) throw error;
  },
};

export default authApi;
