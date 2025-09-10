document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('products.html') || currentPath === '/' || currentPath.includes('index.html')) {
        loadProducts();
    }

    if (currentPath.includes('product-detail.html')) {
        loadProductDetail();
    }
});

async function loadProducts() {
    console.log("loadProducts called.");
    const productContainer = document.getElementById('product-list');
    if (!productContainer) {
        console.log("product-list container not found.");
        return;
    }

    const products = await getAvailableProducts();
    console.log("Products retrieved:", products);
    productContainer.innerHTML = ''; 

    if (products.length === 0) {
        productContainer.innerHTML = '<p>No hay productos disponibles.</p>';
        console.log("No products available.");
        return;
    }

    products.forEach(product => {
        loadProductCard(productContainer, product);
    });
}

async function loadProductDetail() {
    const productDetailContainer = document.getElementById('product-detail');
    if (!productDetailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        productDetailContainer.innerHTML = '<p>Producto no encontrado.</p>';
        return;
    }

    const products = await getAvailableProducts();
    const product = products.find(p => p.code === productId);

    if (product) {
        productDetailContainer.innerHTML = `
            <div class="col-md-6">
                <img src="/img/products/${product.image}" class="img-fluid" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <h3>$${product.price.toLocaleString('es-CL')}</h3>
                <button class="btn btn-success" onclick="addToCart('${product.code}')">Añadir al Carrito</button>
            </div>
        `;
    } else {
        productDetailContainer.innerHTML = '<p>Producto no encontrado.</p>';
    }
}