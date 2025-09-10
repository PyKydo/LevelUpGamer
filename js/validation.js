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
    const lastName = document.getElementById('lastName').value;
    const run = document.getElementById('run').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const birthdate = document.getElementById('birthdate').value;
    const userType = document.getElementById('userType').value;
    const region = document.getElementById('region').value;
    const commune = document.getElementById('commune').value;
    const address = document.getElementById('address').value;

    // Basic validations (already present or updated)
    if (!validateLength(name, 1, 50)) {
        alert('El nombre es requerido y no debe exceder los 50 caracteres.');
        return;
    }
    if (!validateLength(lastName, 1, 100)) {
        alert('Los apellidos son requeridos y no deben exceder los 100 caracteres.');
        return;
    }
    if (!validateRun(run)) {
        alert('El RUN ingresado no es válido.');
        return;
    }
    if (!validateEmail(email)) {
        alert('Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        return;
    }
    if (!validateLength(password, 4, 10)) {
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
    if (!userType) {
        alert('Debe seleccionar un tipo de usuario.');
        return;
    }
    if (!region) {
        alert('Debe seleccionar una región.');
        return;
    }
    if (!commune) {
        alert('Debe seleccionar una comuna.');
        return;
    }
    if (!validateLength(address, 1, 300)) {
        alert('La dirección es requerida y no debe exceder los 300 caracteres.');
        return;
    }

    // Check if user already exists
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.email === email || user.run === run);
    if (userExists) {
        alert('Ya existe un usuario registrado con este correo o RUN.');
        return;
    }

    // Generate a simple ID (for academic purposes)
    const newUserId = 'user' + (users.length + 1).toString().padStart(3, '0');

    const newUser = {
        id: newUserId,
        name: name,
        lastName: lastName,
        run: run,
        email: email,
        password: password, // In a real app, hash this!
        birthdate: birthdate,
        userType: userType,
        region: region,
        commune: commune,
        address: address
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    localStorage.setItem('currentUserEmail', email); // Log in the new user
    // Apply discount logic
    const isDuocEmail = email.endsWith('@duoc.cl') || email.endsWith('@profesor.duoc.cl');
    if (isDuocEmail) {
        alert('¡Registro exitoso! Como estudiante o profesor de Duoc UC, has recibido un 20% de descuento en tu primera compra. ¡Bienvenido a LevelUp Gamer!');
    } else {
        alert('Registro exitoso. ¡Bienvenido a LevelUp Gamer!');
    }
    window.location.href = '/views/auth/login.html'; // Redirect to login page
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

function validateRun(run) {
    if (!run) return false;
    run = run.replace(/[^0-9kK]/g, '').toUpperCase();
    if (!/^([0-9]{7,8})([0-9K])$/.test(run)) return false;

    let cuerpo = run.slice(0, -1);
    let dv = run.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        if (multiplo < 7) {
            multiplo++;
        } else {
            multiplo = 2;
        }
    }

    let dvEsperado = 11 - (suma % 11);
    if (dvEsperado === 11) {
        dvEsperado = '0';
    } else if (dvEsperado === 10) {
        dvEsperado = 'K';
    } else {
        dvEsperado = dvEsperado.toString();
    }

    return dv === dvEsperado;
}

function validateLength(value, min, max) {
    if (!value) return false;
    return value.length >= min && value.length <= max;
}

function logout() {
    localStorage.removeItem('currentUserEmail');
    alert('Sesión cerrada.');
    window.location.href = '/';
}