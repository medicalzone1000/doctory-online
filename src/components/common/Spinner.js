// ─────────────────────────────────────────
//  SPINNER / SKELETON COMPONENTS
// ─────────────────────────────────────────

/** Full-page loading overlay */
export const showPageLoader = () => {
  let el = document.getElementById('page-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'page-loader';
    el.className = 'page-loader';
    el.innerHTML = '<div class="spinner spinner--lg"></div>';
    document.body.appendChild(el);
  }
  el.classList.add('page-loader--visible');
};

export const hidePageLoader = () => {
  document.getElementById('page-loader')?.classList.remove('page-loader--visible');
};

/** Inline spinner HTML */
export const spinnerHTML = (size = 'md') =>
  `<div class="spinner spinner--${size}" role="status" aria-label="Loading"></div>`;

/** Article card skeleton */
export const articleSkeletonHTML = () => `
  <div class="skeleton-card">
    <div class="skeleton skeleton--img"></div>
    <div class="skeleton-card__body">
      <div class="skeleton skeleton--line" style="width:40%"></div>
      <div class="skeleton skeleton--line skeleton--title"></div>
      <div class="skeleton skeleton--line" style="width:90%"></div>
      <div class="skeleton skeleton--line" style="width:75%"></div>
      <div class="skeleton skeleton--line" style="width:50%;margin-top:1rem"></div>
    </div>
  </div>
`;

/** Render N skeletons into a container */
export const showSkeletons = (container, count = 6) => {
  if (!container) return;
  container.innerHTML = Array(count).fill(articleSkeletonHTML()).join('');
};