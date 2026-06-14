// ─────────────────────────────────────────
//  USERS API — Supabase Integration
// ─────────────────────────────────────────

import supabase from './supabase.js';
import { normalizeProfile, normalizeProfiles } from '../utils/normalize.js';

export const usersApi = {
  list: async ({ page = 1, limit = 20, search = '', role = '' } = {}) => {
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (role) query = query.eq('role', role);

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await query
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const users = normalizeProfiles(data || []);
    const total = count ?? users.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return { data: users, users, total, totalPages };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return normalizeProfile(data);
  },

  update: async (id, data) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return normalizeProfile(profile);
  },

  setRole: async (id, role) => usersApi.update(id, { role }),

  setActive: async (id, active) => usersApi.update(id, { active }),

  delete: async (id) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  stats: async () => {
    const { count: total, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (totalError) throw totalError;

    const { count: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (adminsError) throw adminsError;

    const { count: editors, error: editorsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'editor');
    if (editorsError) throw editorsError;

    const { count: active, error: activeError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
    if (activeError) throw activeError;

    return {
      total: total || 0,
      admins: admins || 0,
      editors: editors || 0,
      active: active || 0,
      inactive: (total || 0) - (active || 0),
    };
  },
};

export default usersApi;
