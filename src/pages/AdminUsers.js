// ─────────────────────────────────────────
//  ADMIN USERS PAGE CONTROLLER
// ─────────────────────────────────────────
import bootstrap        from '../bootstrap.js';
import { requireAdmin } from '../router/guards.js';
import Navbar           from '../components/common/Navbar.js';
import Pagination       from '../components/common/Pagination.js';
import usersApi         from '../api/users.api.js';
import toast            from '../components/common/Toast.js';
import { ADMIN_PAGE_SIZE } from '../../config/constants.js';
import { formatShort }  from '../utils/date.js';
import { escapeText }   from '../utils/sanitize.js';
import { $, $$, debounce } from '../utils/dom.js';

await bootstrap();
if (!(await requireAdmin())) {
  throw new Error('redirect');
}

new Navbar('#navbar');

// ─── Active nav ───
$$('.admin-nav__item').forEach(link => {
  if (link.getAttribute('data-nav') === 'users') link.classList.add('admin-nav__item--active');
});

// ─── State ───
const state = { page: 1, search: '', role: '' };

// ─── Pagination ───
const pagination = new Pagination('#pagination', (page) => {
  state.page = page;
  load();
});

// ─── Role badge ───
const roleBadge = (role) => {
  const map = { admin: 'badge--danger', editor: 'badge--primary', user: 'badge--gray' };
  return `<span class="badge ${map[role] || 'badge--gray'}">${role}</span>`;
};

// ─── Active badge ───
const activeBadge = (active) =>
  active === false
    ? `<span class="badge badge--gray">Inactive</span>`
    : `<span class="badge badge--success">Active</span>`;

// ─── Initials avatar ───
const initials = (name) =>
  (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Load users ───
async function load() {
  const tbody = $('#users-body');
  tbody.innerHTML = `<tr><td colspan="6" class="admin-table__loading"><div class="spinner spinner--sm"></div></td></tr>`;

  try {
    const res   = await usersApi.list({ ...state, limit: ADMIN_PAGE_SIZE });
    const users = res.data || res.users || res;
    const total = res.total || users.length;
    const totalPages = res.totalPages || Math.ceil(total / ADMIN_PAGE_SIZE) || 1;

    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="admin-table__loading">No users found.</td></tr>`;
      pagination.render(1, 1);
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <div style="width:2rem;height:2rem;border-radius:50%;background:var(--color-primary-subtle);
                        color:var(--color-primary);display:flex;align-items:center;justify-content:center;
                        font-size:var(--text-xs);font-weight:var(--font-weight-semibold);flex-shrink:0">
              ${initials(u.name)}
            </div>
            <span style="font-weight:var(--font-weight-medium);color:var(--color-text-primary)">${escapeText(u.name || '—')}</span>
          </div>
        </td>
        <td>${escapeText(u.email || '—')}</td>
        <td>${roleBadge(u.role || 'user')}</td>
        <td>${activeBadge(u.active)}</td>
        <td>${formatShort(u.createdAt)}</td>
        <td>
          <div class="admin-table__actions">
            <button class="btn btn--ghost btn--xs" data-role-id="${u.id}" data-role-name="${escapeText(u.name || '')}" data-current-role="${u.role || 'user'}">Role</button>
            <button class="btn btn--ghost btn--xs" data-toggle-id="${u.id}" data-active="${u.active !== false}">
              ${u.active === false ? 'Activate' : 'Deactivate'}
            </button>
            <button class="btn btn--danger btn--xs" data-delete-id="${u.id}" data-delete-name="${escapeText(u.name || '')}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    pagination.render(state.page, totalPages);
    bindTableActions();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="admin-table__loading text-error">${escapeText(err.message)}</td></tr>`;
  }
}

// ─── Table actions ───
function bindTableActions() {
  // Change role
  $$('[data-role-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      openRoleModal(btn.dataset.roleId, btn.dataset.roleName, btn.dataset.currentRole);
    });
  });

  // Toggle active
  $$('[data-toggle-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id     = btn.dataset.toggleId;
      const active = btn.dataset.active === 'true';
      try {
        await usersApi.setActive(id, !active);
        toast.success(`User ${!active ? 'activated' : 'deactivated'}.`);
        load();
      } catch (err) {
        toast.error(err.message);
      }
    });
  });

  // Delete
  $$('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      openDeleteModal(btn.dataset.deleteId, btn.dataset.deleteName);
    });
  });
}

// ─── Role Modal ───
const roleOverlay  = $('#role-modal-overlay');
let roleTargetId   = null;

function openRoleModal(id, name, currentRole) {
  roleTargetId = id;
  $('#role-user-name').textContent = name;
  $('#role-select').value = currentRole;
  roleOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeRoleModal() {
  roleOverlay.style.display = 'none';
  document.body.style.overflow = '';
  roleTargetId = null;
}

$('#role-modal-close').addEventListener('click', closeRoleModal);
$('#role-cancel-btn').addEventListener('click', closeRoleModal);
roleOverlay.addEventListener('click', (e) => { if (e.target === roleOverlay) closeRoleModal(); });

$('#role-save-btn').addEventListener('click', async () => {
  if (!roleTargetId) return;
  const role = $('#role-select').value;
  try {
    await usersApi.setRole(roleTargetId, role);
    toast.success('Role updated successfully.');
    closeRoleModal();
    load();
  } catch (err) {
    toast.error(err.message || 'Could not update role.');
  }
});

// ─── Delete Modal ───
const deleteOverlay = $('#delete-modal-overlay');
let deleteTargetId  = null;

function openDeleteModal(id, name) {
  deleteTargetId = id;
  $('#delete-user-name').textContent = name;
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
    await usersApi.delete(deleteTargetId);
    toast.success('User deleted.');
    closeDeleteModal();
    load();
  } catch (err) {
    toast.error(err.message || 'Could not delete user.');
  }
});

// ─── Filters ───
$('#search-input').addEventListener('input', debounce((e) => {
  state.search = e.target.value.trim();
  state.page = 1;
  load();
}, 400));

$('#role-filter').addEventListener('change', (e) => {
  state.role = e.target.value;
  state.page = 1;
  load();
});

// ─── Initial load ───
load();
