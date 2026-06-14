// ─────────────────────────────────────────
//  USERS API
// ─────────────────────────────────────────

import client from './client.js';

export const usersApi = {
  /** List all users (admin only) */
  list: ({ page = 1, limit = 20, search = '', role = '' } = {}) =>
    client.get('/users', { page, limit, search, role }),

  /** Get user by ID */
  getById: (id) =>
    client.get(`/users/${id}`),

  /** Update user */
  update: (id, data) =>
    client.put(`/users/${id}`, data),

  /** Change user role (admin) */
  setRole: (id, role) =>
    client.patch(`/users/${id}`, { role }),

  /** Activate / deactivate user */
  setActive: (id, active) =>
    client.patch(`/users/${id}`, { active }),

  /** Delete user (admin) */
  delete: (id) =>
    client.delete(`/users/${id}`),

  /** Get user stats */
  stats: () =>
    client.get('/users/stats'),
};

export default usersApi;