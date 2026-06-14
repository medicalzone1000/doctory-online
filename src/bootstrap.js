// ─────────────────────────────────────────
//  APP BOOTSTRAP — restore session before UI
// ─────────────────────────────────────────

import authService from './services/auth.service.js';

let initPromise = null;

/** Ensure Supabase session is loaded once per page */
export const bootstrap = () => {
  if (!initPromise) {
    initPromise = authService.init();
  }
  return initPromise;
};

export default bootstrap;
