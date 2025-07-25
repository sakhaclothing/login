document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const turnstileToken = document.querySelector('input[name="cf-turnstile-response"]')?.value;
    const termsAccepted = document.getElementById('termsCheckbox').checked;

    // Basic validation
    if (!username || !password) {
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

    const loginData = { 
        username, 
        password, 
        "cf-turnstile-response": turnstileToken 
    };

    fetch('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            document.cookie = `token=${data.token}; expires=${new Date(Date.now() + 24*60*60*1000).toUTCString()}; path=/`;
            alert('Login berhasil!');
            window.location.href = 'https://sakhaclothing.shop/';
        } else {
            alert(data.error || 'Login gagal. Silakan coba lagi.');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    });
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
            return fetch('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Email tidak terdaftar');
                }
                return email;
            })
            .catch(error => {
                Swal.showValidationMessage('Email tidak terdaftar dalam sistem');
            });
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
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
