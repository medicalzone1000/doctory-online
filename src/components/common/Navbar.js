// ─────────────────────────────────────────
//  NAVBAR COMPONENT
// ─────────────────────────────────────────
import authService from '../../services/auth.service.js';
import { ROUTES } from '../../../config/constants.js';
import { isCurrentPath } from '../../../config/paths.js';
import { $ } from '../../utils/dom.js';

export class Navbar {
  #el;

  constructor(selector = '#navbar') {
    this.#el = document.querySelector(selector);
    if (!this.#el) return;
    this.#render();
    this.#bind();
  }

  #render() {
    const user    = authService.getUser();
    const isAuth  = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    this.#el.innerHTML = `
      <div class="navbar__container">
        <a href="${ROUTES.HOME}" class="navbar__logo">
          <span class="navbar__logo-icon">⚕</span>
          <span class="navbar__logo-text">Doctory.online</span>
        </a>

        <nav class="navbar__nav" id="navbar-nav" aria-label="التنقل الرئيسي">
          <ul class="navbar__nav-list">
            <li><a href="${ROUTES.HOME}"     class="navbar__nav-link" data-nav="home">الرئيسية</a></li>
            <li><a href="${ROUTES.ARTICLES}" class="navbar__nav-link" data-nav="articles">المقالات</a></li>
            ${isAdmin ? `<li><a href="${ROUTES.ADMIN}" class="navbar__nav-link" data-nav="admin">لوحة التحكم</a></li>` : ''}
          </ul>
        </nav>

        <div class="navbar__actions">
          ${isAuth ? this.#userMenu(user) : this.#authButtons()}
          <button class="navbar__burger" id="navbar-burger" aria-label="فتح القائمة" aria-expanded="false">
            <span class="navbar__burger-bar"></span>
            <span class="navbar__burger-bar"></span>
            <span class="navbar__burger-bar"></span>
          </button>
        </div>
      </div>
    `;

    this.#setActiveLink();
  }

  #authButtons() {
    return `
      <div class="navbar__auth">
        <a href="${ROUTES.LOGIN}"    class="navbar__auth-login">تسجيل الدخول</a>
        <a href="${ROUTES.REGISTER}" class="navbar__auth-register">إنشاء حساب</a>
      </div>
    `;
  }

  #userMenu(user) {
    const displayName = authService.getDisplayName(user);
    const initials = displayName
      ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'م';

    return `
      <div class="navbar__user">
        <button class="navbar__user-toggle" id="user-toggle" aria-expanded="false" aria-haspopup="true">
          <div class="navbar__user-avatar">${initials}</div>
          <span class="navbar__user-name">${displayName}</span>
          <span class="navbar__user-chevron">▾</span>
        </button>
        <div class="navbar__dropdown" id="user-dropdown" role="menu">
          <a href="${ROUTES.PROFILE}" class="navbar__dropdown-item" role="menuitem">الملف الشخصي</a>
          ${authService.isAdmin() ? `<a href="${ROUTES.ADMIN}" class="navbar__dropdown-item" role="menuitem">لوحة التحكم</a>` : ''}
          <div class="navbar__dropdown-divider"></div>
          <button class="navbar__dropdown-item navbar__dropdown-item--danger" id="logout-btn" role="menuitem">تسجيل الخروج</button>
        </div>
      </div>
    `;
  }

  #setActiveLink() {
    this.#el.querySelectorAll('.navbar__nav-link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('navbar__nav-link--active', isCurrentPath(href));
    });
  }

  #bind() {
    const burger = $('#navbar-burger', this.#el);
    const nav    = $('#navbar-nav', this.#el);
    burger?.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.classList.toggle('navbar__burger--active', !open);
      nav?.classList.toggle('navbar__nav--open', !open);
    });

    const toggle   = $('#user-toggle', this.#el);
    const dropdown = $('#user-dropdown', this.#el);
    toggle?.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      dropdown?.classList.toggle('navbar__dropdown--open', !open);
    });

    document.addEventListener('click', (e) => {
      if (!this.#el.querySelector('.navbar__user')?.contains(e.target)) {
        dropdown?.classList.remove('navbar__dropdown--open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });

    $('#logout-btn', this.#el)?.addEventListener('click', async () => {
      await authService.clearSession();
      window.location.href = ROUTES.HOME;
    });
  }
}

export default Navbar;
