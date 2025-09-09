document.addEventListener("DOMContentLoaded", async () => {
  const blogContainer = document.getElementById("blog-container");
  if (!blogContainer) return;

  try {
    const basePath = getBasePath();
    const [blogResponse, componentResponse] = await Promise.all([
      fetch(`${basePath}data/blogs.json`),
      fetch(`${basePath}components/blog-card.html`)
    ]);

    if (!blogResponse.ok || !componentResponse.ok) {
      throw new Error('Failed to fetch blog data or template');
    }

    const posts = await blogResponse.json();
    const template = await componentResponse.text();

    posts.forEach((post) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = template;
      const card = tempDiv.firstElementChild;

      card.querySelector("[data-img]").src = basePath + post.image.substring(1);
      card.querySelector("[data-img]").alt = post.alt || post.title;
      card.querySelector("[data-title]").textContent = post.title;
      card.querySelector("[data-excerpt]").textContent = post.summary;
      card.querySelector("[data-content]").textContent = post.content;

      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4 blog-col";
      col.appendChild(card);
      blogContainer.appendChild(col);
    });

    document.querySelectorAll('.btn-leer-mas').forEach(btn => {
        btn.addEventListener('click', () => {
            const cardBody = btn.closest('.card-body');
            const extraText = cardBody.querySelector('.extra-text');
            const isExpanded = extraText.style.display === 'block';

            extraText.style.display = isExpanded ? 'none' : 'block';
            btn.textContent = isExpanded ? 'Leer más' : 'Leer menos';
        });
    });

  } catch (error) {
    blogContainer.innerHTML = "<p>Error al cargar las entradas del blog.</p>";
  }
});
