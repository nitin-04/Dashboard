document.addEventListener('DOMContentLoaded', () => {
  // 1. Handle Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const alertBox = document.getElementById('alert-box');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('spinner');
    const btnText = submitBtn.querySelector('.btn-text');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset errors
      emailError.textContent = '';
      passwordError.textContent = '';
      alertBox.classList.add('d-none');
      alertBox.className = 'alert d-none';

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Client-side required field validation
      let hasError = false;
      if (!email) {
        emailError.textContent = 'Email is required';
        hasError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'Please enter a valid email address';
        hasError = true;
      }

      if (!password) {
        passwordError.textContent = 'Password is required';
        hasError = true;
      } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        hasError = true;
      }

      if (hasError) return;

      // Loading state
      submitBtn.disabled = true;
      spinner.classList.remove('d-none');
      btnText.textContent = 'Signing in...';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alertBox.textContent = 'Login successful! Redirecting...';
          alertBox.className = 'alert alert-success';
          alertBox.classList.remove('d-none');

          // Browser received httpOnly cookie automatically. Redirect to dashboard.
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 600);
        } else {
          // Display server-side validation/auth error
          const errorMessage =
            Array.isArray(data.message)
              ? data.message.join(', ')
              : data.message || 'Invalid email or password';
          alertBox.textContent = errorMessage;
          alertBox.className = 'alert alert-danger';
          alertBox.classList.remove('d-none');
        }
      } catch (err) {
        alertBox.textContent = 'Connection error. Please try again later.';
        alertBox.className = 'alert alert-danger';
        alertBox.classList.remove('d-none');
      } finally {
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
        btnText.textContent = 'Sign In';
      }
    });
  }

  // 2. Handle Logout Button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      logoutBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          window.location.href = '/login';
        } else {
          window.location.href = '/login';
        }
      } catch (err) {
        window.location.href = '/login';
      }
    });
  }

  // 3. Handle Mobile Sidebar Drawer Toggle
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  const openSidebar = () => {
    if (sidebar && sidebarOverlay) {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
    }
  };

  const closeSidebar = () => {
    if (sidebar && sidebarOverlay) {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    }
  };

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', openSidebar);
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }
});
