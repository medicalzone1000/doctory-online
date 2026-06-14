// ─────────────────────────────────────────
//  LOGIN PAGE CONTROLLER
// ─────────────────────────────────────────
import bootstrap        from '../bootstrap.js';
import { requireGuest } from '../router/guards.js';
import authApi          from '../api/auth.api.js';
import authService      from '../services/auth.service.js';
import toast            from '../components/common/Toast.js';
import { validateForm, showFieldError, clearFormErrors, rules } from '../services/validation.service.js';
import { $, getParam }  from '../utils/dom.js';

await bootstrap();
if (!(await requireGuest())) {
  throw new Error('redirect');
}

const form = $('#login-form');
const submitBtn = $('#submit-btn');

const schema = {
  email:    [rules.required, rules.email],
  password: [rules.required],
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(form);

  const data = Object.fromEntries(new FormData(form));
  const { valid, errors } = validateForm(data, schema);

  if (!valid) {
    Object.entries(errors).forEach(([field, msg]) => {
      showFieldError(form.querySelector(`[name="${field}"]`), msg);
    });
    return;
  }

  submitBtn.classList.add('btn--loading');
  submitBtn.disabled = true;

  try {
    await authApi.login(data);
    await authService.setSession();
    toast.success('Logged in successfully!');
    setTimeout(() => authService.redirectAfterLogin(), 600);
  } catch (err) {
    toast.error(err.message || 'Login failed. Please try again.');
    submitBtn.classList.remove('btn--loading');
    submitBtn.disabled = false;
  }
});

const reason = getParam('reason');
if (reason === 'session_expired') toast.warning('Your session expired. Please log in again.');
if (reason === 'auth_required')   toast.info('Please log in to continue.');
