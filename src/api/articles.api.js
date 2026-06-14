// ─────────────────────────────────────────
//  ARTICLES API — Supabase Integration
// ─────────────────────────────────────────

import supabase from './supabase.js';

export const articlesApi = {
  /** List articles with optional filters */
  list: async ({ page = 1, limit = 12, category = '', search = '', sort = 'newest', status = 'published' } = {}) => {
    let query = supabase
      .from('articles')
      .select('*, profiles(full_name)', { count: 'exact' })
      .eq('status', status);

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);
    
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    if (sort === 'oldest') query = query.order('created_at', { ascending: true });
    if (sort === 'views') query = query.order('views', { ascending: false });

    const { data, error, count } = await query.range(start, end);
    if (error) throw error;
    return { data, total: count };
  },

  /** Get a single article by ID */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(full_name, bio)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Get article by slug */
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(full_name, bio)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  /** Create a new article */
  create: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: article, error } = await supabase
      .from('articles')
      .insert({ ...data, author_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return article;
  },

  /** Update an article */
  update: async (id, data) => {
    const { data: article, error } = await supabase
      .from('articles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return article;
  },

  /** Patch an article (partial update) — same as update in Supabase */
  patch: async (id, data) => {
    return articlesApi.update(id, data);
  },

  /** Delete an article */
  delete: async (id) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
  },

  /** Publish an article */
  publish: async (id) => {
    return articlesApi.update(id, { status: 'published' });
  },

  /** Archive an article */
  archive: async (id) => {
    return articlesApi.update(id, { status: 'archived' });
  },

  /** Get related articles (same category, excluding self) */
  related: async (id, limit = 3) => {
    const { data: article } = await supabase.from('articles').select('category').eq('id', id).single();
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .eq('category', article.category)
      .eq('status', 'published')
      .neq('id', id)
      .limit(limit);
    if (error) throw error;
    return data;
  },

  /** Upload article cover image */
  uploadCover: async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('article-covers')
      .upload(fileName, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('article-covers')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  /** Get article stats (views) */
  stats: async (id) => {
    const { data, error } = await supabase
      .from('articles')
      .select('views, created_at, updated_at')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Increment view count */
  view: async (id) => {
    await supabase.rpc('increment_views', { article_id: id });
  },
};

export default articlesApi;
