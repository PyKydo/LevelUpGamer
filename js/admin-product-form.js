document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const formTitle = document.getElementById('form-title');
    const productForm = document.getElementById('product-form');

    const PRODUCTS_STORAGE_KEY = 'adminProducts';

    // Helper to get products from localStorage
    function getProducts() {
        return JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];
    }

    // Helper to save products to localStorage
    function saveProducts(products) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }

    if (productId) {
        formTitle.textContent = 'Editar Producto';
        const products = getProducts();
        const product = products.find(p => p.code === productId);
        if (product) {
            document.getElementById('product-code').value = product.code;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-code').disabled = true; // Disable code for editing
        } else {
            // If product not found, redirect to add new product form
            window.location.href = '/views/admin/product-form.html';
            return;
        }
    }

    productForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const code = document.getElementById('product-code').value;
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);
        const image = document.getElementById('product-image').value;
        const description = document.getElementById('product-description').value;

        const productData = {
            code,
            name,
            category,
            price,
            stock,
            image,
            description
        };

        let products = getProducts();

        if (productId) {
            // Update existing product
            const index = products.findIndex(p => p.code === productId);
            if (index !== -1) {
                products[index] = { ...products[index], ...productData };
                console.log('Producto actualizado:', productData);
            }
        } else {
            // Add new product
            // Basic validation: check for unique product code
            if (products.some(p => p.code === code)) {
                alert('Error: El código de producto ya existe.');
                return;
            }
            products.push(productData);
            console.log('Nuevo producto añadido:', productData);
        }

        saveProducts(products);
        // Redirect back to the product list page
        window.location.href = '/views/admin/products.html';
    });
});