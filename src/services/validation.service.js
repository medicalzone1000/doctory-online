// ─────────────────────────────────────────
//  VALIDATION SERVICE
// ─────────────────────────────────────────

/** Check if value is empty */
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

/** Individual validators — each returns an error string or null */
const validators = {
  required: (v, msg = 'This field is required') =>
    isEmpty(v) ? msg : null,

  email: (v) => {
    if (isEmpty(v)) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? null : 'Enter a valid email address';
  },

  minLength: (min) => (v) => {
    if (isEmpty(v)) return null;
    return String(v).length >= min ? null : `Must be at least ${min} characters`;
  },

  maxLength: (max) => (v) => {
    if (isEmpty(v)) return null;
    return String(v).length <= max ? null : `Must be ${max} characters or fewer`;
  },

  min: (min) => (v) => {
    if (isEmpty(v)) return null;
    return Number(v) >= min ? null : `Must be at least ${min}`;
  },

  max: (max) => (v) => {
    if (isEmpty(v)) return null;
    return Number(v) <= max ? null : `Must be at most ${max}`;
  },

  pattern: (regex, msg = 'Invalid format') => (v) => {
    if (isEmpty(v)) return null;
    return regex.test(v) ? null : msg;
  },

  match: (otherValue, msg = 'Values do not match') => (v) =>
    v === otherValue ? null : msg,

  url: (v) => {
    if (isEmpty(v)) return null;
    try { new URL(v); return null; }
    catch { return 'Enter a valid URL'; }
  },

  strongPassword: (v) => {
    if (isEmpty(v)) return null;
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter';
    if (!/[0-9]/.test(v)) return 'Include at least one number';
    return null;
  },
};

/**
 * Validate a single field value against a list of rules
 * @param {*} value
 * @param {Array<Function>} rules
 * @returns {string|null} First error or null
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

/**
 * Validate an entire form data object against a schema
 * @param {Object} data   - { fieldName: value }
 * @param {Object} schema - { fieldName: [rule, rule, ...] }
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateForm = (data, schema) => {
  const errors = {};
  Object.entries(schema).forEach(([field, rules]) => {
    const error = validateField(data[field], rules);
    if (error) errors[field] = error;
  });
  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Show validation error on a form field
 * @param {HTMLElement} input
 * @param {string} message
 */
export const showFieldError = (input, message) => {
  const wrapper = input.closest('.form-group') || input.parentElement;
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  let hint = wrapper.querySelector('.form-hint');
  if (!hint) {
    hint = document.createElement('span');
    hint.className = 'form-hint form-hint--error';
    wrapper.appendChild(hint);
  }
  hint.textContent = message;
  hint.className = 'form-hint form-hint--error';
};

/**
 * Clear validation error on a form field
 */
export const clearFieldError = (input) => {
  const wrapper = input.closest('.form-group') || input.parentElement;
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  const hint = wrapper.querySelector('.form-hint--error');
  if (hint) hint.remove();
};

/**
 * Clear all validation states on a form
 */
export const clearFormErrors = (form) => {
  form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
    el.classList.remove('is-invalid', 'is-valid');
  });
  form.querySelectorAll('.form-hint--error').forEach(el => el.remove());
};

export const rules = validators;
export default { validateField, validateForm, showFieldError, clearFieldError, clearFormErrors, rules };