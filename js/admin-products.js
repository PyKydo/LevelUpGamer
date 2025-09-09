document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

const PRODUCTS_STORAGE_KEY = 'adminProducts';

async function getProducts() {
    let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
    if (!products || products.length === 0) {
        try {
            const response = await fetch('/data/products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            saveProducts(products);
        } catch (error) {
            products = [];
        }
    }
    return products;
}

function saveProducts(products) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

async function loadProducts() {
    const productTableBody = document.getElementById('product-table-body');
    if (!productTableBody) return;

    const products = await getProducts();
    productTableBody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toLocaleString('es-CL')}</td>
            <td>${product.stock}</td>
            <td>
                <a href="/views/admin/product-form.html?id=${product.code}" class="btn btn-warning btn-sm">Editar</a>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(event, '${product.code}')">Eliminar</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

async function deleteProduct(event, productId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        let products = await getProducts();
        const initialLength = products.length;
        products = products.filter(product => product.code !== productId);

        if (products.length < initialLength) {
            saveProducts(products);
            loadProducts();
        }
    }
}
