import { getValue, getChecked } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/element.min.js';
import { postApi } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/api.min.js';
import { validateNotEmpty } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/validate.min.js';
import { setLocalStorage } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/cookie.min.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Pastikan ini berjalan
        e.stopPropagation(); // Tambahan untuk memastikan
        
        console.log('Form submit intercepted'); // Debug log

        const username = getValue('username').trim();
        const password = getValue('password').trim();
        const turnstileToken = document.querySelector('input[name="cf-turnstile-response"]')?.value;
        const termsAccepted = getChecked('termsCheckbox');

        if (!validateNotEmpty('username') || !validateNotEmpty('password')) {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Username/email dan password wajib diisi.',
                confirmButtonColor: '#000000'
            });
            return;
        }

        if (!termsAccepted) {
            Swal.fire({
                icon: 'warning',
                title: 'Persetujuan Diperlukan',
                text: 'Anda harus menyetujui Syarat dan Ketentuan untuk melanjutkan.',
                confirmButtonColor: '#000000'
            });
            return;
        }

        if (!turnstileToken) {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: 'CAPTCHA wajib diisi.',
                confirmButtonColor: '#000000'
            });
            return;
        }

        Swal.fire({
            title: 'Logging in...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const payload = {
            username,
            password,
            "cf-turnstile-response": turnstileToken
        };

        postApi('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/login', payload, (res) => {
            if (res.token) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: 'Anda akan dialihkan ke halaman utama.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    setLocalStorage('token', res.token);
                    window.location.href = 'https://sakhaclothing.shop/';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: res.error || 'Username atau password salah.',
                    confirmButtonColor: '#000000'
                });
            }
        }, () => {
            Swal.fire({
                icon: 'error',
                title: 'Koneksi Error',
                text: 'Terjadi kesalahan pada koneksi/server. Silakan coba lagi.',
                confirmButtonColor: '#000000'
            });
        });
    });
});
