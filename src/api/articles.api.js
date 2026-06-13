// ─────────────────────────────────────────
//  ARTICLES API  —  Supabase implementation
// ─────────────────────────────────────────

import supabase from './supabase.js';
import { SUPABASE_URL } from '../../config/constants.js';

/** Generate a URL-friendly slug from a title */
const slugify = (text) =>
  text.toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

export const articlesApi = {

  /** List articles with filters */
  list: async ({ page = 1, limit = 12, category = '', search = '', sort = 'newest', status = 'published' } = {}) => {
    let query = supabase
      .from('articles')
      .select('*, author:profiles(id, full_name, avatar_url)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    if (sort === 'newest')   query = query.order('created_at', { ascending: false });
    if (sort === 'oldest')   query = query.order('created_at', { ascending: true });
    if (sort === 'popular')  query = query.order('views', { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw { message: error.message };

    return { articles: data, total: count, page, limit };
  },

  /** Get a single article by ID */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw { message: error.message, status: 404 };
    return data;
  },

  /** Get article by slug */
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('slug', slug)
      .single();
    if (error) throw { message: error.message, status: 404 };
    return data;
  },

  /** Create article */
  create: async (articleData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const slug = slugify(articleData.title) + '-' + Date.now();

    const { data, error } = await supabase
      .from('articles')
      .insert({ ...articleData, slug, author_id: user.id })
      .select()
      .single();
    if (error) throw { message: error.message };
    return data;
  },

  /** Update article */
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw { message: error.message };
    return data;
  },

  /** Patch article */
  patch: async (id, updates) => articlesApi.update(id, updates),

  /** Delete article */
  delete: async (id) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw { message: error.message };
    return { success: true };
  },

  /** Publish article */
  publish: (id) => articlesApi.update(id, { status: 'published' }),

  /** Archive article */
  archive: (id) => articlesApi.update(id, { status: 'archived' }),

  /** Get related articles (same category) */
  related: async (id, limit = 3) => {
    const article = await articlesApi.getById(id);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, cover_url, category, created_at')
      .eq('category', article.category)
      .eq('status', 'published')
      .neq('id', id)
      .limit(limit);
    if (error) throw { message: error.message };
    return data;
  },

  /** Upload article cover image to Supabase Storage */
  uploadCover: async (id, file) => {
    const ext  = file.name.split('.').pop();
    const path = `${id}/cover.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('article-covers')
      .upload(path, file, { upsert: true });
    if (uploadError) throw { message: uploadError.message };

    const { data } = supabase.storage.from('article-covers').getPublicUrl(path);
    const cover_url = data.publicUrl;

    return articlesApi.update(id, { cover_url });
  },

  /** Increment view count */
  view: async (id) => {
    await supabase.rpc('increment_views', { article_id: id });
    return { success: true };
  },

  /** Get article stats */
  stats: async (id) => {
    const { data, error } = await supabase
      .from('articles')
      .select('views')
      .eq('id', id)
      .single();
    if (error) throw { message: error.message };
    return data;
  },
};

export default articlesApi;
