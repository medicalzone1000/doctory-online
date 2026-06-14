// ─────────────────────────────────────────
//  APP CONFIGURATION & CONSTANTS
// ─────────────────────────────────────────

import { resolvePath } from './paths.js';

export const APP_NAME = 'MediCore';
export const APP_VERSION = '1.0.0';

// ─── Supabase ───
export const SUPABASE_URL = 'https://egcfnjfrrajxwfhucltk.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_GnkQKXmS21U-j7wj2gkx_A_Vnggq62D'; 

// ─── API (legacy — kept for reference) ───
export const API_BASE_URL = 'https://api.medicore.example.com/v1';
export const API_TIMEOUT = 10000;

// ─── Auth ───
export const TOKEN_KEY = 'medicore_token';
export const REFRESH_TOKEN_KEY = 'medicore_refresh';
export const USER_KEY = 'medicore_user';

// ─── Roles ───
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
};

// ─── Pagination ───
export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

// ─── Article Status ───
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// ─── Article Categories ───
export const CATEGORIES = [
  { id: 'cardiology',    label: 'Cardiology' },
  { id: 'neurology',     label: 'Neurology' },
  { id: 'oncology',      label: 'Oncology' },
  { id: 'pediatrics',    label: 'Pediatrics' },
  { id: 'dermatology',   label: 'Dermatology' },
  { id: 'orthopedics',   label: 'Orthopedics' },
  { id: 'psychiatry',    label: 'Psychiatry' },
  { id: 'nutrition',     label: 'Nutrition' },
  { id: 'general',       label: 'General Health' },
];

// ─── Toast ───
export const TOAST_DURATION = 4000;
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ─── Routes (multi-page paths, GitHub Pages aware) ───
export const ROUTES = {
  HOME:            resolvePath('index.html'),
  LOGIN:           resolvePath('pages/auth/login.html'),
  REGISTER:        resolvePath('pages/auth/register.html'),
  PROFILE:         resolvePath('pages/auth/profile.html'),
  FORGOT_PASSWORD: resolvePath('pages/auth/forgot-password.html'),
  ARTICLES:        resolvePath('pages/articles/index.html'),
  ARTICLE_DETAIL:  resolvePath('pages/articles/detail.html'),
  ADMIN:           resolvePath('pages/admin/index.html'),
  ADMIN_USERS:     resolvePath('pages/admin/users.html'),
  ADMIN_ARTICLES:  resolvePath('pages/admin/articles.html'),
};
