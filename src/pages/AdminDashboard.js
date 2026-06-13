// ─────────────────────────────────────────
//  ADMIN DASHBOARD CONTROLLER
// ─────────────────────────────────────────
import { requireAdmin }  from '../router/guards.js';
import Navbar            from '../components/common/Navbar.js';
import articlesApi       from '../api/articles.api.js';
import usersApi          from '../api/users.api.js';
import { formatShort }   from '../utils/date.js';
import { $, $$ }         from '../utils/dom.js';
import { ROUTES, ARTICLE_STATUS } from '../../config/constants.js';

requireAdmin();
new Navbar('#navbar');

// ─── Active nav link ───
$$('.admin-nav__item').forEach(link => {
  if (link.getAttribute('data-nav') === 'dashboard') link.classList.add('admin-nav__item--active');
});

// ─── Stats ───
const statsGrid = $('#stats-grid');

try {
  const [articlesRes, usersRes] = await Promise.all([
    articlesApi.list({ limit: 1, status: '' }),
    usersApi.stats(),
  ]);

  const total      = articlesRes.total || 0;
  const published  = articlesRes.published || 0;
  const totalUsers = usersRes.total || 0;
  const views      = articlesRes.totalViews || 0;

  const stats = [
    { label: 'Total Articles', value: total.toLocaleString(),     change: '+12%', up: true  },
    { label: 'Published',      value: published.toLocaleString(), change: '+5%',  up: true  },
    { label: 'Total Users',    value: totalUsers.toLocaleString(),change: '+8%',  up: true  },
    { label: 'Total Views',    value: views.toLocaleString(),     change: '+24%', up: true  },
  ];

  statsGrid.innerHTML = stats.map(s => `
    <div class="card card--stat">
      <p class="card__stat-label">${s.label}</p>
      <p class="card__stat-value">${s.value}</p>
      <span class="card__stat-change card__stat-change--${s.up ? 'up' : 'down'}">
        ${s.up ? '↑' : '↓'} ${s.change}
      </span>
    </div>
  `).join('');
} catch {
  statsGrid.innerHTML = `
    <div class="card card--stat" style="grid-column:1/-1">
      <p class="card__stat-label text-muted">Could not load stats</p>
    </div>
  `;
}

// ─── Recent articles ───
const tbody = $('#recent-articles-body');

const statusBadge = (status) => {
  const map = {
    published: 'badge--success',
    draft:     'badge--warning',
    archived:  'badge--gray',
  };
  return `<span class="badge ${map[status] || 'badge--gray'}">${status}</span>`;
};

try {
  const res      = await articlesApi.list({ limit: 10, sort: 'newest' });
  const articles = res.data || res.articles || res;

  if (!articles.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-table__loading">No articles yet</td></tr>';
  } else {
    tbody.innerHTML = articles.map(a => `
      <tr>
        <td><a href="${ROUTES.ARTICLE_DETAIL}?id=${a._id || a.id}" style="font-weight:var(--font-weight-medium);color:var(--color-text-primary)">${a.title}</a></td>
        <td>${a.category || '—'}</td>
        <td>${statusBadge(a.status)}</td>
        <td>${formatShort(a.createdAt)}</td>
        <td>
          <div class="admin-table__actions">
            <a href="${ROUTES.ARTICLE_DETAIL}?id=${a._id || a.id}" class="btn btn--ghost btn--xs">View</a>
            <a href="/pages/admin/articles.html?edit=${a._id || a.id}" class="btn btn--secondary btn--xs">Edit</a>
          </div>
        </td>
      </tr>
    `).join('');
  }
} catch (err) {
  tbody.innerHTML = `<tr><td colspan="5" class="admin-table__loading text-error">${err.message}</td></tr>`;
}