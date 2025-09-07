// Módulo de gestión del carrito de compras
import { apiService } from "../utils/api.js";
import { Helpers } from "../utils/helpers.js";
import { CONFIG } from "../core/config.js";

class CartModule {
  constructor() {
    this.cart = [];
    this.products = [];
    this.total = 0;
    this.subtotal = 0;
    this.discount = 0;
  }

  async init() {
    try {
      console.log("Inicializando módulo del carrito...");

      // Cargar productos
      await this.loadProducts();

      // Cargar carrito del storage
      this.loadCart();

      // Configurar event listeners
      this.setupEventListeners();

      // Renderizar carrito
      await this.renderCart();

      console.log("Módulo del carrito inicializado correctamente");
    } catch (error) {
      console.error("Error inicializando módulo del carrito:", error);
    }
  }

  async loadProducts() {
    try {
      this.products = await apiService.getProducts();
    } catch (error) {
      console.error("Error cargando productos para el carrito:", error);
      this.products = [];
    }
  }

  loadCart() {
    this.cart = window.LevelUpGamer?.getStorageItem("cart") || [];
    this.calculateTotals();
  }

  setupEventListeners() {
    // Event listeners para botones del carrito
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-cart-increase]")) {
        const productId = e.target.getAttribute("data-product-id");
        this.increaseQuantity(productId);
      }

      if (e.target.matches("[data-cart-decrease]")) {
        const productId = e.target.getAttribute("data-product-id");
        this.decreaseQuantity(productId);
      }

      if (e.target.matches("[data-cart-remove]")) {
        const productId = e.target.getAttribute("data-product-id");
        this.removeItem(productId);
      }

      if (e.target.matches("[data-cart-clear]")) {
        this.clearCart();
      }

      if (e.target.matches("[data-cart-checkout]")) {
        this.proceedToCheckout();
      }
    });

    // Event listener para cambios en el carrito
    document.addEventListener("cart:updated", () => {
      this.loadCart();
      this.renderCart();
    });
  }

  async renderCart() {
    const container = document.getElementById("cart-container");
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-cart-x display-1 text-muted"></i>
          <h3 class="mt-3">Tu carrito está vacío</h3>
          <p class="text-muted">Agrega algunos productos para comenzar</p>
          <a href="products.html" class="btn btn-primary">
            <i class="bi bi-arrow-left me-2"></i>Continuar Comprando
          </a>
        </div>
      `;
      return;
    }

    // Mostrar loading
    Helpers.showLoading(container);

    // Simular delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Generar HTML del carrito
    const cartItems = this.cart
      .map((item) => this.createCartItem(item))
      .join("");

    container.innerHTML = `
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-cart3 me-2"></i>Carrito de Compras
              </h5>
              <button class="btn btn-outline-danger btn-sm" data-cart-clear>
                <i class="bi bi-trash me-1"></i>Vaciar Carrito
              </button>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cartItems}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-receipt me-2"></i>Resumen de Compra
              </h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${Helpers.formatPrice(this.subtotal)}</span>
              </div>
              ${
                this.discount > 0
                  ? `
                <div class="d-flex justify-content-between mb-2 text-success">
                  <span>Descuento:</span>
                  <span>-${Helpers.formatPrice(this.discount)}</span>
                </div>
              `
                  : ""
              }
              <hr>
              <div class="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong class="text-primary">${Helpers.formatPrice(
                  this.total
                )}</strong>
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-primary btn-lg" data-cart-checkout>
                  <i class="bi bi-credit-card me-2"></i>Proceder al Pago
                </button>
                <a href="products.html" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-left me-2"></i>Continuar Comprando
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createCartItem(item) {
    const product = this.products.find((p) => p.code === item.productId);
    if (!product) return "";

    const itemPrice = this.calculateItemPrice(product);
    const itemSubtotal = itemPrice * item.quantity;
    const isLowStock = product.stock <= (product.criticalStock || 5);

    return `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <img 
              src="../../img/products/${product.image}" 
              alt="${product.name}"
              class="rounded me-3"
              style="width: 60px; height: 60px; object-fit: cover;"
            >
            <div>
              <h6 class="mb-1">${product.name}</h6>
              <small class="text-muted">${product.category}</small>
              ${
                isLowStock
                  ? '<br><small class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>Stock bajo</small>'
                  : ""
              }
            </div>
          </div>
        </td>
        <td>
          <span class="fw-bold">${Helpers.formatPrice(itemPrice)}</span>
          ${
            itemPrice < product.price
              ? `<br><small class="text-muted text-decoration-line-through">${Helpers.formatPrice(
                  product.price
                )}</small>`
              : ""
          }
        </td>
        <td>
          <div class="input-group" style="width: 120px;">
            <button 
              class="btn btn-outline-secondary btn-sm" 
              type="button"
              data-cart-decrease
              data-product-id="${product.code}"
              ${item.quantity <= 1 ? "disabled" : ""}
            >
              <i class="bi bi-dash"></i>
            </button>
            <input 
              type="number" 
              class="form-control form-control-sm text-center" 
              value="${item.quantity}" 
              min="1" 
              max="${product.stock}"
              readonly
            >
            <button 
              class="btn btn-outline-secondary btn-sm" 
              type="button"
              data-cart-increase
              data-product-id="${product.code}"
              ${item.quantity >= product.stock ? "disabled" : ""}
            >
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </td>
        <td>
          <span class="fw-bold text-primary">${Helpers.formatPrice(
            itemSubtotal
          )}</span>
        </td>
        <td>
          <button 
            class="btn btn-outline-danger btn-sm"
            data-cart-remove
            data-product-id="${product.code}"
            title="Eliminar del carrito"
          >
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  calculateItemPrice(product) {
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

    return product.price * (1 - Math.min(discount, 0.5));
  }

  calculateTotals() {
    this.subtotal = 0;
    this.discount = 0;

    this.cart.forEach((item) => {
      const product = this.products.find((p) => p.code === item.productId);
      if (product) {
        const originalPrice = product.price * item.quantity;
        const discountedPrice =
          this.calculateItemPrice(product) * item.quantity;

        this.subtotal += discountedPrice;
        this.discount += originalPrice - discountedPrice;
      }
    });

    this.total = this.subtotal;
  }

  increaseQuantity(productId) {
    const item = this.cart.find((item) => item.productId === productId);
    const product = this.products.find((p) => p.code === productId);

    if (item && product && item.quantity < product.stock) {
      item.quantity += 1;
      this.saveCart();
      this.renderCart();
      window.LevelUpGamer?.showNotification("Cantidad actualizada", "success");
    } else if (item && product && item.quantity >= product.stock) {
      window.LevelUpGamer?.showNotification(
        "No hay suficiente stock disponible",
        "error"
      );
    }
  }

  decreaseQuantity(productId) {
    const item = this.cart.find((item) => item.productId === productId);

    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.saveCart();
      this.renderCart();
      window.LevelUpGamer?.showNotification("Cantidad actualizada", "success");
    } else if (item && item.quantity === 1) {
      this.removeItem(productId);
    }
  }

  removeItem(productId) {
    const product = this.products.find((p) => p.code === productId);
    this.cart = this.cart.filter((item) => item.productId !== productId);
    this.saveCart();
    this.renderCart();

    if (product) {
      window.LevelUpGamer?.showNotification(
        `${product.name} eliminado del carrito`,
        "info"
      );
    }
  }

  clearCart() {
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      this.cart = [];
      this.saveCart();
      this.renderCart();
      window.LevelUpGamer?.showNotification("Carrito vaciado", "info");
    }
  }

  saveCart() {
    window.LevelUpGamer?.setStorageItem("cart", this.cart);

    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent("cart:updated"));
  }

  proceedToCheckout() {
    // Verificar que el usuario esté autenticado
    const user = window.LevelUpGamer?.getStorageItem("user");

    if (!user) {
      window.LevelUpGamer?.showNotification(
        "Debes iniciar sesión para continuar",
        "error"
      );
      // Redirigir al login
      setTimeout(() => {
        window.location.href = "../auth/login.html";
      }, 2000);
      return;
    }

    // Verificar stock de todos los productos
    const outOfStockItems = this.cart.filter((item) => {
      const product = this.products.find((p) => p.code === item.productId);
      return product && product.stock < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      window.LevelUpGamer?.showNotification(
        "Algunos productos no tienen suficiente stock",
        "error"
      );
      return;
    }

    // Proceder al checkout (simulado)
    window.LevelUpGamer?.showNotification(
      "Redirigiendo al proceso de pago...",
      "info"
    );

    // Aquí se implementaría la lógica de checkout real
    setTimeout(() => {
      // Simular proceso de pago exitoso
      this.cart = [];
      this.saveCart();
      this.renderCart();
      window.LevelUpGamer?.showNotification(
        "¡Compra realizada con éxito!",
        "success"
      );
    }, 3000);
  }

  // Método para obtener resumen del carrito
  getCartSummary() {
    return {
      items: this.cart.length,
      totalItems: this.cart.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: this.subtotal,
      discount: this.discount,
      total: this.total,
    };
  }
}

export default CartModule;
