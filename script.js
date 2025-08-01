// JSCROOT Library Usage Examples
// ==============================

// Wait for jscroot to be ready
function waitForJscroot() {
    return new Promise((resolve) => {
        if (window.jscroot) {
            resolve();
        } else {
            document.addEventListener('jscroot-ready', resolve);
        }
    });
}

// Example 1: Form Validation using jscroot
async function validateLoginForm() {
    await waitForJscroot();

    const username = window.jscroot.getValue('username').trim();
    const password = window.jscroot.getValue('password').trim();

    // Validate required fields
    if (!window.jscroot.validateRequired(username)) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Username/email wajib diisi.',
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
        return false;
    }

    if (!window.jscroot.validateRequired(password)) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Password wajib diisi.',
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
        return false;
    }

    // Validate email if username is email
    if (username.includes('@') && !window.jscroot.validateEmail(username)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email Tidak Valid',
            text: 'Format email tidak valid.',
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
        return false;
    }

    return true;
}

// Example 2: API calls using jscroot
async function loginWithJscroot(username, password, turnstileToken) {
    await waitForJscroot();

    try {
        // Show loading
        window.jscroot.showLoading('Logging in...');

        // Use jscroot API functions
        const response = await window.jscroot.post(
            'https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/login',
            { username, password, "cf-turnstile-response": turnstileToken }
        );

        // Hide loading
        window.jscroot.hideLoading();

        if (response.status === 200 && response.data.token) {
            // Store token in localStorage
            localStorage.setItem('token', response.data.token);

            // Set cookie for session management
            window.jscroot.setCookieWithExpireHour('user_session', 'active', 24);

            // Get browser info for analytics
            const browserInfo = {
                browser: window.jscroot.getBrowser(),
                os: window.jscroot.getOS(),
                device: window.jscroot.getDevice()
            };

            console.log('Browser Info:', browserInfo);

            // Success alert
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                text: 'Anda akan dialihkan ke halaman utama.',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true
            }).then(() => {
                window.location.href = 'https://sakhaclothing.shop/';
            });
        } else {
            throw new Error(response.data.error || 'Login failed');
        }
    } catch (error) {
        window.jscroot.hideLoading();
        Swal.fire({
            icon: 'error',
            title: 'Login Gagal',
            text: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
    }
}

// Example 3: URL parameter handling
async function handleUrlParameters() {
    await waitForJscroot();

    // Get URL parameters
    const redirectUrl = window.jscroot.getUrlParam('redirect');
    const message = window.jscroot.getUrlParam('message');

    if (redirectUrl) {
        console.log('Redirect URL:', redirectUrl);
    }

    if (message) {
        Swal.fire({
            icon: 'info',
            title: 'Pesan',
            text: decodeURIComponent(message),
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
    }
}

// Example 4: Cookie management
async function checkUserSession() {
    await waitForJscroot();

    const sessionCookie = window.jscroot.getCookie('user_session');
    if (sessionCookie === 'active') {
        console.log('User session is active');
        // Redirect to dashboard if already logged in
        window.location.href = 'https://sakhaclothing.shop/';
    }
}

// Initialize jscroot features
async function initializeJscrootFeatures() {
    await waitForJscroot();

    // Check user session
    await checkUserSession();

    // Handle URL parameters
    await handleUrlParameters();

    // Log browser information
    console.log('Browser:', window.jscroot.getBrowser());
    console.log('OS:', window.jscroot.getOS());
    console.log('Device:', window.jscroot.getDevice());
}

// Original login form handler with jscroot integration
async function setupLoginForm() {
    await waitForJscroot();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Use jscroot validation
            if (!(await validateLoginForm())) {
                return;
            }

            const username = window.jscroot.getValue('username').trim();
            const password = window.jscroot.getValue('password').trim();
            const turnstileToken = document.querySelector('input[name="cf-turnstile-response"]')?.value;
            const termsAccepted = window.jscroot.getElement('termsCheckbox').checked;

            if (!termsAccepted) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Persetujuan Diperlukan',
                    text: 'Anda harus menyetujui Syarat dan Ketentuan untuk melanjutkan.',
                    confirmButtonColor: '#000000',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (!turnstileToken) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: 'CAPTCHA wajib diisi.',
                    confirmButtonColor: '#000000',
                    confirmButtonText: 'OK'
                });
                return;
            }

            // Use jscroot login function
            await loginWithJscroot(username, password, turnstileToken);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Initialize jscroot features
        await initializeJscrootFeatures();

        // Setup login form
        await setupLoginForm();

    } catch (error) {
        console.error('Error initializing login:', error);
    }
});

// Show/hide password logic
document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeOpen = document.getElementById('eyeOpen');
    const eyeClosed = document.getElementById('eyeClosed');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            if (type === 'text') {
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
            } else {
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
            }
        });
    }
});

// Google Sign-In functions
function handleCredentialResponse(response) {
    fetch('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
    })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = '../sakhaclothing.github.io/index.html';
            } else {
                alert('Login gagal: ' + (data.error || 'Unknown error'));
            }
        });
}

function onGoogleLibraryLoad() {
    fetch('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/config/google-client-id')
        .then(res => res.json())
        .then(data => {
            const clientId = data.client_id;
            if (window.google && google.accounts && google.accounts.id) {
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse
                });
                google.accounts.id.renderButton(
                    document.getElementById('google-signin-placeholder'),
                    { theme: 'outline', size: 'large', text: 'signin_with', width: 250 }
                );
            }
        });
}

// Forgot password link
document.addEventListener('DOMContentLoaded', function () {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();
            Swal.fire({
                icon: 'info',
                title: 'Lupa Password',
                text: 'Silakan hubungi admin untuk reset password.',
                confirmButtonColor: '#000000',
                confirmButtonText: 'OK'
            });
        });
    }
});
