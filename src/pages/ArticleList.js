// ─────────────────────────────────────────
//  ARTICLES LIST PAGE CONTROLLER
// ─────────────────────────────────────────
import Navbar           from '../components/common/Navbar.js';
import Pagination       from '../components/common/Pagination.js';
import { showSkeletons } from '../components/common/Spinner.js';
import articlesApi      from '../api/articles.api.js';
import store            from '../store/index.js';
import { CATEGORIES, ROUTES, PAGE_SIZE } from '../../config/constants.js';
import { formatShort }  from '../utils/date.js';
import { truncate }     from '../utils/sanitize.js';
import { $, getParam, updateUrl, debounce } from '../utils/dom.js';

new Navbar('#navbar');

// ─── Populate category filter ───
const catFilter = $('#category-filter');
CATEGORIES.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.id;
  opt.textContent = c.label;
  catFilter.appendChild(opt);
});

// ─── State from URL ───
const state = {
  page:     Number(getParam('page'))     || 1,
  category: getParam('category')         || '',
  search:   getParam('search')           || '',
  sort:     getParam('sort')             || 'newest',
};

catFilter.value                          = state.category;
$('#sort-filter').value                  = state.sort;
$('#search-input').value                 = state.search;

// ─── Render articles ───
const grid       = $('#articles-grid');
const countEl    = $('#results-count');
const pagination = new Pagination('#pagination', (page) => {
  state.page = page;
  load();
});

const renderCard = (a) => `
  <article class="card card--article card--hoverable">
    ${a.cover ? `<div class="card__media"><img src="${a.cover}" alt="${a.title}" loading="lazy"></div>` : ''}
    <div class="card__body">
      <p class="card__eyebrow">${a.category || 'General'}</p>
      <h3 class="card__title">
        <a href="${ROUTES.ARTICLE_DETAIL}?id=${a._id || a.id}">${a.title}</a>
      </h3>
      <p class="card__description">${truncate(a.excerpt || a.content || '', 120)}</p>
      <div class="card__meta">
        <span class="card__meta-item">✍ ${a.author?.name || 'MediCore'}</span>
        <span class="card__meta-item">📅 ${formatShort(a.createdAt)}</span>
        ${a.readTime ? `<span class="card__meta-item">⏱ ${a.readTime}</span>` : ''}
      </div>
    </div>
  </article>
`;

async function load() {
  showSkeletons(grid, 6);
  updateUrl({ page: state.page, category: state.category, search: state.search, sort: state.sort });

  try {
    const res = await articlesApi.list({
      page:     state.page,
      limit:    PAGE_SIZE,
      category: state.category,
      search:   state.search,
      sort:     state.sort,
      status:   'published',
    });

    const articles   = res.data || res.articles || res;
    const total      = res.total || articles.length;
    const totalPages = res.totalPages || Math.ceil(total / PAGE_SIZE) || 1;

    store.set({ articles, totalPages, currentPage: state.page });

    countEl.textContent = `${total} article${total !== 1 ? 's' : ''} found`;

    if (!articles.length) {
      grid.innerHTML = `
        <div class="card card--empty col-span-full">
          <div class="card__empty-icon" style="font-size:2.5rem">📋</div>
          <p class="card__empty-title">No articles found</p>
          <p class="card__empty-description">Try adjusting your search or filters.</p>
        </div>
      `;
      pagination.render(1, 1);
      return;
    }

    grid.innerHTML = articles.map(renderCard).join('');
    pagination.render(state.page, totalPages);
  } catch (err) {
    grid.innerHTML = `<p class="text-error col-span-full">Failed to load articles. ${err.message}</p>`;
  }
}

// ─── Filters ───
$('#search-input').addEventListener('input', debounce((e) => {
  state.search = e.target.value.trim();
  state.page = 1;
  load();
}, 400));

catFilter.addEventListener('change', (e) => {
  state.category = e.target.value;
  state.page = 1;
  load();
});

$('#sort-filter').addEventListener('change', (e) => {
  state.sort = e.target.value;
  state.page = 1;
  load();
});

// ─── Initial load ───
load();