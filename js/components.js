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
  const depth = path.split("/").length - 2;
  // Si estamos en la raíz o en index.html, no necesitamos ../
  if (path === "/" || path.endsWith("/index.html")) {
    return "";
  }
  return depth > 0 ? "../".repeat(depth) : "./";
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
});
