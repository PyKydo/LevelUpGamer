function getBasePath() {
  const path = window.location.pathname;

  if (
    path.includes("/views/shop/") ||
    path.includes("/views/auth/") ||
    path.includes("/admin/")
  ) {
    return "../../";
  } else if (path.includes("/views/")) {
    return "../";
  } else {
    return "";
  }
}

function loadComponent(url, elementId, callback) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return response.text();
    })
    .then((data) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = data;
        if (callback) {
          callback();
        }
      }
    })
    .catch((error) => {
      console.error(`Error loading component ${url} into ${elementId}:`, error);
    });
}

function updatePaths(elementId) {
  if (window.location.protocol === "file:") {
    const basePath = getBasePath();
    const element = document.getElementById(elementId);

    if (element) {
      element.querySelectorAll('a[href^="/"]').forEach((a) => {
        const originalHref = a.getAttribute("href");
        if (originalHref.startsWith("/")) {
          a.href = basePath + originalHref.substring(1);
        }
      });

      element.querySelectorAll('img[src^="/"]').forEach((img) => {
        const originalSrc = img.getAttribute("src");
        if (originalSrc.startsWith("/")) {
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
    localStorage.setItem("adminProducts", JSON.stringify(products));
  } catch (error) {
    products = JSON.parse(localStorage.getItem("adminProducts")) || [];
  }
  return products;
}

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;

    if (currentPath === linkPath) {
      link.classList.add("active");
    }
  });
});