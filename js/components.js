// Función para cargar componentes HTML
function loadComponent(url, elementId) {
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;
    })
    .catch((error) => console.error("Error cargando el componente:", error));
}

// Ajustar rutas según la profundidad de la página actual
function getBasePath() {
  const path = window.location.pathname;
  // Remove the filename to get the directory path
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  // Split by '/' and filter out empty strings
  const segments = dirPath.split('/').filter(segment => segment.length > 0);
  // The number of '../' needed is the number of segments
  const depth = segments.length;

  if (depth === 0) { // If at root (e.g., /index.html or /)
    return "";
  } else {
    return "../".repeat(depth);
  }
}

// Función para actualizar las rutas en el componente cargado
function updatePaths(elementId) {
  const basePath = getBasePath();
  const element = document.getElementById(elementId);

  if (element) {
    // Actualizar href en enlaces
    element.querySelectorAll('a[href^="/"]').forEach((a) => {
      a.href = basePath + a.getAttribute("href").substring(1);
    });

    // Actualizar src en imágenes
    element.querySelectorAll('img[src^="/"]').forEach((img) => {
      img.src = basePath + img.getAttribute("src").substring(1);
    });
  }
}

// Cargar componentes cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Cargar header
  if (document.getElementById("header")) {
    loadComponent(getBasePath() + "components/header.html", "header");
    setTimeout(() => updatePaths("header"), 100);
  }

  // Cargar footer
  if (document.getElementById("footer")) {
    loadComponent(getBasePath() + "components/footer.html", "footer");
    setTimeout(() => updatePaths("footer"), 100);
  }

  // Cargar admin-sidebar
  if (document.getElementById("admin-sidebar")) {
    loadComponent(getBasePath() + "components/admin-sidebar.html", "admin-sidebar");
    setTimeout(() => updatePaths("admin-sidebar"), 100);
  }
});
