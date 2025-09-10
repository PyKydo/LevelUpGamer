async function loadProductCard(container, productData) {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}components/product-card.html`);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} for ${basePath}components/product-card.html`
      );
    }
    const template = await response.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;
    const card = tempDiv.firstElementChild;

    card.querySelector(
      "[data-img]"
    ).src = `${basePath}img/products/${productData.image}`;
    card.querySelector("[data-img]").alt = productData.name;
    card.querySelector("[data-title]").textContent = productData.name;
    card.querySelector("[data-description]").textContent =
      productData.description;
    card.querySelector(
      "[data-price]"
    ).textContent = `${productData.price.toLocaleString("es-CL")}`;

    if (productData.category) {
      const badge = card.querySelector("[data-category]");
      const categoryClass = productData.category
        .toLowerCase()
        .replace(/\s/g, "-");
      badge.textContent = productData.category;
      badge.classList.add(`badge-${categoryClass}`);
    }

    const addToCartButton = card.querySelector(".add-to-cart");
    if (addToCartButton) {
      addToCartButton.setAttribute(
        "onclick",
        `addToCart('${productData.code}')`
      );
    }

    const productLinks = card.querySelectorAll("[data-product-link]");
    if (productLinks.length > 0) {
      productLinks.forEach((link) => {
        link.href = `${basePath}views/shop/product-detail.html?id=${productData.code}`;
      });
    }

    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.appendChild(card);

    container.appendChild(col);
  } catch (error) {}
}