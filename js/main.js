
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
        .catch(error => console.error(`Error loading component ${url}:`, error));
}

async function getAvailableProducts() {
    let products = [];
    try {
        const response = await fetch('/data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        console.log('getAvailableProducts: Products fetched from JSON:', products);
        localStorage.setItem('adminProducts', JSON.stringify(products)); // Always update localStorage
    } catch (error) {
        console.error("Could not fetch products from JSON:", error);
        // Fallback to localStorage if fetching from JSON fails
        products = JSON.parse(localStorage.getItem('adminProducts')) || [];
        console.log('getAvailableProducts: Falling back to localStorage:', products);
    }
    return products;
}
