// ─────────────────────────────────────────
//  ARTICLES API
// ─────────────────────────────────────────

import client from './client.js';

export const articlesApi = {
  /** List articles with optional filters */
  list: ({ page = 1, limit = 12, category = '', search = '', sort = 'newest', status = '' } = {}) =>
    client.get('/articles', { page, limit, category, search, sort, status }),

  /** Get a single article by ID or slug */
  getById: (id) =>
    client.get(`/articles/${id}`),

  /** Get article by slug */
  getBySlug: (slug) =>
    client.get(`/articles/slug/${slug}`),

  /** Create a new article */
  create: (data) =>
    client.post('/articles', data),

  /** Update an article */
  update: (id, data) =>
    client.put(`/articles/${id}`, data),

  /** Patch an article (partial update) */
  patch: (id, data) =>
    client.patch(`/articles/${id}`, data),

  /** Delete an article */
  delete: (id) =>
    client.delete(`/articles/${id}`),

  /** Publish an article */
  publish: (id) =>
    client.patch(`/articles/${id}`, { status: 'published' }),

  /** Archive an article */
  archive: (id) =>
    client.patch(`/articles/${id}`, { status: 'archived' }),

  /** Get related articles */
  related: (id, limit = 3) =>
    client.get(`/articles/${id}/related`, { limit }),

  /** Upload article cover image */
  uploadCover: (id, formData) =>
    client.upload(`/articles/${id}/cover`, formData),

  /** Get article stats (views, reads) */
  stats: (id) =>
    client.get(`/articles/${id}/stats`),

  /** Increment view count */
  view: (id) =>
    client.post(`/articles/${id}/view`),
};

export default articlesApi;