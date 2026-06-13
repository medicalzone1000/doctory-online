// ─────────────────────────────────────────
//  PROFILE PAGE CONTROLLER
// ─────────────────────────────────────────
import { requireAuth }   from '../router/guards.js';
import Navbar            from '../components/common/Navbar.js';
import authApi           from '../api/auth.api.js';
import authService       from '../services/auth.service.js';
import toast             from '../components/common/Toast.js';
import { validateForm, showFieldError, clearFormErrors, rules } from '../services/validation.service.js';
import { $ }             from '../utils/dom.js';

requireAuth();
new Navbar('#navbar');

// ─── Load current user ───
const user = authService.getUser();

if (user) {
  const nameParts = (user.name || '').split(' ');
  $('#first-name').value          = nameParts[0] || '';
  $('#last-name').value           = nameParts.slice(1).join(' ') || '';
  $('#bio').value                 = user.bio || '';
  $('#profile-email-input').value = user.email || '';
  $('#profile-name').textContent  = user.name || '—';
  $('#profile-email').textContent = user.email || '—';
  $('#profile-role').textContent  = user.role || 'user';

  // Avatar initials
  const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  $('#profile-avatar').textContent = initials;
}

// ─── Profile form ───
const profileForm    = $('#profile-form');
const profileSaveBtn = $('#profile-save-btn');

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(profileForm);

  const firstName = $('#first-name').value.trim();
  const lastName  = $('#last-name').value.trim();

  if (!firstName) {
    showFieldError($('#first-name'), 'First name is required.');
    return;
  }

  const data = {
    name: `${firstName} ${lastName}`.trim(),
    bio:  $('#bio').value.trim(),
  };

  profileSaveBtn.classList.add('btn--loading');
  profileSaveBtn.disabled = true;

  try {
    const updated = await authApi.updateProfile(data);
    // Update local session
    const currentUser = authService.getUser();
    authService.setSession({
      token:        authService.getToken(),
      refreshToken: authService.getRefreshToken(),
      user:         { ...currentUser, ...data },
    });

    $('#profile-name').textContent = data.name;
    const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    $('#profile-avatar').textContent = initials;

    toast.success('Profile updated successfully.');
  } catch (err) {
    toast.error(err.message || 'Could not update profile.');
  } finally {
    profileSaveBtn.classList.remove('btn--loading');
    profileSaveBtn.disabled = false;
  }
});

// ─── Password form ───
const passwordForm    = $('#password-form');
const passwordSaveBtn = $('#password-save-btn');

const newPwdInput = $('#new-password');

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(passwordForm);

  const data = {
    currentPassword: $('#current-password').value,
    newPassword:     newPwdInput.value,
    confirmPassword: $('#confirm-password').value,
  };

  const schema = {
    currentPassword: [rules.required()],
    newPassword:     [rules.required(), rules.strongPassword],
    confirmPassword: [rules.required(), rules.match(newPwdInput.value, 'Passwords do not match')],
  };

  const { valid, errors } = validateForm(data, schema);

  if (!valid) {
    const fieldMap = {
      currentPassword: '#current-password',
      newPassword:     '#new-password',
      confirmPassword: '#confirm-password',
    };
    Object.entries(errors).forEach(([field, msg]) => {
      showFieldError($(fieldMap[field]), msg);
    });
    return;
  }

  passwordSaveBtn.classList.add('btn--loading');
  passwordSaveBtn.disabled = true;

  try {
    await authApi.changePassword({
      currentPassword: data.currentPassword,
      newPassword:     data.newPassword,
    });
    toast.success('Password updated successfully.');
    passwordForm.reset();
  } catch (err) {
    toast.error(err.message || 'Could not update password.');
  } finally {
    passwordSaveBtn.classList.remove('btn--loading');
    passwordSaveBtn.disabled = false;
  }
});
