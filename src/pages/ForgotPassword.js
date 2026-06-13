// ─────────────────────────────────────────
//  FORGOT PASSWORD PAGE CONTROLLER
// ─────────────────────────────────────────
import { requireGuest }  from '../router/guards.js';
import authApi           from '../api/auth.api.js';
import toast             from '../components/common/Toast.js';
import { showFieldError, clearFormErrors, rules, validateField } from '../services/validation.service.js';
import { $ }             from '../utils/dom.js';

requireGuest();

const form       = $('#forgot-form');
const submitBtn  = $('#submit-btn');
const stepEmail  = $('#step-email');
const stepSuccess = $('#step-success');
const successMsg = $('#success-message');
const resendBtn  = $('#resend-btn');

let lastEmail = '';

async function sendReset(email) {
  submitBtn.classList.add('btn--loading');
  submitBtn.disabled = true;

  try {
    await authApi.forgotPassword(email);
    lastEmail = email;
    successMsg.textContent = `We sent a password reset link to ${email}.`;
    stepEmail.style.display = 'none';
    stepSuccess.style.display = 'block';
  } catch (err) {
    toast.error(err.message || 'Could not send reset email. Please try again.');
    submitBtn.classList.remove('btn--loading');
    submitBtn.disabled = false;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(form);

  const email = $('#email').value.trim();
  const error = validateField(email, [rules.required(), rules.email]);

  if (error) {
    showFieldError($('#email'), error);
    return;
  }

  await sendReset(email);
});

resendBtn.addEventListener('click', async () => {
  if (!lastEmail) return;
  resendBtn.disabled = true;
  resendBtn.textContent = 'Sending…';
  try {
    await authApi.forgotPassword(lastEmail);
    toast.success('Reset link resent!');
  } catch (err) {
    toast.error(err.message || 'Could not resend. Try again.');
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = 'resend';
  }
});
