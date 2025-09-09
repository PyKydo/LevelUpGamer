document.addEventListener("DOMContentLoaded", () => {
  const blogContainer = document.getElementById("blog-container");

  fetch("/data/blogs.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("col-md-6", "col-lg-4", "blog-col");

        postElement.innerHTML = `
          <div class="card blog-card">
            <img src="${post.image}" class="card-img-top" alt="${post.alt}">
            <div class="card-body">
              <h5 class="card-title">${post.title}</h5>
              <p class="card-text">${post.summary}</p>
              <div class="extra-text">${post.content}</div>
              <button class="btn btn-primary btn-leer-mas" type="button">Leer más</button>
            </div>
          </div>
        `;

        blogContainer.appendChild(postElement);
      });

      document.querySelectorAll('.btn-leer-mas').forEach(btn => {
          btn.addEventListener('click', () => {
              const cardBody = btn.closest('.card-body');
              cardBody.classList.toggle('expanded');
              btn.textContent = cardBody.classList.contains('expanded') ? 'Leer menos' : 'Leer más';
          });
      });
    })
    .catch((error) => {});
});