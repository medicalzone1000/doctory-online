// ─────────────────────────────────────────
//  USERS API  —  Supabase implementation
// ─────────────────────────────────────────

import supabase from './supabase.js';

export const usersApi = {

  /** List all users (admin only) */
  list: async ({ page = 1, limit = 20, search = '', role = '' } = {}) => {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (role)   query = query.eq('role', role);
    if (search) query = query.ilike('full_name', `%${search}%`);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw { message: error.message };
    return { users: data, total: count, page, limit };
  },

  /** Get user by ID */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw { message: error.message, status: 404 };
    return data;
  },

  /** Update user profile */
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw { message: error.message };
    return data;
  },

  /** Change user role (admin only) */
  setRole: async (id, role) => usersApi.update(id, { role }),

  /** Activate / deactivate user */
  setActive: async (id, active) => usersApi.update(id, { active }),

  /** Delete user (admin only — deletes auth user too via cascade) */
  delete: async (id) => {
    // Uses service-role key only — this won't work from frontend.
    // Instead, deactivate the user:
    return usersApi.setActive(id, false);
  },

  /** Get user stats (total users, by role) */
  stats: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role');
    if (error) throw { message: error.message };

    const total  = data.length;
    const admins  = data.filter(u => u.role === 'admin').length;
    const editors = data.filter(u => u.role === 'editor').length;
    const users   = data.filter(u => u.role === 'user').length;
    return { total, admins, editors, users };
  },
};

export default usersApi;
