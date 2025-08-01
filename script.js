// JSCROOT Library Usage Examples
// ==============================

// Example 1: Form Validation using jscroot
function validateLoginForm() {
    const username = window.jscroot.getElement('username').value.trim();
    const password = window.jscroot.getElement('password').value.trim();

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
function handleUrlParameters() {
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
function checkUserSession() {
    const sessionCookie = window.jscroot.getCookie('user_session');
    if (sessionCookie === 'active') {
        console.log('User session is active');
        // Redirect to dashboard if already logged in
        window.location.href = 'https://sakhaclothing.shop/';
    }
}

// Initialize jscroot features
document.addEventListener('DOMContentLoaded', function () {
    // Check user session
    checkUserSession();

    // Handle URL parameters
    handleUrlParameters();

    // Log browser information
    console.log('Browser:', window.jscroot.getBrowser());
    console.log('OS:', window.jscroot.getOS());
    console.log('Device:', window.jscroot.getDevice());
});

// Original login form handler with jscroot integration
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Use jscroot validation
    if (!validateLoginForm()) {
        return;
    }

    const username = window.jscroot.getElement('username').value.trim();
    const password = window.jscroot.getElement('password').value.trim();
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
    loginWithJscroot(username, password, turnstileToken);
});

// Show/hide password logic
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const eyeOpen = document.getElementById('eyeOpen');
const eyeClosed = document.getElementById('eyeClosed');
let passwordVisible = false;

togglePassword.addEventListener('click', function () {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? 'text' : 'password';
    if (passwordVisible) {
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
    } else {
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
    }
});

document.getElementById('forgotPasswordLink').addEventListener('click', function (e) {
    e.preventDefault();
    Swal.fire({
        title: 'Lupa Password',
        text: 'Masukkan email yang terdaftar untuk reset password.',
        input: 'email',
        inputPlaceholder: 'Email',
        showCancelButton: true,
        confirmButtonText: 'Kirim',
        confirmButtonColor: '#000000',
        cancelButtonText: 'Batal',
        preConfirm: (email) => {
            if (!email) {
                Swal.showValidationMessage('Email wajib diisi');
                return false;
            }
            // Cek email ke backend
            return fetch('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.valid) {
                        Swal.showValidationMessage(data.error || 'Email tidak terdaftar');
                        return false;
                    }
                    return email;
                })
                .catch(() => {
                    Swal.showValidationMessage('Gagal cek email, coba lagi.');
                    return false;
                });
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            // Kirim request ke endpoint forgot-password
            fetch('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: result.value })
            })
                .then(res => res.text())
                .then(msg => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Cek Email Anda',
                        text: 'Jika email terdaftar, link reset password telah dikirim.',
                        confirmButtonColor: '#000000'
                    });
                })
                .catch(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: 'Terjadi kesalahan, silakan coba lagi.',
                        confirmButtonColor: '#000000'
                    });
                });
        }
    });
});
