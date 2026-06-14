// ─────────────────────────────────────────
//  USERS API — Supabase Integration
// ─────────────────────────────────────────

import supabase from './supabase.js';

export const usersApi = {
  /** List all users (admin only) */
  list: async ({ page = 1, limit = 20, search = '', role = '' } = {}) => {
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    
    if (search) query = query.ilike('full_name', `%${search}%`);
    if (role) query = query.eq('role', role);
    
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    const { data, error, count } = await query
      .range(start, end)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, total: count };
  },

  /** Get user by ID */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Update user profile */
  update: async (id, data) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return profile;
  },

  /** Change user role (admin only) */
  setRole: async (id, role) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Activate / deactivate user */
  setActive: async (id, active) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ active })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Delete user (admin only) — deletes from auth.users too */
  delete: async (id) => {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  },

  /** Get user stats */
  stats: async () => {
    const { data: total, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (totalError) throw totalError;

    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (adminsError) throw adminsError;

    const { data: editors, error: editorsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'editor');
    if (editorsError) throw editorsError;

    const { data: active, error: activeError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
    if (activeError) throw activeError;

    return {
      total: total.count,
      admins: admins.count,
      editors: editors.count,
      active: active.count,
      inactive: total.count - active.count,
    };
  },
};

export default usersApi;
