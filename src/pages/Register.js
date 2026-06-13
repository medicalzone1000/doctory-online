// ─────────────────────────────────────────
//  REGISTER PAGE CONTROLLER
// ─────────────────────────────────────────
import { requireGuest }   from '../router/guards.js';
import authApi            from '../api/auth.api.js';
import authService        from '../services/auth.service.js';
import toast              from '../components/common/Toast.js';
import { validateForm, showFieldError, clearFormErrors, rules } from '../services/validation.service.js';
import { $, ROUTES }      from '../utils/dom.js';
import { ROUTES as R }    from '../../config/constants.js';

requireGuest();

const form      = $('#register-form');
const submitBtn = $('#submit-btn');
const pwdInput  = document.getElementById('password');

const getSchema = () => ({
  firstName:       [rules.required(), rules.minLength(2)],
  lastName:        [rules.required(), rules.minLength(2)],
  email:           [rules.required(), rules.email],
  password:        [rules.required(), rules.strongPassword],
  confirmPassword: [rules.required(), rules.match(pwdInput.value, 'Passwords do not match')],
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(form);

  const data = Object.fromEntries(new FormData(form));
  const { valid, errors } = validateForm(data, getSchema());

  if (!valid) {
    Object.entries(errors).forEach(([field, msg]) => {
      showFieldError(form.querySelector(`[name="${field}"]`), msg);
    });
    return;
  }

  submitBtn.classList.add('btn--loading');
  submitBtn.disabled = true;

  try {
    const result = await authApi.register({
      name:     `${data.firstName} ${data.lastName}`,
      email:    data.email,
      password: data.password,
    });
    authService.setSession(result);
    toast.success('Account created! Welcome to MediCore.');
    setTimeout(() => window.location.href = R.HOME, 800);
  } catch (err) {
    toast.error(err.message || 'Registration failed. Please try again.');
    submitBtn.classList.remove('btn--loading');
    submitBtn.disabled = false;
  }
});