document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validateEmail(email)) {
        alert('Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        return;
    }

    if (password.length < 4 || password.length > 10) {
        alert('La contraseña debe tener entre 4 y 10 caracteres.');
        return;
    }

    localStorage.setItem('currentUserEmail', email);
    alert('Inicio de sesión exitoso (simulado).');
    window.location.href = '/';
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const birthdate = document.getElementById('birthdate').value;

    if (!name || name.length > 100) {
        alert('El nombre es requerido y no debe exceder los 100 caracteres.');
        return;
    }

    if (!validateEmail(email)) {
        alert('Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        return;
    }

    if (password.length < 4 || password.length > 10) {
        alert('La contraseña debe tener entre 4 y 10 caracteres.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    if (!validateAge(birthdate)) {
        alert('Debes ser mayor de 18 años para registrarte.');
        return;
    }

    localStorage.setItem('currentUserEmail', email);
    alert('Registro exitoso (simulado).');
    window.location.href = '/views/auth/login.html';
}

function handleContactSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const comment = document.getElementById('comment').value;

    if (!name || name.length > 100) {
        alert('El nombre es requerido y no debe exceder los 100 caracteres.');
        return;
    }

    if (!validateEmail(email)) {
        alert('Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        return;
    }

    if (!comment || comment.length > 500) {
        alert('El comentario es requerido y no debe exceder los 500 caracteres.');
        return;
    }

    alert('Mensaje enviado con éxito (simulado).');
    event.target.reset();
}

function validateEmail(email) {
    if (!email) return false;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) return false;

    const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    return allowedDomains.some(domain => email.endsWith(domain));
}

function validateAge(birthdateString) {
    if (!birthdateString) return false;

    const birthdate = new Date(birthdateString);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age >= 18;
}

function logout() {
    localStorage.removeItem('currentUserEmail');
    alert('Sesión cerrada.');
    window.location.href = '/';
}