// ─────────────────────────────────────────
//  ADMIN DASHBOARD CONTROLLER
// ─────────────────────────────────────────
import bootstrap       from '../bootstrap.js';
import { requireAdmin } from '../router/guards.js';
import Navbar           from '../components/common/Navbar.js';
import articlesApi      from '../api/articles.api.js';
import usersApi         from '../api/users.api.js';
import { formatShort }  from '../utils/date.js';
import { escapeText }   from '../utils/sanitize.js';
import { $, $$ }        from '../utils/dom.js';
import { ROUTES }       from '../../config/constants.js';

await bootstrap();
if (!(await requireAdmin())) {
  throw new Error('redirect');
}

new Navbar('#navbar');

$$('.admin-nav__item').forEach(link => {
  if (link.getAttribute('data-nav') === 'dashboard') link.classList.add('admin-nav__item--active');
});

const statsGrid = $('#stats-grid');

try {
  const [articleStats, usersRes] = await Promise.all([
    articlesApi.dashboardStats(),
    usersApi.stats(),
  ]);

  const stats = [
    { label: 'Total Articles', value: articleStats.total.toLocaleString() },
    { label: 'Published', value: articleStats.published.toLocaleString() },
    { label: 'Total Users', value: usersRes.total.toLocaleString() },
    { label: 'Total Views', value: articleStats.totalViews.toLocaleString() },
  ];

  statsGrid.innerHTML = stats.map(s => `
    <div class="card card--stat">
      <p class="card__stat-label">${s.label}</p>
      <p class="card__stat-value">${s.value}</p>
    </div>
  `).join('');
} catch {
  statsGrid.innerHTML = `
    <div class="card card--stat" style="grid-column:1/-1">
      <p class="card__stat-label text-muted">Could not load stats</p>
    </div>
  `;
}

const tbody = $('#recent-articles-body');

const statusBadge = (status) => {
  const map = {
    published: 'badge--success',
    draft: 'badge--warning',
    archived: 'badge--gray',
  };
  return `<span class="badge ${map[status] || 'badge--gray'}">${status}</span>`;
};

try {
  const res = await articlesApi.list({ limit: 10, sort: 'newest', status: '' });
  const articles = res.data || [];

  if (!articles.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-table__loading">No articles yet</td></tr>';
  } else {
    tbody.innerHTML = articles.map(a => `
      <tr>
        <td><a href="${ROUTES.ARTICLE_DETAIL}?id=${a.id}" style="font-weight:var(--font-weight-medium);color:var(--color-text-primary)">${escapeText(a.title)}</a></td>
        <td>${escapeText(a.category || '—')}</td>
        <td>${statusBadge(a.status)}</td>
        <td>${formatShort(a.createdAt)}</td>
        <td>
          <div class="admin-table__actions">
            <a href="${ROUTES.ARTICLE_DETAIL}?id=${a.id}" class="btn btn--ghost btn--xs">View</a>
            <a href="${ROUTES.ADMIN_ARTICLES}?edit=${a.id}" class="btn btn--secondary btn--xs">Edit</a>
          </div>
        </td>
      </tr>
    `).join('');
  }
} catch (err) {
  tbody.innerHTML = `<tr><td colspan="5" class="admin-table__loading text-error">${escapeText(err.message)}</td></tr>`;
}
