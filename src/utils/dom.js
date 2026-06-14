// ─────────────────────────────────────────
//  DOM UTILITIES
// ─────────────────────────────────────────

/**
 * Select a single element
 * @param {string} selector
 * @param {Element} [context=document]
 */
export const $ = (selector, context = document) =>
  context.querySelector(selector);

/**
 * Select all matching elements
 * @param {string} selector
 * @param {Element} [context=document]
 */
export const $$ = (selector, context = document) =>
  [...context.querySelectorAll(selector)];

/**
 * Create an element with optional attributes and children
 * @param {string} tag
 * @param {Object} [attrs={}]
 * @param {Array} [children=[]]
 */
export const createElement = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'class') {
      el.className = val;
    } else if (key === 'html') {
      el.innerHTML = val;
    } else if (key === 'text') {
      el.textContent = val;
    } else if (key.startsWith('data-')) {
      el.setAttribute(key, val);
    } else if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      el.setAttribute(key, val);
    }
  });
  children.forEach(child => {
    if (typeof child === 'string') el.insertAdjacentHTML('beforeend', child);
    else el.appendChild(child);
  });
  return el;
};

/**
 * Add/remove/toggle/check classes
 */
export const addClass    = (el, ...cls) => el?.classList.add(...cls);
export const removeClass = (el, ...cls) => el?.classList.remove(...cls);
export const toggleClass = (el, cls, force) => el?.classList.toggle(cls, force);
export const hasClass    = (el, cls) => el?.classList.contains(cls);

/**
 * Show / hide elements
 */
export const show = (el) => el && (el.hidden = false);
export const hide = (el) => el && (el.hidden = true);
export const toggle = (el, visible) => el && (el.hidden = visible === undefined ? !el.hidden : !visible);

/**
 * Set inner HTML safely (via sanitize utility)
 */
export const setHTML = (el, html) => {
  if (el) el.innerHTML = html;
};

/**
 * Set text content
 */
export const setText = (el, text) => {
  if (el) el.textContent = text;
};

/**
 * Get / set data attributes
 */
export const getData = (el, key) => el?.dataset[key];
export const setData = (el, key, val) => { if (el) el.dataset[key] = val; };

/**
 * Delegate event listener (event bubbling)
 * @param {Element} parent
 * @param {string} event
 * @param {string} selector
 * @param {Function} handler
 */
export const delegate = (parent, event, selector, handler) => {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
};

/**
 * Wait for DOM ready
 */
export const onReady = (fn) => {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
};

/**
 * Scroll to element
 */
export const scrollTo = (el, offset = 0) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
};

/**
 * Get query params as object
 */
export const getParams = () =>
  Object.fromEntries(new URLSearchParams(window.location.search));

/**
 * Get a single query param
 */
export const getParam = (key) =>
  new URLSearchParams(window.location.search).get(key);

/**
 * Update URL without page reload
 */
export const updateUrl = (params) => {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  });
  window.history.pushState({}, '', url);
};

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle a function
 */
export const throttle = (fn, limit = 200) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) { last = now; fn(...args); }
  };
};

/**
 * Trap focus within a container (for modals/dialogs)
 */
export const trapFocus = (container) => {
  const focusable = container.querySelectorAll(
    'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  const handler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
    }
  };
  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
};

/**
 * Emit a custom event
 */
export const emit = (name, detail = {}, target = document) => {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
};

/**
 * Listen for a custom event
 */
export const on = (name, handler, target = document) => {
  target.addEventListener(name, handler);
  return () => target.removeEventListener(name, handler);
};