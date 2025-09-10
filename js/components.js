function updatePaths(elementId) {
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

document.addEventListener("DOMContentLoaded", function () {
  const basePath = getBasePath();

  if (document.getElementById("header")) {
    loadComponent(basePath + "components/header.html", "header", () => {
        updatePaths("header");
        if (typeof updateCartIcon === 'function') {
            updateCartIcon();
        }
    });
  }
  
  if (document.getElementById("main-header")) {
    loadComponent(basePath + "components/header.html", "main-header", () => {
        updatePaths("main-header");
        if (typeof updateCartIcon === 'function') {
            updateCartIcon();
        }
    });
  }

  if (document.getElementById("footer")) {
    loadComponent(basePath + "components/footer.html", "footer", () => updatePaths("footer"));
  }
  
  if (document.getElementById("main-footer")) {
    loadComponent(basePath + "components/footer.html", "main-footer", () => updatePaths("main-footer"));
  }

  if (document.getElementById("admin-sidebar")) {
    loadComponent(basePath + "components/admin-sidebar.html", "admin-sidebar", () => updatePaths("admin-sidebar"));
  }
});