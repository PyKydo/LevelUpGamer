document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('products.html')) {
        loadProducts();
    }

    if (window.location.pathname.includes('product-detail.html')) {
        loadProductDetail();
    }
});

async function loadProducts() {
    const productContainer = document.getElementById('product-list');
    if (!productContainer) return;

    const products = await getAvailableProducts(); // Use global function
    productContainer.innerHTML = ''; 

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-md-4 mb-4';
        productCard.innerHTML = `
            <div class="card">
                <a href="/views/shop/product-detail.html?id=${product.code}">
                    <img src="/img/products/${product.image}" class="card-img-top" alt="${product.name}">
                </a>
                <div class="card-body">
                    <a href="/views/shop/product-detail.html?id=${product.code}" class="text-decoration-none text-white">
                        <h5 class="card-title">${product.name}</h5>
                    </a>
                    <p class="card-text">$${product.price.toLocaleString('es-CL')}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-success btn-sm" onclick="addToCart('${product.code}')">Añadir al Carrito</button>
                    </div>
                </div>
            </div>
        `;
        productContainer.appendChild(productCard);
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

    const products = await getAvailableProducts(); // Use global function
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