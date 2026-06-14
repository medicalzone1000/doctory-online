// ─────────────────────────────────────────
//  ARTICLES API — Supabase Integration
// ─────────────────────────────────────────

import supabase from './supabase.js';
import { normalizeArticle, normalizeArticles } from '../utils/normalize.js';

const slugify = (text) =>
  String(text || 'article')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const uniqueSlug = (title) => `${slugify(title)}-${Date.now().toString(36)}`;

export const articlesApi = {
  list: async ({ page = 1, limit = 12, category = '', search = '', sort = 'newest', status = 'published' } = {}) => {
    let query = supabase
      .from('articles')
      .select('*, profiles(full_name, bio)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    if (sort === 'oldest') query = query.order('created_at', { ascending: true });
    if (sort === 'views') query = query.order('views', { ascending: false });

    const { data, error, count } = await query.range(start, end);
    if (error) throw error;

    const articles = normalizeArticles(data || []);
    const total = count ?? articles.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return { data: articles, articles, total, totalPages };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(full_name, bio)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return normalizeArticle(data);
  },

  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(full_name, bio)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return normalizeArticle(data);
  },

  create: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      title: data.title,
      slug: data.slug || uniqueSlug(data.title),
      excerpt: data.excerpt || '',
      content: data.content,
      category: data.category || 'general',
      status: data.status || 'draft',
      cover_url: data.cover_url || data.cover || null,
      author_id: user?.id || null,
    };

    const { data: article, error } = await supabase
      .from('articles')
      .insert(payload)
      .select('*, profiles(full_name, bio)')
      .single();
    if (error) throw error;
    return normalizeArticle(article);
  },

  update: async (id, data) => {
    const payload = { ...data };
    if (payload.cover) {
      payload.cover_url = payload.cover;
      delete payload.cover;
    }
    delete payload.tags;

    const { data: article, error } = await supabase
      .from('articles')
      .update(payload)
      .eq('id', id)
      .select('*, profiles(full_name, bio)')
      .single();
    if (error) throw error;
    return normalizeArticle(article);
  },

  patch: async (id, data) => articlesApi.update(id, data),

  delete: async (id) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
  },

  publish: async (id) => articlesApi.update(id, { status: 'published' }),

  archive: async (id) => articlesApi.update(id, { status: 'archived' }),

  related: async (id, limit = 3) => {
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('category')
      .eq('id', id)
      .single();
    if (articleError) throw articleError;

    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .eq('category', article.category)
      .eq('status', 'published')
      .neq('id', id)
      .limit(limit);
    if (error) throw error;
    return normalizeArticles(data || []);
  },

  uploadCover: async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('article-covers').upload(fileName, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('article-covers').getPublicUrl(fileName);
    return publicUrl;
  },

  stats: async (id) => {
    const { data, error } = await supabase
      .from('articles')
      .select('views, created_at, updated_at')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  dashboardStats: async () => {
    const { count: total, error: totalError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
    if (totalError) throw totalError;

    const { count: published, error: publishedError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');
    if (publishedError) throw publishedError;

    const { data: viewRows, error: viewsError } = await supabase
      .from('articles')
      .select('views');
    if (viewsError) throw viewsError;

    const totalViews = (viewRows || []).reduce((sum, row) => sum + (row.views || 0), 0);

    return {
      total: total || 0,
      published: published || 0,
      totalViews,
    };
  },

  view: async (id) => {
    await supabase.rpc('increment_views', { article_id: id });
  },
};

export default articlesApi;
