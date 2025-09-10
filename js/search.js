function initializeSearchBar() {
  const searchBar = document.querySelector(".search-bar");
  const searchResultsContainer = document.getElementById("search-results");

  if (!searchBar || !searchResultsContainer) {
    return;
  }

  let allProducts = [];

  // Fetch products once
  getAvailableProducts().then((products) => {
    allProducts = products;
  });

  searchBar.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();
    searchResultsContainer.innerHTML = "";

    if (searchTerm.length === 0) {
      searchResultsContainer.style.display = "none";
      return;
    }

    const filteredProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );

    if (filteredProducts.length > 0) {
      filteredProducts.forEach((product) => {
        const resultItem = document.createElement("a");
        resultItem.href = `${getBasePath()}views/shop/product-detail.html?id=${
          product.code
        }`;
        resultItem.className =
          "list-group-item list-group-item-action bg-dark text-white border-secondary";
        resultItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${getBasePath()}img/products/${
          product.image
        }" alt="${
          product.name
        }" style="width: 40px; height: 40px; object-fit: cover; margin-right: 8px;">
                        <div>
                            <h6 class="mb-0">${product.name}</h6>
                            <small>${product.price.toLocaleString(
                              "es-CL"
                            )}</small>
                        </div>
                    </div>
                `;
        searchResultsContainer.appendChild(resultItem);
      });
      searchResultsContainer.style.display = "block";
    } else {
      searchResultsContainer.innerHTML =
        '<a href="#" class="list-group-item bg-dark text-white border-secondary">No se encontraron productos.</a>';
      searchResultsContainer.style.display = "block";
    }
  });

  // Hide search results when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !searchBar.contains(event.target) &&
      !searchResultsContainer.contains(event.target)
    ) {
      searchResultsContainer.style.display = "none";
    }
  });
}

// Remove the DOMContentLoaded listener from here
