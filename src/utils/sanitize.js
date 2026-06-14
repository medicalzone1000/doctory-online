// ─────────────────────────────────────────
//  SANITIZE UTILITY
//  All user-generated content must pass through here
// ─────────────────────────────────────────

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'hr',
  'a', 'img', 'code', 'pre', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'class',
  'target', 'rel', 'width', 'height',
  'colspan', 'rowspan',
]);

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * Sanitize an HTML string to remove dangerous content
 * @param {string} html - Raw HTML input
 * @returns {string} - Safe HTML
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return '';

  const template = document.createElement('template');
  template.innerHTML = html;
  sanitizeNode(template.content);
  return template.innerHTML;
};

/**
 * Recursively sanitize a DOM node
 */
const sanitizeNode = (node) => {
  const children = [...node.childNodes];
  children.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        child.replaceWith(...child.childNodes);
        return;
      }
      // Clean attributes
      [...child.attributes].forEach(attr => {
        const attrName = attr.name.toLowerCase();
        if (!ALLOWED_ATTRS.has(attrName)) {
          child.removeAttribute(attr.name);
          return;
        }
        // Validate URLs
        if (['href', 'src'].includes(attrName)) {
          try {
            const url = new URL(attr.value, window.location.origin);
            if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
              child.removeAttribute(attr.name);
            }
          } catch {
            child.removeAttribute(attr.name);
          }
        }
      });
      // Force external links to be safe
      if (tag === 'a') {
        child.setAttribute('rel', 'noopener noreferrer');
        if (!child.getAttribute('target')) {
          child.setAttribute('target', '_blank');
        }
      }
      sanitizeNode(child);
    }
  });
};

/**
 * Escape plain text for safe insertion
 * @param {string} text
 * @returns {string}
 */
export const escapeText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Strip all HTML tags from a string (plain text only)
 * @param {string} html
 * @returns {string}
 */
export const stripTags = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Truncate text to a given length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 160) => {
  const clean = stripTags(text);
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
};

/**
 * Sanitize a URL string
 * @param {string} url
 * @returns {string|null}
 */
export const sanitizeUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.origin);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) return parsed.href;
    return null;
  } catch {
    return null;
  }
};