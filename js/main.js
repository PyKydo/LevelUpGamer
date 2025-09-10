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

// Global callback for regions JSONP
window.handleRegionsResponse = function(data) {
  const regionSelect = document.getElementById('region');
  if (!regionSelect) return;

  regionSelect.innerHTML = '<option value="">Seleccione Región</option>';
  data.forEach(region => {
    const option = document.createElement('option');
    option.value = region.codigo;
    option.textContent = region.nombre;
    regionSelect.appendChild(option);
  });
};

// Global callback for communes JSONP
window.handleCommunesResponse = function(data) {
  const communeSelect = document.getElementById('commune');
  if (!communeSelect) return;

  communeSelect.innerHTML = '<option value="">Seleccione Comuna</option>';
  data.forEach(commune => {
    const option = document.createElement('option');
    option.value = commune.codigo;
    option.textContent = commune.nombre;
    communeSelect.appendChild(option);
  });
};

function loadJSONP(url, callbackName) {
  const script = document.createElement('script');
  script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
  script.async = true;
  document.head.appendChild(script);
  script.onload = function() {
    document.head.removeChild(script);
  };
  script.onerror = function() {
    console.error('Error loading JSONP script:', url);
    document.head.removeChild(script);
  };
}

function loadRegions() {
  loadJSONP('https://apis.digital.gob.cl/dpa/regiones', 'handleRegionsResponse');
}

function loadCommunes(regionCode) {
  if (!regionCode) return;
  loadJSONP(`https://apis.digital.gob.cl/dpa/regiones/${regionCode}/comunas`, 'handleCommunesResponse');
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

  // Load regions and set up commune loading for register page
  if (currentPath.includes('/views/auth/register.html')) {
    loadRegions();

    const regionSelect = document.getElementById('region');
    const communeSelect = document.getElementById('commune');

    if (communeSelect) {
      communeSelect.disabled = true;
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', (event) => {
        const selectedRegionCode = event.target.value;
        if (selectedRegionCode) {
          if (communeSelect) {
            communeSelect.disabled = false;
          }
          loadCommunes(selectedRegionCode);
        } else {
          if (communeSelect) {
            communeSelect.disabled = true;
            communeSelect.innerHTML = '<option value="">Seleccione Comuna</option>';
          }
        }
      });
    }
  }
});