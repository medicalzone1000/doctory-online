// ─────────────────────────────────────────
//  PATH HELPERS — GitHub Pages + local dev
// ─────────────────────────────────────────

const REPO_SEGMENT = 'doctory-online';

/** Detect GitHub Pages base path (e.g. /doctory-online) */
export const getBasePath = () => {
  const { pathname } = window.location;
  const marker = `/${REPO_SEGMENT}`;
  if (pathname === marker || pathname.startsWith(`${marker}/`)) {
    return marker;
  }
  return '';
};

/** Build an absolute site path from a repo-relative path */
export const resolvePath = (relativePath = '') => {
  const base = getBasePath();
  const clean = String(relativePath).replace(/^\/+/, '');
  if (!clean) return base ? `${base}/` : '/';
  return `${base}/${clean}`.replace(/\/{2,}/g, '/');
};

/** Match current page against a route path */
export const isCurrentPath = (routePath) => {
  const current = window.location.pathname.replace(/\/index\.html$/, '/');
  const target = routePath.replace(/\/index\.html$/, '/');
  return current === target || current.endsWith(target.replace(getBasePath(), ''));
};
