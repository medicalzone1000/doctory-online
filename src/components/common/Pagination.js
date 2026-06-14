// ─────────────────────────────────────────
//  PAGINATION COMPONENT
// ─────────────────────────────────────────

export class Pagination {
  #container;
  #onChange;

  constructor(selector, onChange) {
    this.#container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.#onChange  = onChange;
  }

  render(currentPage, totalPages) {
    if (!this.#container || totalPages <= 1) {
      if (this.#container) this.#container.innerHTML = '';
      return;
    }

    const pages = this.#getPages(currentPage, totalPages);

    this.#container.innerHTML = `
      <nav class="pagination" aria-label="Pagination">
        <button class="pagination__btn pagination__prev btn btn--ghost btn--sm"
          ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
          ← Prev
        </button>
        <ul class="pagination__list">
          ${pages.map(p => p === '…'
            ? `<li><span class="pagination__ellipsis">…</span></li>`
            : `<li>
                <button class="pagination__btn btn btn--sm ${p === currentPage ? 'btn--primary' : 'btn--ghost'}"
                  data-page="${p}" aria-label="Page ${p}" ${p === currentPage ? 'aria-current="page"' : ''}>
                  ${p}
                </button>
              </li>`
          ).join('')}
        </ul>
        <button class="pagination__btn pagination__next btn btn--ghost btn--sm"
          ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
          Next →
        </button>
      </nav>
    `;

    this.#container.querySelector('.pagination__prev')?.addEventListener('click', () => {
      if (currentPage > 1) this.#onChange(currentPage - 1);
    });
    this.#container.querySelector('.pagination__next')?.addEventListener('click', () => {
      if (currentPage < totalPages) this.#onChange(currentPage + 1);
    });
    this.#container.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => this.#onChange(Number(btn.dataset.page)));
    });
  }

  #getPages(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
  }
}

export default Pagination;