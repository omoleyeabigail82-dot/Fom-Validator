// --- Theme toggle ---
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const SAVED_THEME = localStorage.getItem('theme');
const SYSTEM_PREFERS_LIGHT =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

const initialTheme = SAVED_THEME || (SYSTEM_PREFERS_LIGHT ? 'light' : 'dark');
html.setAttribute('data-theme', initialTheme);
updateThemeIcon(initialTheme);

function updateThemeIcon(theme) {
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
});

// --- Remember me: load saved data ---
const rememberMe = document.getElementById('rememberMe');
const email = document.getElementById('email');
const username = document.getElementById('username');

const savedRemember = localStorage.getItem('rememberMe') === 'true';
const savedEmail = localStorage.getItem('email') || '';
const savedUsername = localStorage.getItem('username') || '';

rememberMe.checked = savedRemember;
if (savedRemember) {
  email.value = savedEmail;
  username.value = savedUsername;
}

// Save on change
rememberMe.addEventListener('change', () => {
  if (rememberMe.checked) {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('email', email.value.trim());
    localStorage.setItem('username', username.value.trim());
  } else {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
  }
});

// Update stored values when inputs change (if rememberMe is on)
[email, username].forEach(input => {
  input.addEventListener('blur', () => {
    if (rememberMe.checked) {
      localStorage.setItem('email', email.value.trim());
      localStorage.setItem('username', username.value.trim());
    }
  });
});

// --- Form logic ---
const form = document.getElementById('signupForm');
const formStatus = document.getElementById('formStatus');

// Fields
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const fullName = document.getElementById('fullName');
const website = document.getElementById('website'); // honeypot
const newsletter = document.getElementById('newsletter');
const terms = document.getElementById('terms');

// Errors
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmError = document.getElementById('confirmError');
const fullNameError = document.getElementById('fullNameError');
const usernameError = document.getElementById('usernameError');
const termsError = document.getElementById('termsError');

// UI
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const submitBtn = document.getElementById('submitBtn');
const genPassBtn = document.getElementById('genPassBtn');
const cooldownBox = document.getElementById('cooldownBox');
const cooldownTimerEl = document.getElementById('cooldownTimer');

// Steps
const step1 = document.querySelector('.form-step[data-step="1"]');
const step2 = document.querySelector('.form-step[data-step="2"]');
const step3 = document.querySelector('.form-step[data-step="3"]');
const toStep2 = document.getElementById('toStep2');
const toStep3 = document.getElementById('toStep3');
const backToStep1 = document.getElementById('backToStep1');
const backToStep2 = document.getElementById('backToStep2');
const progressBar = document.getElementById('progressBar');
const steps = document.querySelectorAll('.step');

let currentStep = 1;

// Rate limit
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;
let attemptCount = 0;
let inCooldown = false;

// Utility
const dangerousPattern = /<\s*script|on\w+\s*=|javascript:/i;

function setInvalid(input, errorEl, message) {
  input.classList.add('invalid');
  input.classList.remove('valid');
  errorEl.textContent = message;
}

function setValid(input, errorEl) {
  input.classList.remove('invalid');
  input.classList.add('valid');
  errorEl.textContent = '';
}

function updateProgress() {
  const pct = (currentStep / 3) * 100;
  progressBar.style.width = pct + '%';
  steps.forEach((s, idx) => {
    const n = idx + 1;
    s.classList.toggle('active', n === currentStep);
    s.tabIndex = n === currentStep ? 0 : -1;
  });
}

function showStep(n) {
  [step1, step2, step3].forEach((el, idx) => {
    el.hidden = idx + 1 !== n;
  });
  currentStep = n;
  updateProgress();
  const firstInput = form.querySelector(`.form-step[data-step="${n}"] input, .form-step[data-step="${n}"] button`);
  if (firstInput) firstInput.focus();
}

// Validation functions
function validateEmail() {
  const value = email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    setInvalid(email, emailError, 'Email is required.');
    return false;
  }
  if (!emailRegex.test(value)) {
    setInvalid(email, emailError, 'Enter a valid email address.');
    return false;
  }
  if (dangerousPattern.test(value)) {
    setInvalid(email, emailError, 'Invalid characters detected.');
    return false;
  }
  setValid(email, emailError);
  return true;
}

function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 5);
}

function updateStrengthUI(pwd) {
  const score = passwordStrength(pwd);
  const pct = (score / 5) * 100;
  strengthBar.style.width = pct + '%';
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  strengthText.textContent = pwd ? labels[score] : '';
}

function validatePassword() {
  const pwd = password.value;
  updateStrengthUI(pwd);

  if (!pwd) {
    setInvalid(password, passwordError, 'Password is required.');
    return false;
  }
  if (pwd.length < 8) {
    setInvalid(password, passwordError, 'Password must be at least 8 characters.');
    return false;
  }
  if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd)) {
    setInvalid(password, passwordError, 'Include upper, lower, number, and symbol.');
    return false;
  }
  if (dangerousPattern.test(pwd)) {
    setInvalid(password, passwordError, 'Invalid characters detected.');
    return false;
  }
  setValid(password, passwordError);
  return true;
}

function validateConfirmPassword() {
  if (!confirmPassword.value) {
    setInvalid(confirmPassword, confirmError, 'Please confirm your password.');
    return false;
  }
  if (confirmPassword.value !== password.value) {
    setInvalid(confirmPassword, confirmError, 'Passwords do not match.');
    return false;
  }
  setValid(confirmPassword, confirmError);
  return true;
}

function validateFullName() {
  const value = fullName.value.trim();
  if (!value) {
    setInvalid(fullName, fullNameError, 'Full name is required.');
    return false;
  }
  if (value.length < 2) {
    setInvalid(fullName, fullNameError, 'Name must be at least 2 characters.');
    return false;
  }
  if (dangerousPattern.test(value)) {
    setInvalid(fullName, fullNameError, 'Invalid characters detected.');
    return false;
  }
  setValid(fullName, fullNameError);
  return true;
}

function validateUsername() {
  const value = username.value.trim();
  if (!value) {
    setValid(username, usernameError); // optional
    return true;
  }
  if (value.length < 3) {
    setInvalid(username, usernameError, 'Username must be at least 3 characters.');
    return false;
  }
  if (dangerousPattern.test(value)) {
    setInvalid(username, usernameError, 'Invalid characters detected.');
    return false;
  }
  setValid(username, usernameError);
  return true;
}

function validateTerms() {
  if (!terms.checked) {
    setInvalid(terms, termsError, 'You must agree to continue.');
    return false;
  }
  setValid(terms, termsError);
  return true;
}

// Step transitions
toStep2.addEventListener('click', () => {
  const okEmail = validateEmail();
  const okPass = validatePassword();
  const okConfirm = validateConfirmPassword();
  if (okEmail && okPass && okConfirm) {
    showStep(2);
    formStatus.textContent = 'Step 2 of 3: Profile details';
  } else {
    formStatus.textContent = 'Please fix the errors in Step 1.';
  }
});

toStep3.addEventListener('click', () => {
  const okName = validateFullName();
  const okUser = validateUsername();
  if (okName && okUser) {
    showStep(3);
    formStatus.textContent = 'Step 3 of 3: Preferences';
  } else {
    formStatus.textContent = 'Please fix the errors in Step 2.';
  }
});

backToStep1.addEventListener('click', () => {
  showStep(1);
  formStatus.textContent = 'Step 1 of 3: Account details';
});

backToStep2.addEventListener('click', () => {
  showStep(2);
  formStatus.textContent = 'Step 2 of 3: Profile details';
});

// Real-time validation
email.addEventListener('blur', validateEmail);
password.addEventListener('input', () => {
  validatePassword();
  if (confirmPassword.value) validateConfirmPassword();
});
confirmPassword.addEventListener('input', validateConfirmPassword);
fullName.addEventListener('blur', validateFullName);
username.addEventListener('blur', validateUsername);
terms.addEventListener('change', validateTerms);

// Generate strong password
function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const syms = '!@#$%^&*()-_=+[]{};:,.<>?';
  const all = upper + lower + nums + syms;

  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += syms[Math.floor(Math.random() * syms.length)];

  for (let i = 4; i < 14; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  const arr = pwd.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

genPassBtn.addEventListener('click', () => {
  const pwd = generatePassword();
  password.value = pwd;
  confirmPassword.value = pwd;
  validatePassword();
  validateConfirmPassword();
  navigator.clipboard.writeText(pwd).catch(() => {});
});

// Show/Hide password toggles
const toggleButtons = document.querySelectorAll('.toggle-visibility');

toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const inputId = btn.getAttribute('data-target');
    const input = document.getElementById(inputId);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    btn.textContent = isHidden ? '🙈' : '👁️';
    input.focus();
  });
});

// Submit with rate-limit simulation
function startCooldown() {
  inCooldown = true;
  let seconds = COOLDOWN_SECONDS;
  cooldownBox.hidden = false;
  cooldownTimerEl.textContent = seconds;

  const interval = setInterval(() => {
    seconds--;
    cooldownTimerEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      cooldownBox.hidden = true;
      inCooldown = false;
      attemptCount = 0;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
    }
  }, 1000);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (inCooldown) {
    return;
  }

  // Honeypot
  if (website.value.trim() !== '') {
    attemptCount++;
    if (attemptCount >= MAX_ATTEMPTS) {
      startCooldown();
    }
    return;
  }

  const okTerms = validateTerms();
  const okEmail = validateEmail();
  const okPass = validatePassword();
  const okConfirm = validateConfirmPassword();
  const okName = validateFullName();
  const okUser = validateUsername();

  if (!(okTerms && okEmail && okPass && okConfirm && okName && okUser)) {
    attemptCount++;
    if (attemptCount >= MAX_ATTEMPTS) {
      startCooldown();
    }
    formStatus.textContent = 'Submission failed. Please fix the errors.';
    return;
  }

  // Success path
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';
  formStatus.textContent = 'Submitting...';

  setTimeout(() => {
    alert('Form is valid! In a real app, this would send data to your server.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
    form.reset();
    [email, password, confirmPassword, fullName, username, terms, rememberMe].forEach(i => {
      i.classList.remove('valid', 'invalid');
    });
    strengthBar.style.width = '0%';
    strengthText.textContent = '';
    [emailError, passwordError, confirmError, fullNameError, usernameError, termsError].forEach(
      el => (el.textContent = '')
    );
    showStep(1);
    formStatus.textContent = 'Step 1 of 3: Account details';
    attemptCount = 0;

    // Restore remember me state
    const stillRemember = localStorage.getItem('rememberMe') === 'true';
    if (stillRemember) {
      email.value = localStorage.getItem('email') || '';
      username.value = localStorage.getItem('username') || '';
      rememberMe.checked = true;
    }
  }, 900);
});

// Init
showStep(1);
formStatus.textContent = 'Step 1 of 3: Account details';