// ─────────────────────────────────────────
//  TOAST COMPONENT
// ─────────────────────────────────────────
import { TOAST_DURATION, TOAST_TYPES } from '../../../config/constants.js';

class ToastManager {
  #container;

  constructor() {
    this.#createContainer();
  }

  #createContainer() {
    this.#container = document.createElement('div');
    this.#container.id = 'toast-container';
    this.#container.setAttribute('aria-live', 'polite');
    this.#container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(this.#container);
  }

  #show(message, type = TOAST_TYPES.INFO, duration = TOAST_DURATION) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');

    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <span class="toast__message">${message}</span>
      <button class="toast__close" aria-label="Close">&times;</button>
    `;

    toast.querySelector('.toast__close').addEventListener('click', () => this.#dismiss(toast));
    this.#container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    if (duration > 0) setTimeout(() => this.#dismiss(toast), duration);
    return toast;
  }

  #dismiss(toast) {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  success(msg, duration) { return this.#show(msg, TOAST_TYPES.SUCCESS, duration); }
  error(msg, duration)   { return this.#show(msg, TOAST_TYPES.ERROR, duration); }
  warning(msg, duration) { return this.#show(msg, TOAST_TYPES.WARNING, duration); }
  info(msg, duration)    { return this.#show(msg, TOAST_TYPES.INFO, duration); }
}

export const toast = new ToastManager();
export default toast;