// ─────────────────────────────────────────
//  ARTICLE DETAIL PAGE CONTROLLER
// ─────────────────────────────────────────
import Navbar        from '../components/common/Navbar.js';
import articlesApi   from '../api/articles.api.js';
import { formatDateTime, readingTime } from '../utils/date.js';
import { sanitizeHTML }  from '../utils/sanitize.js';
import { getParam, $ }   from '../utils/dom.js';
import { ROUTES }         from '../../config/constants.js';

new Navbar('#navbar');

const id      = getParam('id');
const slug    = getParam('slug');
const wrapper = $('#article-content');

if (!id && !slug) {
  wrapper.innerHTML = `
    <div class="card card--empty" style="margin:auto;max-width:480px">
      <p class="card__empty-title">Article not found</p>
      <a href="${ROUTES.ARTICLES}" class="btn btn--primary" style="margin-top:var(--space-4)">Back to Articles</a>
    </div>
  `;
} else {
  try {
    const article = id ? await articlesApi.getById(id) : await articlesApi.getBySlug(slug);

    // Track view (fire and forget)
    articlesApi.view(article._id || article.id).catch(() => {});

    document.title = `${article.title} — MediCore`;

    const initials = article.author?.name
      ? article.author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'MC';

    wrapper.innerHTML = `
      <div class="article-detail">
        <div class="article-detail__main">
          ${article.cover
            ? `<img class="article-detail__cover" src="${article.cover}" alt="${article.title}">`
            : ''
          }

          <div class="article-detail__eyebrow">
            <a href="${ROUTES.ARTICLES}" class="text-muted text-sm" style="text-decoration:none">← Articles</a>
            <span class="badge badge--primary">${article.category || 'General'}</span>
          </div>

          <h1 class="article-detail__title">${article.title}</h1>

          <div class="article-detail__meta">
            <div class="article-detail__author">
              <div class="article-detail__avatar">${initials}</div>
              <span>${article.author?.name || 'MediCore Editorial'}</span>
            </div>
            <span>📅 ${formatDateTime(article.createdAt)}</span>
            <span>⏱ ${readingTime(article.content)}</span>
            ${article.views ? `<span>👁 ${article.views.toLocaleString()} views</span>` : ''}
          </div>

          <div class="prose article-detail__body">
            ${sanitizeHTML(article.content || article.body || '<p>No content available.</p>')}
          </div>
        </div>

        <aside class="article-sidebar">
          ${article.tags?.length ? `
            <div class="sidebar-card">
              <p class="sidebar-card__title">Tags</p>
              <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
                ${article.tags.map(t => `<span class="badge badge--gray">${t}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          <div class="sidebar-card">
            <p class="sidebar-card__title">About the author</p>
            <div style="display:flex;align-items:center;gap:var(--space-3)">
              <div class="article-detail__avatar" style="width:2.5rem;height:2.5rem;font-size:var(--text-sm)">${initials}</div>
              <div>
                <p style="font-weight:var(--font-weight-semibold);font-size:var(--text-sm)">${article.author?.name || 'MediCore Editorial'}</p>
                ${article.author?.bio ? `<p class="text-sm text-muted">${article.author.bio}</p>` : ''}
              </div>
            </div>
          </div>

          <a href="${ROUTES.ARTICLES}" class="btn btn--secondary btn--block">← More Articles</a>
        </aside>
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = `
      <div class="card card--empty" style="margin:auto;max-width:480px">
        <p class="card__empty-title">Could not load article</p>
        <p class="card__empty-description">${err.message}</p>
        <a href="${ROUTES.ARTICLES}" class="btn btn--primary" style="margin-top:var(--space-4)">Back to Articles</a>
      </div>
    `;
  }
}