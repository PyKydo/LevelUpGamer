function getBasePath() {
  const path = window.location.pathname;

  // Check for two levels of nesting (e.g., /views/shop/, /views/auth/, /admin/)
  if (
    path.includes('/views/shop/') ||
    path.includes('/views/auth/') ||
    path.includes('/admin/')
  ) {
    return '../../';
  }
  // Check for one level of nesting (e.g., /views/)
  else if (path.includes('/views/')) {
    return '../';
  }
  // Otherwise, assume root level
  else {
    return '';
  }
}

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
        .catch(error => {
            console.error(`Error loading component ${url} into ${elementId}:`, error);
        });
}

function updatePaths(elementId) {
  // Only apply path adjustments if running from a file:// URL
  if (window.location.protocol === 'file:') {
    const basePath = getBasePath();
    const element = document.getElementById(elementId);

    if (element) {
      element.querySelectorAll('a[href^="/"]').forEach((a) => {
        const originalHref = a.getAttribute("href");
        if (originalHref.startsWith('/')) {
          a.href = basePath + originalHref.substring(1);
        }
      });

      element.querySelectorAll('img[src^="/"]').forEach((img) => {
        const originalSrc = img.getAttribute("src");
         if (originalSrc.startsWith('/')) {
          img.src = basePath + originalSrc.substring(1);
        }
      });
    }
  }
}

async function getAvailableProducts() {
    let products = [];
    try {
        const response = await fetch(`${getBasePath()}data/products.json`);
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

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  navLinks.forEach(link => {
    // Normalize href to match pathname format (e.g., remove leading slash if needed, or ensure it's present)
    // For example, if link.href is "http://localhost/index.html" and currentPath is "/index.html"
    const linkPath = new URL(link.href).pathname;

    if (currentPath === linkPath) {
      link.classList.add('active');
    }
  });
});