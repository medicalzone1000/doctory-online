// ─────────────────────────────────────────
//  MODAL COMPONENT
// ─────────────────────────────────────────
import { trapFocus, emit } from '../../utils/dom.js';

class Modal {
  #el;
  #overlay;
  #releaseFocus;
  #onConfirm;

  constructor() {
    this.#build();
  }

  #build() {
    this.#overlay = document.createElement('div');
    this.#overlay.className = 'modal-overlay';
    this.#overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal__header">
          <h3 class="modal__title" id="modal-title"></h3>
          <button class="modal__close btn btn--ghost btn--icon" aria-label="Close">&times;</button>
        </div>
        <div class="modal__body"></div>
        <div class="modal__footer"></div>
      </div>
    `;

    this.#el = this.#overlay.querySelector('.modal');
    this.#overlay.addEventListener('click', (e) => { if (e.target === this.#overlay) this.close(); });
    this.#overlay.querySelector('.modal__close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    document.body.appendChild(this.#overlay);
  }

  open({ title = '', body = '', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm = null, danger = false } = {}) {
    this.#el.querySelector('.modal__title').textContent = title;
    this.#el.querySelector('.modal__body').innerHTML   = body;
    this.#onConfirm = onConfirm;

    const footer = this.#el.querySelector('.modal__footer');
    footer.innerHTML = '';

    if (cancelText) {
      const cancel = document.createElement('button');
      cancel.className = 'btn btn--secondary';
      cancel.textContent = cancelText;
      cancel.addEventListener('click', () => this.close());
      footer.appendChild(cancel);
    }

    if (onConfirm) {
      const confirm = document.createElement('button');
      confirm.className = `btn ${danger ? 'btn--danger' : 'btn--primary'}`;
      confirm.textContent = confirmText;
      confirm.addEventListener('click', () => { this.#onConfirm?.(); this.close(); });
      footer.appendChild(confirm);
    }

    this.#overlay.classList.add('modal-overlay--open');
    document.body.style.overflow = 'hidden';
    this.#releaseFocus = trapFocus(this.#el);
    this.#el.querySelector('.modal__close').focus();
    emit('modal:open');
  }

  close() {
    this.#overlay.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    this.#releaseFocus?.();
    emit('modal:close');
  }

  confirm({ title, message, onConfirm, danger = false }) {
    this.open({ title, body: `<p>${message}</p>`, confirmText: danger ? 'Delete' : 'Confirm', onConfirm, danger });
  }
}

export const modal = new Modal();
export default modal;