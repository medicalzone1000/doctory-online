// ─────────────────────────────────────────
//  ROUTER GUARDS
//  Protect routes from unauthorized access
// ─────────────────────────────────────────

import authService from '../services/auth.service.js';
import { ROUTES } from '../../config/constants.js';

/**
 * Require authentication — redirect to login if not logged in
 * Usage: call at top of any protected page's JS
 */
export const requireAuth = () => {
  if (!authService.isAuthenticated()) {
    authService.redirectToLogin('auth_required');
    return false;
  }
  return true;
};

/**
 * Require admin role
 */
export const requireAdmin = () => {
  if (!authService.isAuthenticated()) {
    authService.redirectToLogin('auth_required');
    return false;
  }
  if (!authService.isAdmin()) {
    window.location.href = ROUTES.HOME;
    return false;
  }
  return true;
};

/**
 * Require editor role or higher
 */
export const requireEditor = () => {
  if (!authService.isAuthenticated()) {
    authService.redirectToLogin('auth_required');
    return false;
  }
  if (!authService.isEditor()) {
    window.location.href = ROUTES.HOME;
    return false;
  }
  return true;
};

/**
 * Redirect away from auth pages if already logged in
 * Usage: call on login/register pages
 */
export const requireGuest = () => {
  if (authService.isAuthenticated()) {
    window.location.href = ROUTES.HOME;
    return false;
  }
  return true;
};

/**
 * Soft check — returns true/false without redirecting
 */
export const isAuthenticated = () => authService.isAuthenticated();
export const isAdmin         = () => authService.isAdmin();
export const isEditor        = () => authService.isEditor();