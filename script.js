import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/api.min.js";
import { setCookieWithExpireHour, getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/cookie.min.js";
import { validateEmail, validateRequired } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/validate.min.js";
import { showLoading, hideLoading } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/loading.min.js";

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const turnstileToken = document.querySelector('input[name="cf-turnstile-response"]')?.value;
    const termsAccepted = document.getElementById('termsCheckbox').checked;

    // Validation using jscroot validate
    if (!validateRequired(username) || !validateRequired(password)) {
        alert('Username/email dan password wajib diisi.');
        return;
    }
    
    if (!turnstileToken) {
        alert('CAPTCHA wajib diisi.');
        return;
    }

    // Terms validation
    if (!termsAccepted) {
        alert('Anda harus menyetujui Syarat dan Ketentuan untuk melanjutkan.');
        return;
    }

    showLoading('Logging in...');

    const loginData = { 
        username, 
        password, 
        "cf-turnstile-response": turnstileToken 
    };

    postJSON(
        'https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/login',
        loginData,
        (response) => {
            hideLoading();
            if (response.status === 200 && response.data.token) {
                setCookieWithExpireHour('token', response.data.token, 24);
                alert('Login berhasil!');
                window.location.href = 'https://sakhaclothing.shop/';
            } else {
                alert(response.data.error || 'Login gagal. Silakan coba lagi.');
            }
        }
    );
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
