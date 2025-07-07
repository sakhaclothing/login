document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Username/email dan password wajib diisi.',
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Show loading state
    Swal.fire({
        title: 'Logging in...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX login menggunakan fetch API
    fetch('https://asia-southeast2-ornate-course-437014-u9.cloudfunctions.net/sakha/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok && data.token) {
                // Success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: 'Anda akan dialihkan ke halaman utama.',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'https://sakhaclothing.shop/';
                });
            } else {
                // Error alert
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: data.error || 'Username atau password salah. Silakan coba lagi.',
                    confirmButtonColor: '#000000',
                    confirmButtonText: 'OK'
                });
            }
        })
        .catch(() => {
            // Network error alert
            Swal.fire({
                icon: 'error',
                title: 'Koneksi Error',
                text: 'Terjadi kesalahan pada koneksi/server. Silakan coba lagi.',
                confirmButtonColor: '#000000',
                confirmButtonText: 'OK'
            });
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
            }
            return email;
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