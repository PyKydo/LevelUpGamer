document.addEventListener('DOMContentLoaded', () => {
    loadComponent('/components/header.html', 'main-header', updateCartIcon);
    loadComponent('/components/footer.html', 'main-footer');
});

function loadComponent(url, elementId, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = data;
                if (callback) {
                    callback();
                }
            }
        })
        .catch(error => {});
}

async function getAvailableProducts() {
    let products = [];
    try {
        const response = await fetch('/data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        localStorage.setItem('adminProducts', JSON.stringify(products));
    } catch (error) {
        products = JSON.parse(localStorage.getItem('adminProducts')) || [];
    }
    return products;
}