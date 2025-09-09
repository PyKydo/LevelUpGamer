document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
});

function getCart() {
    const cartData = localStorage.getItem('cart');
    return JSON.parse(cartData) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
}

function addToCart(productId) {
    let cart = getCart();
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart(cart);
    alert('Producto añadido al carrito.');
}

function updateCartIcon() {
    const cart = getCart();
    const cartIcon = document.getElementById('cart-count');
    if (cartIcon) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIcon.textContent = totalItems;
    }
}

async function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const discountElement = document.getElementById('cart-discount');
    const finalTotalElement = document.getElementById('cart-final-total');

    if (!cartItemsContainer || !cartTotalElement) return;

    const cart = getCart();
    const products = await getAvailableProducts(); 

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="6">El carrito está vacío.</td></tr>';
        cartTotalElement.textContent = '0';
        if (discountElement) discountElement.textContent = '0';
        if (finalTotalElement) finalTotalElement.textContent = '0';
        return;
    }

    cart.forEach(item => {
        const product = products.find(p => p.code === item.id); 
        if (product) {
            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            const cartRow = document.createElement('tr');
            cartRow.innerHTML = `
                <td><img src="/img/products/${product.image}" alt="${product.name}" style="width: 50px;"></td>
                <td>${product.name}</td>
                <td>$${product.price.toLocaleString('es-CL')}</td>
                <td>${item.quantity}</td>
                <td>$${itemSubtotal.toLocaleString('es-CL')}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Eliminar</button></td>
            `;
            cartItemsContainer.appendChild(cartRow);
        } 
    });

    cartTotalElement.textContent = subtotal.toLocaleString('es-CL');

    let discount = 0;
    let finalTotal = subtotal;

    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (currentUserEmail) {
        const isDuocUser = currentUserEmail.endsWith('@duoc.cl') || currentUserEmail.endsWith('@profesor.duoc.cl');
        if (isDuocUser) {
            discount = subtotal * 0.20;
            finalTotal = subtotal - discount;
            if (discountElement) discountElement.textContent = `-${discount.toLocaleString('es-CL')}`;
            alert('¡Felicidades! Se ha aplicado un 20% de descuento por ser usuario Duoc.');
        }
    }

    if (discountElement) discountElement.textContent = discount.toLocaleString('es-CL');
    if (finalTotalElement) finalTotalElement.textContent = finalTotal.toLocaleString('es-CL');
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCartItems();
}