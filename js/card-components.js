async function loadProductCard(container, productData) {
  try {
    const response = await fetch("/components/product-card.html");
    const template = await response.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;
    const card = tempDiv.firstChild;

    card.querySelector("[data-img]").src = productData.image;
    card.querySelector("[data-img]").alt = productData.title;
    card.querySelector("[data-title]").textContent = productData.title;
    card.querySelector("[data-description]").textContent =
      productData.description;
    card.querySelector(
      "[data-price]"
    ).textContent = `$${productData.price.toFixed(2)}`;

    if (productData.originalPrice) {
      card.querySelector(
        "[data-original-price]"
      ).textContent = `$${productData.originalPrice.toFixed(2)}`;
    }

    if (productData.category) {
      const badge = card.querySelector("[data-category]");
      badge.textContent = productData.category;
      badge.classList.add(`badge-${productData.category.toLowerCase()}`);
    }

    card
      .querySelector("[data-product-id]")
      .setAttribute("data-product-id", productData.id);
    card.querySelector(
      "[data-product-link]"
    ).href = `/views/shop/product-detail.html?id=${productData.id}`;

    container.appendChild(card);
  } catch (error) {}
}

async function loadBlogCard(container, blogData) {
  try {
    const response = await fetch("/components/blog-card.html");
    const template = await response.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;
    const card = tempDiv.firstChild;

    card.querySelector("[data-img]").src = blogData.image;
    card.querySelector("[data-img]").alt = blogData.title;
    card.querySelector("[data-title]").textContent = blogData.title;
    card.querySelector("[data-excerpt]").textContent = blogData.excerpt;

    const date = new Date(blogData.date);
    card.querySelector("[data-date]").innerHTML = `
            <i class="bi bi-calendar3"></i> ${date.toLocaleDateString()}
        `;

    if (blogData.category) {
      card.querySelector("[data-category]").innerHTML = `
                <i class="bi bi-tag"></i> ${blogData.category}
            `;
    }

    if (blogData.author) {
      card.querySelector("[data-author] span").textContent = blogData.author;
    }

    card.querySelector(
      "[data-blog-link]"
    ).href = `/views/blog-detail.html?id=${blogData.id}`;

    container.appendChild(card);
  } catch (error) {}
}