// ─────────────────────────────────────────
//  ADMIN ARTICLES PAGE CONTROLLER
// ─────────────────────────────────────────
import { requireAdmin }  from '../router/guards.js';
import Navbar            from '../components/common/Navbar.js';
import Pagination        from '../components/common/Pagination.js';
import { showSkeletons } from '../components/common/Spinner.js';
import articlesApi       from '../api/articles.api.js';
import toast             from '../components/common/Toast.js';
import { CATEGORIES, ROUTES, ADMIN_PAGE_SIZE } from '../../config/constants.js';
import { formatShort }   from '../utils/date.js';
import { $, $$, debounce } from '../utils/dom.js';

requireAdmin();
new Navbar('#navbar');

// ─── Active nav ───
$$('.admin-nav__item').forEach(link => {
  if (link.getAttribute('data-nav') === 'articles') link.classList.add('admin-nav__item--active');
});

// ─── Populate category selects ───

const catFilterEl   = $('#category-filter');
const articleCatEl  = $('#article-category');

CATEGORIES.forEach(c => {
  [catFilterEl, articleCatEl].forEach(el => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.label;
    el.appendChild(opt);
  });
});

// ─── State ───
const state = { page: 1, search: '', status: '', category: '' };

// ─── Pagination ───
const pagination = new Pagination('#pagination', (page) => {
  state.page = page;
  load();
});

// ─── Status badge ───
const statusBadge = (status) => {
  const map = { published: 'badge--success', draft: 'badge--warning', archived: 'badge--gray' };
  return `<span class="badge ${map[status] || 'badge--gray'}">${status}</span>`;
};

// ─── Render table ───
async function load() {
  const tbody = $('#articles-body');
  tbody.innerHTML = `<tr><td colspan="6" class="admin-table__loading"><div class="spinner spinner--sm"></div></td></tr>`;

  try {
    const res      = await articlesApi.list({ ...state, limit: ADMIN_PAGE_SIZE });
    const articles = res.data || res.articles || res;
    const total    = res.total || articles.length;
    const totalPages = res.totalPages || Math.ceil(total / ADMIN_PAGE_SIZE) || 1;

    if (!articles.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="admin-table__loading">No articles found.</td></tr>`;
      pagination.render(1, 1);
      return;
    }

    tbody.innerHTML = articles.map(a => `
      <tr>
        <td style="font-weight:var(--font-weight-medium);color:var(--color-text-primary);max-width:280px">
          <a href="${ROUTES.ARTICLE_DETAIL}?id=${a._id || a.id}" target="_blank" style="color:inherit">${a.title}</a>
        </td>
        <td>${a.category || '—'}</td>
        <td>${a.author?.name || '—'}</td>
        <td>${statusBadge(a.status)}</td>
        <td>${formatShort(a.createdAt)}</td>
        <td>
          <div class="admin-table__actions">
            <button class="btn btn--ghost btn--xs" data-edit="${a._id || a.id}">Edit</button>
            <button class="btn btn--ghost btn--xs" data-toggle="${a._id || a.id}" data-status="${a.status}">
              ${a.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <button class="btn btn--danger btn--xs" data-delete="${a._id || a.id}" data-title="${a.title}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    pagination.render(state.page, totalPages);
    bindTableActions();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="admin-table__loading text-error">${err.message}</td></tr>`;
  }
}

// ─── Table action buttons ───
function bindTableActions() {
  // Edit
  $$('[data-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.edit;
      try {
        const article = await articlesApi.getById(id);
        openModal(article);
      } catch (err) {
        toast.error('Could not load article: ' + err.message);
      }
    });
  });

  // Toggle publish
  $$('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id     = btn.dataset.toggle;
      const status = btn.dataset.status;
      try {
        await articlesApi.patch(id, { status: status === 'published' ? 'draft' : 'published' });
        toast.success('Article updated.');
        load();
      } catch (err) {
        toast.error(err.message);
      }
    });
  });

  // Delete
  $$('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      openDeleteModal(btn.dataset.delete, btn.dataset.title);
    });
  });
}

// ─── Article Modal ───
const modalOverlay = $('#article-modal-overlay');
const modalTitle   = $('#article-modal-title');
const articleForm  = $('#article-form');
const saveBtn      = $('#modal-save-btn');

function openModal(article = null) {
  articleForm.reset();
  $('#article-id').value = '';

  if (article) {
    modalTitle.textContent       = 'Edit Article';
    $('#article-id').value       = article._id || article.id;
    $('#article-title').value    = article.title || '';
    $('#article-category').value = article.category || '';
    $('#article-status').value   = article.status || 'draft';
    $('#article-excerpt').value  = article.excerpt || '';
    $('#article-content').value  = article.content || '';
    $('#article-tags').value     = (article.tags || []).join(', ');
  } else {
    modalTitle.textContent = 'New Article';
  }

  modalOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

$('#new-article-btn').addEventListener('click', () => openModal());
$('#modal-close-btn').addEventListener('click', closeModal);
$('#modal-cancel-btn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

saveBtn.addEventListener('click', async () => {
  const id      = $('#article-id').value;
  const title   = $('#article-title').value.trim();
  const content = $('#article-content').value.trim();

  if (!title || !content) {
    toast.warning('Title and content are required.');
    return;
  }

  const data = {
    title,
    category: $('#article-category').value,
    status:   $('#article-status').value,
    excerpt:  $('#article-excerpt').value.trim(),
    content,
    tags:     $('#article-tags').value.split(',').map(t => t.trim()).filter(Boolean),
  };

  saveBtn.classList.add('btn--loading');
  saveBtn.disabled = true;

  try {
    if (id) {
      await articlesApi.update(id, data);
      toast.success('Article updated successfully.');
    } else {
      await articlesApi.create(data);
      toast.success('Article created successfully.');
    }
    closeModal();
    load();
  } catch (err) {
    toast.error(err.message || 'Could not save article.');
  } finally {
    saveBtn.classList.remove('btn--loading');
    saveBtn.disabled = false;
  }
});

// ─── Delete Modal ───
const deleteOverlay = $('#delete-modal-overlay');
let deleteTargetId  = null;

function openDeleteModal(id, title) {
  deleteTargetId = id;
  $('#delete-article-title').textContent = title;
  deleteOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  deleteOverlay.style.display = 'none';
  document.body.style.overflow = '';
  deleteTargetId = null;
}

$('#delete-modal-close').addEventListener('click', closeDeleteModal);
$('#delete-cancel-btn').addEventListener('click', closeDeleteModal);
deleteOverlay.addEventListener('click', (e) => { if (e.target === deleteOverlay) closeDeleteModal(); });

$('#delete-confirm-btn').addEventListener('click', async () => {
  if (!deleteTargetId) return;
  try {
    await articlesApi.delete(deleteTargetId);
    toast.success('Article deleted.');
    closeDeleteModal();
    load();
  } catch (err) {
    toast.error(err.message || 'Could not delete article.');
  }
});

// ─── Filters ───
$('#search-input').addEventListener('input', debounce((e) => {
  state.search = e.target.value.trim();
  state.page = 1;
  load();
}, 400));

$('#status-filter').addEventListener('change', (e) => {
  state.status = e.target.value;
  state.page = 1;
  load();
});

catFilterEl.addEventListener('change', (e) => {
  state.category = e.target.value;
  state.page = 1;
  load();
});

// ─── Initial load ───
load();
