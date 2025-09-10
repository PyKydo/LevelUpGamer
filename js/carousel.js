document.addEventListener('DOMContentLoaded', async () => {
    const carouselContainer = document.getElementById('carousel-products-container');
    if (!carouselContainer) return;

    const products = await getAvailableProducts();
    const carouselProducts = products.slice(0, 3);

    if (carouselProducts.length === 0) {
        carouselContainer.innerHTML = '<p>No hay productos para el carrusel.</p>';
        return;
    }

    carouselProducts.forEach((product, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;

        carouselItem.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 400px; background-color: var(--primary-color);">
                <a href="${getBasePath()}views/shop/product-detail.html?id=${product.code}" class="d-block h-100 w-100 text-decoration-none carousel-image-wrapper">
                    <img src="${getBasePath()}img/products/${product.image}" class="d-block h-100 w-100 object-fit-contain" alt="${product.name}">
                </a>
                <div class="carousel-caption carousel-caption-overlay carousel-caption-hidden">
                    <h5>${product.name}</h5>
                    <p>${product.price.toLocaleString('es-CL')}</p>
                </div>
            </div>
        `;
        carouselContainer.appendChild(carouselItem);
    });
});