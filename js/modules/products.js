// Módulo de gestión de productos
import { apiService } from "../utils/api.js";
import { Helpers } from "../utils/helpers.js";
import { CONFIG } from "../core/config.js";

class ProductsModule {
  constructor() {
    this.products = [];
    this.categories = [];
    this.filters = {
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    };
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.sortBy = "name";
    this.sortOrder = "asc";
  }

  async init() {
    try {
      console.log("Inicializando módulo de productos...");

      // Cargar productos
      await this.loadProducts();

      // Cargar categorías
      await this.loadCategories();

      // Configurar event listeners
      this.setupEventListeners();

      // Renderizar productos iniciales
      await this.renderProducts();

      console.log("Módulo de productos inicializado correctamente");
    } catch (error) {
      console.error("Error inicializando módulo de productos:", error);
    }
  }

  async loadProducts() {
    try {
      this.products = await apiService.getProducts();
      console.log(`${this.products.length} productos cargados`);
    } catch (error) {
      console.error("Error cargando productos:", error);
      this.products = [];
    }
  }

  async loadCategories() {
    try {
      this.categories = await apiService.getCategories();
      console.log(`${this.categories.length} categorías cargadas`);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      this.categories = [];
    }
  }

  setupEventListeners() {
    // Filtros
    const categoryFilter = document.getElementById("category-filter");
    const searchInput = document.getElementById("search-input");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const stockFilter = document.getElementById("stock-filter");
    const sortSelect = document.getElementById("sort-select");

    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.filters.category = e.target.value;
        this.applyFilters();
      });
    }

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        Helpers.debounce((e) => {
          this.filters.search = e.target.value;
          this.applyFilters();
        }, 300)
      );
    }

    if (minPriceInput) {
      minPriceInput.addEventListener(
        "input",
        Helpers.debounce((e) => {
          this.filters.minPrice = e.target.value;
          this.applyFilters();
        }, 500)
      );
    }

    if (maxPriceInput) {
      maxPriceInput.addEventListener(
        "input",
        Helpers.debounce((e) => {
          this.filters.maxPrice = e.target.value;
          this.applyFilters();
        }, 500)
      );
    }

    if (stockFilter) {
      stockFilter.addEventListener("change", (e) => {
        this.filters.inStock = e.target.checked;
        this.applyFilters();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        const [field, order] = e.target.value.split("-");
        this.sortBy = field;
        this.sortOrder = order;
        this.applyFilters();
      });
    }

    // Botones de agregar al carrito
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-add-to-cart]")) {
        e.preventDefault();
        const productId = e.target.getAttribute("data-product-id");
        this.addToCart(productId);
      }
    });
  }

  async applyFilters() {
    try {
      let filteredProducts = [...this.products];

      // Aplicar filtros
      if (this.filters.category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category === this.filters.category
        );
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
      }

      if (this.filters.minPrice) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= parseFloat(this.filters.minPrice)
        );
      }

      if (this.filters.maxPrice) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price <= parseFloat(this.filters.maxPrice)
        );
      }

      if (this.filters.inStock) {
        filteredProducts = filteredProducts.filter((p) => p.stock > 0);
      }

      // Aplicar ordenamiento
      filteredProducts = this.sortProducts(filteredProducts);

      // Renderizar productos filtrados
      await this.renderProducts(filteredProducts);

      // Actualizar contador de resultados
      this.updateResultsCount(filteredProducts.length);
    } catch (error) {
      console.error("Error aplicando filtros:", error);
    }
  }

  sortProducts(products) {
    return products.sort((a, b) => {
      let aValue = a[this.sortBy];
      let bValue = b[this.sortBy];

      // Manejar diferentes tipos de datos
      if (this.sortBy === "price") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (this.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  async renderProducts(products = null) {
    const container = document.getElementById("products-container");
    if (!container) return;

    const productsToRender = products || this.products;

    if (productsToRender.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-search display-1 text-muted"></i>
          <h3 class="mt-3">No se encontraron productos</h3>
          <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
        </div>
      `;
      return;
    }

    // Mostrar loading
    Helpers.showLoading(container);

    // Simular delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generar HTML de productos
    const productsHTML = productsToRender
      .map((product) => this.createProductCard(product))
      .join("");

    container.innerHTML = `
      <div class="row g-4">
        ${productsHTML}
      </div>
    `;

    // Inicializar lazy loading
    Helpers.lazyLoadImages();
  }

  createProductCard(product) {
    const discount = this.calculateDiscount(product);
    const finalPrice =
      discount > 0 ? product.price * (1 - discount) : product.price;
    const isLowStock = product.stock <= (product.criticalStock || 5);

    return `
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="card product-card h-100">
          <div class="position-relative">
            <img 
              src="../../img/products/${product.image}" 
              class="card-img-top product-img" 
              alt="${product.name}"
              data-src="../../img/products/${product.image}"
            >
            ${
              discount > 0
                ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">-${Math.round(
                    discount * 100
                  )}%</span>`
                : ""
            }
            ${
              isLowStock
                ? `<span class="badge bg-warning position-absolute top-0 start-0 m-2">Stock Bajo</span>`
                : ""
            }
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title product-title">${product.name}</h5>
            <p class="card-text product-description">${product.description.substring(
              0,
              100
            )}...</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span class="h5 text-primary mb-0">${Helpers.formatPrice(
                    finalPrice
                  )}</span>
                  ${
                    discount > 0
                      ? `<small class="text-muted text-decoration-line-through ms-2">${Helpers.formatPrice(
                          product.price
                        )}</small>`
                      : ""
                  }
                </div>
                <small class="text-muted">Stock: ${product.stock}</small>
              </div>
              <div class="d-grid gap-2">
                <a href="product-detail.html?id=${
                  product.code
                }" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-eye me-1"></i>Ver Detalle
                </a>
                <button 
                  class="btn btn-primary btn-sm" 
                  data-add-to-cart 
                  data-product-id="${product.code}"
                  ${product.stock <= 0 ? "disabled" : ""}
                >
                  <i class="bi bi-cart-plus me-1"></i>
                  ${product.stock <= 0 ? "Sin Stock" : "Agregar al Carrito"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  calculateDiscount(product) {
    // Aplicar descuentos según las reglas de negocio
    const user = window.LevelUpGamer?.getStorageItem("user");
    let discount = 0;

    if (user) {
      // Descuento para usuarios registrados
      discount += CONFIG.store.discount.registeredUser;

      // Descuento adicional para emails Duoc
      if (
        Helpers.isValidEmailDomain(user.email, [
          "@duoc.cl",
          "@profesor.duoc.cl",
        ])
      ) {
        discount += CONFIG.store.discount.duocEmail;
      }
    }

    return Math.min(discount, 0.5); // Máximo 50% de descuento
  }

  addToCart(productId) {
    try {
      const product = this.products.find((p) => p.code === productId);
      if (!product) {
        throw new Error("Producto no encontrado");
      }

      if (product.stock <= 0) {
        window.LevelUpGamer?.showNotification(
          "El producto no está disponible",
          "error"
        );
        return;
      }

      // Obtener carrito actual
      let cart = window.LevelUpGamer?.getStorageItem("cart") || [];

      // Verificar si el producto ya está en el carrito
      const existingItem = cart.find((item) => item.productId === productId);

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          window.LevelUpGamer?.showNotification(
            "No hay suficiente stock disponible",
            "error"
          );
          return;
        }
        existingItem.quantity += 1;
      } else {
        cart.push({
          productId: productId,
          quantity: 1,
          addedAt: new Date().toISOString(),
        });
      }

      // Guardar carrito actualizado
      window.LevelUpGamer?.setStorageItem("cart", cart);

      // Mostrar notificación de éxito
      window.LevelUpGamer?.showNotification(
        `${product.name} agregado al carrito`,
        "success"
      );

      // Actualizar contador del carrito
      this.updateCartCounter();
    } catch (error) {
      console.error("Error agregando producto al carrito:", error);
      window.LevelUpGamer?.showNotification(
        "Error al agregar producto al carrito",
        "error"
      );
    }
  }

  updateCartCounter() {
    const cart = window.LevelUpGamer?.getStorageItem("cart") || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const counter = document.querySelector(".cart-counter");
    if (counter) {
      counter.textContent = totalItems;
      counter.style.display = totalItems > 0 ? "inline" : "none";
    }
  }

  updateResultsCount(count) {
    const counter = document.getElementById("results-count");
    if (counter) {
      counter.textContent = `${count} producto${
        count !== 1 ? "s" : ""
      } encontrado${count !== 1 ? "s" : ""}`;
    }
  }

  // Método para renderizar filtros
  renderFilters() {
    const filtersContainer = document.getElementById("filters-container");
    if (!filtersContainer) return;

    filtersContainer.innerHTML = `
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <label for="category-filter" class="form-label">Categoría</label>
          <select class="form-select" id="category-filter">
            <option value="">Todas las categorías</option>
            ${this.categories
              .map(
                (category) => `<option value="${category}">${category}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="col-md-3">
          <label for="search-input" class="form-label">Buscar</label>
          <input type="text" class="form-control" id="search-input" placeholder="Buscar productos...">
        </div>
        <div class="col-md-2">
          <label for="min-price" class="form-label">Precio Mín.</label>
          <input type="number" class="form-control" id="min-price" placeholder="0" min="0">
        </div>
        <div class="col-md-2">
          <label for="max-price" class="form-label">Precio Máx.</label>
          <input type="number" class="form-control" id="max-price" placeholder="999999" min="0">
        </div>
        <div class="col-md-2">
          <label for="sort-select" class="form-label">Ordenar</label>
          <select class="form-select" id="sort-select">
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="price-asc">Precio Menor</option>
            <option value="price-desc">Precio Mayor</option>
          </select>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="stock-filter">
            <label class="form-check-label" for="stock-filter">
              Solo productos con stock
            </label>
          </div>
        </div>
        <div class="col-md-6 text-end">
          <span id="results-count" class="text-muted"></span>
        </div>
      </div>
    `;
  }
}

export default ProductsModule;
