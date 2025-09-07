// Aplicación principal de Level-Up Gamer
class LevelUpGamerApp {
  constructor() {
    this.config = {
      baseUrl: window.location.origin,
      apiEndpoints: {
        products: "/data/products.json",
        users: "/data/users.json",
      },
      storageKeys: {
        cart: "levelup_cart",
        user: "levelup_user",
        theme: "levelup_theme",
      },
    };

    this.modules = {};
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log("Inicializando Level-Up Gamer App...");

      // Cargar módulos principales
      await this.loadModules();

      // Inicializar componentes
      await this.initializeComponents();

      // Configurar event listeners globales
      this.setupGlobalEventListeners();

      this.isInitialized = true;
      console.log("Level-Up Gamer App inicializada correctamente");

      // Disparar evento personalizado
      document.dispatchEvent(new CustomEvent("app:initialized"));
    } catch (error) {
      console.error("Error inicializando la aplicación:", error);
      this.handleError(error);
    }
  }

  async loadModules() {
    // Los módulos se cargarán dinámicamente según la página
    const currentPage = this.getCurrentPage();

    switch (currentPage) {
      case "products":
        await this.loadModule("products");
        break;
      case "cart":
        await this.loadModule("cart");
        break;
      case "admin":
        await this.loadModule("admin");
        break;
      case "auth":
        await this.loadModule("auth");
        break;
    }
  }

  async loadModule(moduleName) {
    try {
      const module = await import(`../modules/${moduleName}.js`);
      this.modules[moduleName] = module.default;

      if (this.modules[moduleName].init) {
        await this.modules[moduleName].init();
      }
    } catch (error) {
      console.warn(
        `Módulo ${moduleName} no encontrado o error al cargar:`,
        error
      );
    }
  }

  async initializeComponents() {
    // Inicializar componentes comunes
    if (typeof window.loadComponents === "function") {
      await window.loadComponents();
    }
  }

  setupGlobalEventListeners() {
    // Event listeners globales
    document.addEventListener("DOMContentLoaded", () => {
      this.handleDOMReady();
    });

    // Manejo de errores globales
    window.addEventListener("error", (event) => {
      this.handleError(event.error);
    });

    // Manejo de errores de promesas no capturadas
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(event.reason);
    });
  }

  handleDOMReady() {
    // Lógica específica cuando el DOM está listo
    this.updateActiveNavigation();
    this.initializeTooltips();
  }

  updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (
        link.getAttribute("href") === currentPath ||
        (currentPath.includes("products") &&
          link.getAttribute("href").includes("products"))
      ) {
        link.classList.add("active");
      }
    });
  }

  initializeTooltips() {
    // Inicializar tooltips de Bootstrap si están disponibles
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;

    if (path.includes("/admin/")) return "admin";
    if (path.includes("/auth/")) return "auth";
    if (path.includes("/shop/cart")) return "cart";
    if (path.includes("/shop/products") || path.includes("/products"))
      return "products";

    return "home";
  }

  handleError(error) {
    console.error("Error en la aplicación:", error);

    // Mostrar notificación de error al usuario
    this.showNotification(
      "Ha ocurrido un error. Por favor, recarga la página.",
      "error"
    );
  }

  showNotification(message, type = "info") {
    // Crear notificación toast
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${
      type === "error" ? "danger" : "primary"
    } border-0`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    // Agregar al contenedor de toasts
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className =
        "toast-container position-fixed top-0 end-0 p-3";
      document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    // Mostrar toast
    if (typeof bootstrap !== "undefined" && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
    }
  }

  // Métodos de utilidad
  formatPrice(price) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  }

  formatDate(date) {
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  }

  getStorageItem(key) {
    try {
      const item = localStorage.getItem(this.config.storageKeys[key] || key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error al obtener item del storage:", error);
      return null;
    }
  }

  setStorageItem(key, value) {
    try {
      localStorage.setItem(
        this.config.storageKeys[key] || key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error("Error al guardar item en storage:", error);
    }
  }
}

// Inicializar la aplicación
const app = new LevelUpGamerApp();

// Hacer disponible globalmente
window.LevelUpGamer = app;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}

export default app;
