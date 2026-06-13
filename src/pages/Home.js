// ─────────────────────────────────────────
//  HOME PAGE CONTROLLER
// ─────────────────────────────────────────
import Navbar          from '../components/common/Navbar.js';
import { showSkeletons } from '../components/common/Spinner.js';
import articlesApi     from '../api/articles.api.js';
import { CATEGORIES, ROUTES } from '../../config/constants.js';
import { formatShort } from '../utils/date.js';
import { truncate }    from '../utils/sanitize.js';
import { $, $$ }       from '../utils/dom.js';

new Navbar('#navbar');

// ─── Category grid ───
const categoryIcons = {
  cardiology: '❤️', neurology: '🧠', oncology: '🔬',
  pediatrics: '👶', dermatology: '🩺', orthopedics: '🦴',
  psychiatry: '🧩', nutrition: '🥗', general: '⚕️',
};

const categoryGrid = $('#category-grid');
if (categoryGrid) {
  categoryGrid.innerHTML = CATEGORIES.map(cat => `
    <a href="${ROUTES.ARTICLES}?category=${cat.id}" class="category-chip">
      <span class="category-chip__icon">${categoryIcons[cat.id] || '📋'}</span>
      ${cat.label}
    </a>
  `).join('');
}

// ─── Latest articles ───
const grid = $('#articles-grid');
if (grid) {
  showSkeletons(grid, 3);
  try {
    const res = await articlesApi.list({ limit: 3, status: 'published', sort: 'newest' });
    const articles = res.data || res.articles || res;

    if (!articles?.length) {
      grid.innerHTML = '<p class="text-muted" style="grid-column:1/-1">No articles yet.</p>';
    } else {
      grid.innerHTML = articles.map(a => `
        <article class="card card--article card--hoverable">
          ${a.cover ? `
            <div class="card__media">
              <img src="${a.cover}" alt="${a.title}" loading="lazy">
            </div>
          ` : ''}
          <div class="card__body">
            <p class="card__eyebrow">${a.category || 'General'}</p>
            <h3 class="card__title">
              <a href="${ROUTES.ARTICLE_DETAIL}?id=${a._id || a.id}">${a.title}</a>
            </h3>
            <p class="card__description">${truncate(a.excerpt || a.content, 120)}</p>
            <div class="card__meta">
              <span class="card__meta-item">${a.author?.name || 'MediCore'}</span>
              <span class="card__meta-item">${formatShort(a.createdAt)}</span>
            </div>
          </div>
        </article>
      `).join('');
    }
  } catch {
    grid.innerHTML = '<p class="text-muted" style="grid-column:1/-1">Could not load articles.</p>';
  }
}