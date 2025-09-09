document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const formTitle = document.querySelector('#page-content-wrapper h1');
    const userForm = document.getElementById('user-form');

    const USERS_STORAGE_KEY = 'adminUsers';

    // Helper to get users from localStorage
    function getUsers() {
        return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    }

    // Helper to save users to localStorage
    function saveUsers(users) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    if (userId) {
        formTitle.textContent = 'Editar Usuario';
        const users = getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            document.getElementById('user-run').value = user.run;
            document.getElementById('user-birthdate').value = user.birthdate;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-lastname').value = user.lastname;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-address').value = user.address;
            document.getElementById('user-region').value = user.region;
            document.getElementById('user-commune').value = user.commune;

            document.getElementById('user-run').disabled = true; // Disable RUN for editing
        } else {
            // If user not found, redirect to add new user form
            window.location.href = '/views/admin/user-form.html';
            return;
        }
    }

    userForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const run = document.getElementById('user-run').value;
        const birthdate = document.getElementById('user-birthdate').value;
        const name = document.getElementById('user-name').value;
        const lastname = document.getElementById('user-lastname').value;
        const email = document.getElementById('user-email').value;
        const role = document.getElementById('user-role').value;
        const address = document.getElementById('user-address').value;
        const region = document.getElementById('user-region').value;
        const commune = document.getElementById('user-commune').value;

        const userData = {
            id: userId || 'user_' + Date.now(), // Generate a simple ID for new users
            run,
            birthdate,
            name,
            lastname,
            email,
            role,
            address,
            region,
            commune
        };

        let users = getUsers();

        if (userId) {
            // Update existing user
            const index = users.findIndex(u => u.id === userId);
            if (index !== -1) {
                users[index] = { ...users[index], ...userData };
                console.log('Usuario actualizado:', userData);
            }
        } else {
            // Add new user
            // Basic validation: check for unique RUN
            if (users.some(u => u.run === run)) {
                alert('Error: El RUN de usuario ya existe.');
                return;
            }
            users.push(userData);
            console.log('Nuevo usuario añadido:', userData);
        }

        saveUsers(users);
        // Redirect back to the user list page
        window.location.href = '/views/admin/users.html';
    });
});