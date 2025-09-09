function loadComponent(url, elementId) {
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;
    })
    .catch((error) => {});
}

function getBasePath() {
  const path = window.location.pathname;
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  const segments = dirPath.split('/').filter(segment => segment.length > 0);
  const depth = segments.length;

  if (depth === 0) {
    return "";
  } else {
    return "../".repeat(depth);
  }
}

function updatePaths(elementId) {
  const basePath = getBasePath();
  const element = document.getElementById(elementId);

  if (element) {
    element.querySelectorAll('a[href^="/"]').forEach((a) => {
      a.href = basePath + a.getAttribute("href").substring(1);
    });

    element.querySelectorAll('img[src^="/"]').forEach((img) => {
      img.src = basePath + img.getAttribute("src").substring(1);
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("header")) {
    loadComponent(getBasePath() + "components/header.html", "header");
    setTimeout(() => updatePaths("header"), 100);
  }

  if (document.getElementById("footer")) {
    loadComponent(getBasePath() + "components/footer.html", "footer");
    setTimeout(() => updatePaths("footer"), 100);
  }

  if (document.getElementById("admin-sidebar")) {
    loadComponent(getBasePath() + "components/admin-sidebar.html", "admin-sidebar");
    setTimeout(() => updatePaths("admin-sidebar"), 100);
  }
});