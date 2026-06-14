// ─────────────────────────────────────────
//  DATA NORMALIZATION — Supabase → UI models
// ─────────────────────────────────────────

export const normalizeArticle = (raw) => {
  if (!raw) return null;

  const profile = raw.profiles || raw.profile || null;
  const authorProfile = Array.isArray(profile) ? profile[0] : profile;

  return {
    id: raw.id,
    _id: raw.id,
    title: raw.title || '',
    slug: raw.slug || '',
    excerpt: raw.excerpt || '',
    content: raw.content || raw.body || '',
    cover: raw.cover_url || raw.cover || '',
    category: raw.category || 'general',
    status: raw.status || 'draft',
    views: raw.views ?? 0,
    tags: raw.tags || [],
    createdAt: raw.created_at || raw.createdAt || null,
    updatedAt: raw.updated_at || raw.updatedAt || null,
    author: {
      name: authorProfile?.full_name || raw.author?.name || 'MediCore',
      bio: authorProfile?.bio || raw.author?.bio || '',
    },
  };
};

export const normalizeArticles = (rows = []) =>
  rows.map(normalizeArticle).filter(Boolean);

export const normalizeProfile = (raw) => {
  if (!raw) return null;

  return {
    id: raw.id,
    _id: raw.id,
    name: raw.full_name || raw.name || '',
    email: raw.email || '',
    bio: raw.bio || '',
    role: raw.role || 'user',
    active: raw.active !== false,
    avatarUrl: raw.avatar_url || raw.avatarUrl || '',
    createdAt: raw.created_at || raw.createdAt || null,
    updatedAt: raw.updated_at || raw.updatedAt || null,
  };
};

export const normalizeProfiles = (rows = []) =>
  rows.map(normalizeProfile).filter(Boolean);

export const normalizeUser = (raw) => {
  if (!raw) return null;

  const profile = raw.profile || raw.profiles || {};
  const profileData = Array.isArray(profile) ? profile[0] : profile;

  return {
    id: raw.id,
    email: raw.email || profileData?.email || '',
    name: profileData?.full_name || raw.user_metadata?.full_name || raw.full_name || raw.name || '',
    bio: profileData?.bio || raw.bio || '',
    role: profileData?.role || raw.role || 'user',
    profile: profileData || null,
    user_metadata: raw.user_metadata || {},
  };
};
