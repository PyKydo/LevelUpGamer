document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

const USERS_STORAGE_KEY = 'adminUsers';

async function getUsers() {
    let users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));
    if (!users || users.length === 0) {
        try {
            const response = await fetch('/data/users.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            users = await response.json();
            saveUsers(users);
        } catch (error) {
            users = [];
        }
    }
    return users;
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

async function loadUsers() {
    const userTableBody = document.getElementById('user-table-body');
    if (!userTableBody) return;

    const users = await getUsers();
    userTableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <a href="/views/admin/user-form.html?id=${user.id}" class="btn btn-warning btn-sm">Editar</a>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(event, '${user.id}')">Eliminar</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

async function deleteUser(event, userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        let users = await getUsers();
        const initialLength = users.length;
        users = users.filter(user => user.id !== userId);

        if (users.length < initialLength) {
            saveUsers(users);
            loadUsers();
        }
    }
}
